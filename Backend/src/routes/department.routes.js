
import { Router } from "express";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";

// Add your authentication and role-authorization middleware
// before exposing these routes in production.

const router = Router();

router
  .route("/")
  .get(getDepartments)
  .post(createDepartment);

router
  .route("/:id")
  .get(getDepartmentById)
  .patch(updateDepartment)
  .delete(deleteDepartment);

  router.use(verifyJWT);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  createDepartment
);

router.get(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager", "employee"),
  getDepartments
);

router.get(
  "/:id",
  authorizeRoles("super_admin", "hr_admin", "manager", "employee"),
  getDepartmentById
);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  updateDepartment
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  deleteDepartment
);

export default router;
