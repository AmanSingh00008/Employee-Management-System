import { ApiError } from "../utils/ApiError.js";


export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied"));
    }

    next();
  };
};

export const authorizeSelfOrRoles = (
  getTargetUserId,
  ...allowedRoles
) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    const targetUserId = getTargetUserId(req);

    const isSelf =
      targetUserId &&
      String(targetUserId) === String(req.user._id);

    const hasRole = allowedRoles.includes(req.user.role);

    if (!isSelf && !hasRole) {
      return next(new ApiError(403, "Access denied"));
    }

    next();
  };
};