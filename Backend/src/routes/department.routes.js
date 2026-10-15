
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment,
} from "../controllers/department.controller.js";

const router = Router();

router.use(verifyJWT);

// Authenticated users can view departments.
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// Only HR/Admin can manage departments.
router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  createDepartment
);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  updateDepartment
);

router.patch(
  "/:id/deactivate",
  authorizeRoles("super_admin", "hr_admin"),
  deactivateDepartment
);

export default router;
