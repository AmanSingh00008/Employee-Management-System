
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

import {
  getLeaveBalances,
  getLeaveBalanceById,
  createOrUpdateLeaveBalance,
  updateLeaveAllocation,
} from "../controllers/leaveBalance.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getLeaveBalances);
router.get("/:id", getLeaveBalanceById);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  createOrUpdateLeaveBalance
);

router.patch(
  "/:id/allocation",
  authorizeRoles("super_admin", "hr_admin"),
  updateLeaveAllocation
);

export default router;
