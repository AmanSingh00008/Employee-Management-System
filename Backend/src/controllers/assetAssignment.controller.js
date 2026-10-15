import { AssetAssignment } from "../models/assetAssignment.model.js";
import { Asset } from "../models/asset.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const assignAsset = asyncHandler(async (req, res) => {
  const {
    assetId,
    employeeId,
    expectedReturnAt,
    assignedCondition,
    notes,
  } = req.body;

  if (!assetId || !employeeId) {
    throw new ApiError(400, "Asset and employee are required");
  }

  const [asset, employee] = await Promise.all([
    Asset.findById(assetId),
    Employee.findById(employeeId),
  ]);

  if (!asset) throw new ApiError(404, "Asset not found");
  if (!employee) throw new ApiError(404, "Employee not found");

  if (asset.status !== "available") {
    throw new ApiError(409, "Asset is not available for assignment");
  }

  const activeAssignment = await AssetAssignment.exists({
    assetId,
    returnedAt: null,
  });

  if (activeAssignment) {
    throw new ApiError(409, "Asset already has an active assignment");
  }

  const assignment = await AssetAssignment.create({
    assetId,
    employeeId,
    assignedBy: req.user._id,
    expectedReturnAt,
    assignedCondition,
    notes,
    assignedAt: new Date(),
  });

  asset.status = "assigned";
  await asset.save();

  res.status(201).json({
    success: true,
    message: "Asset assigned successfully",
    data: assignment,
  });
});

export const getAssetAssignments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.employeeId) filter.employeeId = req.query.employeeId;
  if (req.query.assetId) filter.assetId = req.query.assetId;

  if (req.query.active === "true") filter.returnedAt = null;
  if (req.query.active === "false") filter.returnedAt = { $ne: null };

  const assignments = await AssetAssignment.find(filter)
    .populate("assetId")
    .populate("employeeId", "employeeCode firstName lastName")
    .populate("assignedBy", "name email")
    .sort({ assignedAt: -1 });

  res.status(200).json({ success: true, data: assignments });
});

export const getAssetAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await AssetAssignment.findById(req.params.id)
    .populate("assetId")
    .populate("employeeId", "employeeCode firstName lastName")
    .populate("assignedBy", "name email");

  if (!assignment) throw new ApiError(404, "Assignment not found");

  res.status(200).json({ success: true, data: assignment });
});

export const returnAsset = asyncHandler(async (req, res) => {
  const { returnCondition, notes } = req.body;

  const assignment = await AssetAssignment.findById(req.params.id);

  if (!assignment) throw new ApiError(404, "Assignment not found");

  if (assignment.returnedAt) {
    throw new ApiError(409, "Asset has already been returned");
  }

  const asset = await Asset.findById(assignment.assetId);

  if (!asset) throw new ApiError(404, "Asset not found");

  assignment.returnedAt = new Date();
  assignment.returnCondition = returnCondition;
  if (notes !== undefined) assignment.notes = notes;

  asset.status = "available";

  await Promise.all([assignment.save(), asset.save()]);

  res.status(200).json({
    success: true,
    message: "Asset returned successfully",
    data: assignment,
  });
});