
import { Router } from "express";

import {
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deactivateUser,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get the currently logged-in user
router.get("/me", getCurrentUser);

// List all users
router.get("/", getUsers);

// Get a user by ID
router.get("/:id", getUserById);

// Update user details, role or status
router.patch("/:id", updateUser);

// Deactivate a user account
router.delete("/:id", deactivateUser);

router.use(verifyJWT);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  createEmployee
);

router.get(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  getEmployees
);

router.get("/:id", getEmployeeById);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  updateEmployee
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  deactivateEmployee
);

export default router;