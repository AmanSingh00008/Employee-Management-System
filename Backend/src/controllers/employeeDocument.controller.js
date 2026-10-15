import { EmployeeDocument } from "../models/employeeDocument.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createEmployeeDocument = asyncHandler(async (req, res) => {
  const {
    employeeId,
    title,
    category,
    storageKey,
    originalFileName,
    mimeType,
    sizeBytes,
    expiresAt,
  } = req.body;

  if (
    !employeeId ||
    !title?.trim() ||
    !category ||
    !storageKey ||
    !originalFileName ||
    !mimeType ||
    !Number.isFinite(sizeBytes) ||
    sizeBytes <= 0
  ) {
    throw new ApiError(400, "Required document metadata is missing or invalid");
  }

  const employee = await Employee.findById(employeeId);

  if (!employee) throw new ApiError(404, "Employee not found");

  const document = await EmployeeDocument.create({
    employeeId,
    title: title.trim(),
    category,
    storageKey,
    originalFileName,
    mimeType,
    sizeBytes,
    expiresAt,
    uploadedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Document metadata saved successfully",
    data: document,
  });
});

export const getEmployeeDocuments = asyncHandler(async (req, res) => {
  const filter = { isActive: true };

  if (req.query.employeeId) filter.employeeId = req.query.employeeId;
  if (req.query.category) filter.category = req.query.category;

  const documents = await EmployeeDocument.find(filter)
    .select("-storageKey")
    .populate("employeeId", "employeeCode firstName lastName")
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: documents });
});

export const getEmployeeDocumentById = asyncHandler(async (req, res) => {
  const document = await EmployeeDocument.findOne({
    _id: req.params.id,
    isActive: true,
  })
    .select("-storageKey")
    .populate("employeeId", "employeeCode firstName lastName")
    .populate("uploadedBy", "name email");

  if (!document) throw new ApiError(404, "Document not found");

  res.status(200).json({ success: true, data: document });
});

export const updateEmployeeDocument = asyncHandler(async (req, res) => {
  const allowedFields = ["title", "category", "expiresAt"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const document = await EmployeeDocument.findOneAndUpdate(
    { _id: req.params.id, isActive: true },
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-storageKey");

  if (!document) throw new ApiError(404, "Document not found");

  res.status(200).json({
    success: true,
    message: "Document metadata updated",
    data: document,
  });
});

export const deactivateEmployeeDocument = asyncHandler(async (req, res) => {
  const document = await EmployeeDocument.findOneAndUpdate(
    { _id: req.params.id, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  ).select("-storageKey");

  if (!document) throw new ApiError(404, "Document not found");

  res.status(200).json({
    success: true,
    message: "Document metadata deactivated",
    data: document,
  });
});