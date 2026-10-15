
import mongoose from "mongoose";

import { RefreshSession } from "../models/refreshSession.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const safeSessionFields =
  "_id createdAt updatedAt expiresAt revokedAt ipAddress userAgent lastUsedAt";

export const getMySessions = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required");
  }

  const sessions = await RefreshSession.find({
    userId: req.user._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select(safeSessionFields)
    .sort({ lastUsedAt: -1, createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
});

export const revokeMySession = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required");
  }

  const { sessionId } = req.params;

  if (!isValidId(sessionId)) {
    throw new ApiError(400, "Invalid session ID");
  }

  const session = await RefreshSession.findOneAndUpdate(
    {
      _id: sessionId,
      userId: req.user._id,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    },
    { new: true }
  ).select(safeSessionFields);

  if (!session) {
    throw new ApiError(
      404,
      "Active session not found for this user"
    );
  }

  res.status(200).json({
    success: true,
    message: "Session revoked successfully",
  });
});

export const revokeAllMySessions = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required");
  }

  const result = await RefreshSession.updateMany(
    {
      userId: req.user._id,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );

  res.status(200).json({
    success: true,
    message: "All sessions have been revoked",
    revokedCount: result.modifiedCount,
  });
});
