
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

import {
  assignAsset,
  getAssetAssignments,
  getAssetAssignmentById,
  returnAsset,
} from "../controllers/assetAssignment.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getAssetAssignments);
router.get("/:id", getAssetAssignmentById);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  assignAsset
);

router.patch(
  "/:id/return",
  authorizeRoles("super_admin", "hr_admin"),
  returnAsset
);

export default router;
