
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

export default router;