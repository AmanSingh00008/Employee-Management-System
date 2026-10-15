import { Asset } from "../models/asset.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAsset = asyncHandler(async (req, res) => {
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
    throw new ApiError(400, "Asset code, name and category are required");
  }

  const asset = await Asset.create({
    assetCode: assetCode.trim().toUpperCase(),
    name: name.trim(),
    category,
    brand,
    modelNumber,
    serialNumber,
    purchaseDate,
    purchaseCost,
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Asset created successfully",
    data: asset,
  });
});

export const getAssets = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { assetCode: { $regex: req.query.search, $options: "i" } },
      { serialNumber: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const assets = await Asset.find(filter)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: assets });
});

export const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) throw new ApiError(404, "Asset not found");

  res.status(200).json({ success: true, data: asset });
});

export const updateAsset = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "category",
    "brand",
    "modelNumber",
    "serialNumber",
    "purchaseDate",
    "purchaseCost",
    "notes",
    "status",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  // Assignment-related status changes should use the assignment workflow.
  if (["assigned", "available"].includes(updates.status)) {
    throw new ApiError(
      400,
      "Use the asset assignment workflow to change assignment status"
    );
  }

  const asset = await Asset.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!asset) throw new ApiError(404, "Asset not found");

  res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    data: asset,
  });
});

export const retireAsset = asyncHandler(async (req, res) => {
  const { AssetAssignment } = await import("../models/assetAssignment.model.js");

  const activeAssignment = await AssetAssignment.exists({
    assetId: req.params.id,
    returnedAt: null,
  });

  if (activeAssignment) {
    throw new ApiError(409, "Return the asset before retiring it");
  }

  const asset = await Asset.findByIdAndUpdate(
    req.params.id,
    { $set: { status: "retired" } },
    { new: true, runValidators: true }
  );

  if (!asset) throw new ApiError(404, "Asset not found");

  res.status(200).json({
    success: true,
    message: "Asset retired successfully",
    data: asset,
  });
});