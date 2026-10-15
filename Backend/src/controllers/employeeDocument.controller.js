
import mongoose from "mongoose";
import { EmployeeDocument } from "../models/employeeDocument.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { storePrivateDocument, ensurePrivateDocumentExists } from "../services/documentStorage.js";
import { createReadStream } from "node:fs";

const HR_ROLES = ["super_admin", "hr_admin"];

const requireHR = (user) => {
  if (!HR_ROLES.includes(user.role)) {
    throw new ApiError(403, "HR/Admin permission required");
  }
};

const getEmployeeProfile = async (userId) => {
  const employee = await Employee.findOne({ userId }).select("_id");

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  return employee;
};

const ensureDocumentAccess = async (document, user) => {
  if (HR_ROLES.includes(user.role)) return;

  const employee = await Employee.findOne({
    userId: user._id,
  }).select("_id");

  if (
    !employee ||
    String(employee._id) !== String(document.employeeId)
  ) {
    throw new ApiError(403, "You cannot access this document");
  }
};

const ALLOWED_CATEGORIES = [
  "identity",
  "education",
  "employment",
  "contract",
  "salary",
  "other",
];

// POST /api/v1/employee-documents
// HR/Admin uploads a document for an employee.
export const createEmployeeDocument = asyncHandler(async (req, res) => {
  requireHR(req.user);

  const { employeeId, title, category, expiresAt } = req.body;

  if (!mongoose.isValidObjectId(employeeId)) {
    throw new ApiError(400, "Valid employee ID is required");
  }

  if (!title?.trim()) {
    throw new ApiError(400, "Document title is required");
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new ApiError(400, "Invalid document category");
  }

  if (!req.file) {
    throw new ApiError(400, "Please upload a document file");
  }

  if (
    !["application/pdf", "image/jpeg", "image/png"].includes(
      req.file.mimetype
    )
  ) {
    throw new ApiError(400, "Only PDF, JPEG and PNG files are allowed");
  }

  const employee = await Employee.findById(employeeId).select("_id");

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  let storageKey;

  try {
    storageKey = await storePrivateDocument(req.file);

    const [document] = await EmployeeDocument.create([
      {
        employeeId: employee._id,
        title: title.trim(),
        category,
        storageKey,
        originalFileName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        expiresAt: expiresAt || undefined,
        uploadedBy: req.user._id,
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    // Avoid leaving an orphaned file if database creation fails.
    if (storageKey) {
      try {
        const { deletePrivateDocumentFile } =
          await import("../services/documentStorage.js");

        await deletePrivateDocumentFile(storageKey);
      } catch (cleanupError) {
        console.error("Private document cleanup failed:", cleanupError);
      }
    }

    throw error;
  }
});

// GET /api/v1/employee-documents
// HR can list documents; employees see only their own.
export const getEmployeeDocuments = asyncHandler(async (req, res) => {
  const { employeeId, category, page = 1, limit = 10 } = req.query;

  const filter = { isActive: true };

  if (HR_ROLES.includes(req.user.role)) {
    if (employeeId) {
      if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(400, "Invalid employee ID");
      }

      filter.employeeId = employeeId;
    }
  } else {
    const employee = await getEmployeeProfile(req.user._id);

    // Never trust employeeId from the client for self-access.
    filter.employeeId = employee._id;
  }

  if (category) {
    if (!ALLOWED_CATEGORIES.includes(category)) {
      throw new ApiError(400, "Invalid document category");
    }

    filter.category = category;
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const [documents, total] = await Promise.all([
    EmployeeDocument.find(filter)
      .select("-storageKey")
      .populate("employeeId", "firstName lastName employeeCode")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    EmployeeDocument.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: documents,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/employee-documents/:id
export const getEmployeeDocumentById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid document ID");
  }

  const document = await EmployeeDocument.findOne({
    _id: req.params.id,
    isActive: true,
  })
    .select("-storageKey")
    .populate("employeeId", "firstName lastName employeeCode")
    .populate("uploadedBy", "name email");

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  await ensureDocumentAccess(document, req.user);

  return res.status(200).json({
    success: true,
    data: document,
  });
});

// GET /api/v1/employee-documents/:id/download
export const downloadEmployeeDocument = asyncHandler(
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid document ID");
    }

    const document = await EmployeeDocument.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("+storageKey");

    if (!document) {
      throw new ApiError(404, "Document not found");
    }

    await ensureDocumentAccess(document, req.user);

    const fullPath = await ensurePrivateDocumentExists(
      document.storageKey
    );

    const safeName = (document.originalFileName || "document")
      .replace(/[\r\n"]/g, "_")
      .replace(/[\\/]/g, "_");

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}"`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");

    const stream = createReadStream(fullPath);

    stream.on("error", (error) => {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Unable to read document",
        });
      } else {
        res.destroy(error);
      }
    });

    stream.pipe(res);
  }
);

// PATCH /api/v1/employee-documents/:id
// HR/Admin can change metadata, not the underlying storage key.
export const updateEmployeeDocument = asyncHandler(async (req, res) => {
  requireHR(req.user);

  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid document ID");
  }

  const updates = {};
  const allowedFields = ["title", "category", "expiresAt"];

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid metadata fields provided");
  }

  if (
    Object.hasOwn(updates, "title") &&
    (typeof updates.title !== "string" || !updates.title.trim())
  ) {
    throw new ApiError(400, "Document title cannot be empty");
  }

  if (Object.hasOwn(updates, "title")) {
    updates.title = updates.title.trim();
  }

  if (
    Object.hasOwn(updates, "category") &&
    !ALLOWED_CATEGORIES.includes(updates.category)
  ) {
    throw new ApiError(400, "Invalid document category");
  }

  if (Object.hasOwn(updates, "expiresAt") && updates.expiresAt) {
    const expiry = new Date(updates.expiresAt);

    if (Number.isNaN(expiry.getTime())) {
      throw new ApiError(400, "Invalid expiry date");
    }

    updates.expiresAt = expiry;
  }

  const document = await EmployeeDocument.findOneAndUpdate(
    { _id: req.params.id, isActive: true },
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-storageKey");

  if (!document) {
    throw new ApiError(404, "Active document not found");
  }

  return res.status(200).json({
    success: true,
    message: "Document metadata updated",
    data: document,
  });
});

// DELETE /api/v1/employee-documents/:id
// Soft-delete the document record; retain the file for retention policy.
export const deactivateEmployeeDocument = asyncHandler(
  async (req, res) => {
    requireHR(req.user);

    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid document ID");
    }

    const document = await EmployeeDocument.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    ).select("-storageKey");

    if (!document) {
      throw new ApiError(404, "Active document not found");
    }

    return res.status(200).json({
      success: true,
      message: "Document deactivated",
      data: document,
    });
  }
);
