
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

export default router;
