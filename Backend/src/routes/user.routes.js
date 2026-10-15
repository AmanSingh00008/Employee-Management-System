
import { Router } from "express";
import {
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deactivateUser,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/me", getCurrentUser);

router.get(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  getUsers
);

router.get("/:id", getUserById);
router.patch("/:id", updateUser);

router.delete(
  "/:id",
  authorizeRoles("super_admin"),
  deactivateUser
);

export default router;
