import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!mongoose.isValidObjectId(id)) {
      return next(new ApiError(400, `Invalid ${paramName}`));
    }

    next();
  };
};