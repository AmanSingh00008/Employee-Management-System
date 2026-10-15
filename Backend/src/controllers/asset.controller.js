
import mongoose from "mongoose";
import { Asset } from "../models/asset.model.js";
import { AssetAssignment } from "../models/assetAssignment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];

const requireHR = (user) => {
  if (!HR_ROLES.includes(user.role)) {
    throw new ApiError(403, "HR/Admin permission required");
  }
};

const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid asset ID");
  }
};

const ASSET_CATEGORIES = [
  "laptop",
  "desktop",
  "monitor",
  "keyboard",
  "mouse",
  "phone",
  "tablet",
  "other",
];

const ASSET_STATUSES = [
  "available",
  "assigned",
  "maintenance",
  "retired",
  "lost",
];

// POST /api/v1/assets
export const createAsset = asyncHandler(async (req, res) => {
  requireHR(req.user);

  const {
    assetCode,
    name,
    category,
    brand,
    modelNumber,
    serialNumber,
    purchaseDate,
    purchaseCost,
    notes,
  } = req.body;

  if (!assetCode?.trim() || !name?.trim() || !category) {
    throw new ApiError(
      400,
      "Asset code, name and category are required"
    );
  }

  if (!ASSET_CATEGORIES.includes(category)) {
    throw new ApiError(400, "Invalid asset category");
  }

  if (
    purchaseCost !== undefined &&
    (!Number.isFinite(purchaseCost) || purchaseCost < 0)
  ) {
    throw new ApiError(400, "Purchase cost must be non-negative");
  }

  let parsedPurchaseDate;

  if (purchaseDate) {
    parsedPurchaseDate = new Date(purchaseDate);

    if (Number.isNaN(parsedPurchaseDate.getTime())) {
      throw new ApiError(400, "Invalid purchase date");
    }
  }

  const duplicate = await Asset.findOne({
    assetCode: assetCode.trim(),
  }).select("_id");

  if (duplicate) {
    throw new ApiError(409, "Asset code already exists");
  }

  const asset = await Asset.create({
    assetCode: assetCode.trim(),
    name: name.trim(),
    category,
    brand: brand?.trim(),
    modelNumber: modelNumber?.trim(),
    serialNumber: serialNumber?.trim(),
    purchaseDate: parsedPurchaseDate,
    purchaseCost,
    notes: notes?.trim(),
    status: "available",
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Asset created successfully",
    data: asset,
  });
});

// GET /api/v1/assets
export const getAssets = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = {};

  if (category) {
    if (!ASSET_CATEGORIES.includes(category)) {
      throw new ApiError(400, "Invalid asset category");
    }

    filter.category = category;
  }

  if (status) {
    if (!ASSET_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid asset status");
    }

    filter.status = status;
  }

  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { assetCode: { $regex: escaped, $options: "i" } },
      { name: { $regex: escaped, $options: "i" } },
      { brand: { $regex: escaped, $options: "i" } },
      { serialNumber: { $regex: escaped, $options: "i" } },
    ];
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Asset.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: assets,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/assets/:id
export const getAssetById = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return res.status(200).json({
    success: true,
    data: asset,
  });
});

// PATCH /api/v1/assets/:id
export const updateAsset = asyncHandler(async (req, res) => {
  requireHR(req.user);
  validateId(req.params.id);

  const allowedFields = [
    "name",
    "category",
    "brand",
    "modelNumber",
    "serialNumber",
    "purchaseDate",
    "purchaseCost",
    "notes",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  // Asset status must change through assignment, return,
  // maintenance, or retirement workflows—not a generic PATCH.
  const forbiddenFields = [
    "assetCode",
    "status",
    "createdBy",
  ];

  if (forbiddenFields.some((field) => Object.hasOwn(req.body, field))) {
    throw new ApiError(
      400,
      "Asset code and status cannot be changed through this endpoint"
    );
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid asset fields provided");
  }

  if (
    Object.hasOwn(updates, "category") &&
    !ASSET_CATEGORIES.includes(updates.category)
  ) {
    throw new ApiError(400, "Invalid asset category");
  }

  if (
    Object.hasOwn(updates, "name") &&
    (typeof updates.name !== "string" || !updates.name.trim())
  ) {
    throw new ApiError(400, "Asset name cannot be empty");
  }

  if (Object.hasOwn(updates, "purchaseCost")) {
    if (
      updates.purchaseCost !== null &&
      (!Number.isFinite(updates.purchaseCost) ||
        updates.purchaseCost < 0)
    ) {
      throw new ApiError(400, "Invalid purchase cost");
    }
  }

  if (Object.hasOwn(updates, "purchaseDate") && updates.purchaseDate) {
    const date = new Date(updates.purchaseDate);

    if (Number.isNaN(date.getTime())) {
      throw new ApiError(400, "Invalid purchase date");
    }

    updates.purchaseDate = date;
  }

  for (const field of [
    "name",
    "brand",
    "modelNumber",
    "serialNumber",
    "notes",
  ]) {
    if (typeof updates[field] === "string") {
      updates[field] = updates[field].trim();
    }
  }

  const asset = await Asset.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    data: asset,
  });
});

// PATCH /api/v1/assets/:id/retire
export const retireAsset = asyncHandler(async (req, res) => {
  requireHR(req.user);
  validateId(req.params.id);

  const session = await mongoose.startSession();
  let retiredAsset;

  try {
    await session.withTransaction(async () => {
      const asset = await Asset.findById(req.params.id).session(session);

      if (!asset) {
        throw new ApiError(404, "Asset not found");
      }

      if (asset.status === "retired") {
        throw new ApiError(409, "Asset is already retired");
      }

      if (asset.status === "assigned") {
        throw new ApiError(
          409,
          "Return the assigned asset before retiring it"
        );
      }

      const activeAssignment = await AssetAssignment.findOne({
        assetId: asset._id,
        returnedAt: null,
      }).session(session);

      if (activeAssignment) {
        throw new ApiError(
          409,
          "An active assignment exists; return the asset first"
        );
      }

      // Conditional update protects against a concurrent assignment.
      retiredAsset = await Asset.findOneAndUpdate(
        {
          _id: asset._id,
          status: { $in: ["available", "maintenance", "lost"] },
        },
        { $set: { status: "retired" } },
        { new: true, session }
      );

      if (!retiredAsset) {
        throw new ApiError(
          409,
          "Asset status changed; refresh and try again"
        );
      }
    });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({
    success: true,
    message: "Asset retired successfully",
    data: retiredAsset,
  });
});
