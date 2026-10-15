import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  retireAsset,
} from "../controllers/asset.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
  .post(createAsset)
  .get(getAssets);

router.get("/:id", getAssetById);
router.patch("/:id", updateAsset);
router.patch("/:id/retire", retireAsset);

export default router;