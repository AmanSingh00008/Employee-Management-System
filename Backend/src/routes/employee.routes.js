
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
} from "../controllers/employee.controller.js";

const router = Router();

router.use(verifyJWT);

router.get(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  getEmployees
);

router.get(
  "/:id",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  getEmployeeById
);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  createEmployee
);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  updateEmployee
);

router.patch(
  "/:id/deactivate",
  authorizeRoles("super_admin", "hr_admin"),
  deactivateEmployee
);

export default router;
