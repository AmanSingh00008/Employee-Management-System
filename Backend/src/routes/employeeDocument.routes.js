
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { uploadSingleDocument } from "../middleware/upload.middleware.js";

import {
  createEmployeeDocument,
  getEmployeeDocuments,
  getEmployeeDocumentById,
  downloadEmployeeDocument,
  updateEmployeeDocument,
  deactivateEmployeeDocument,
} from "../controllers/employeeDocument.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getEmployeeDocuments);
router.get("/:id/download", downloadEmployeeDocument);
router.get("/:id", getEmployeeDocumentById);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  uploadSingleDocument,
  createEmployeeDocument
);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  updateEmployeeDocument
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  deactivateEmployeeDocument
);

export default router;
