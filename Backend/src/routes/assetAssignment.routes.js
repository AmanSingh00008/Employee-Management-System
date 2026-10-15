import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  assignAsset,
  getAssetAssignments,
  getAssetAssignmentById,
  returnAsset,
} from "../controllers/assetAssignment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
  .post(assignAsset)
  .get(getAssetAssignments);

router.get("/:id", getAssetAssignmentById);
router.patch("/:id/return", returnAsset);

export default router;