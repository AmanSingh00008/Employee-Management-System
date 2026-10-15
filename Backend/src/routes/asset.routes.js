
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  retireAsset,
} from "../controllers/asset.controller.js";

const router = Router();

router.use(verifyJWT);

router.get(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  getAssets
);

router.get(
  "/:id",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  getAssetById
);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  createAsset
);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  updateAsset
);

router.patch(
  "/:id/retire",
  authorizeRoles("super_admin", "hr_admin"),
  retireAsset
);

export default router;
