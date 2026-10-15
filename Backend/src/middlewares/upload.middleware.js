import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new ApiError(400, "Only PDF, JPEG and PNG files are allowed")
      );
    }

    callback(null, true);
  },
});

export const uploadSingleDocument = (req, res, next) => {
  upload.single("document")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(413, "File must be 5 MB or smaller"));
      }

      return next(new ApiError(400, "Invalid file upload"));
    }

    next(error);
  });
};