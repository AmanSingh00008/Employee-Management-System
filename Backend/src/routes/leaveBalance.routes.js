import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  getLeaveBalances,
  getLeaveBalanceById,
  createOrUpdateLeaveBalance,
  updateLeaveAllocation,
} from "../controllers/leaveBalance.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getLeaveBalances);
router.post("/", createOrUpdateLeaveBalance);
router.get("/:id", getLeaveBalanceById);
router.patch("/:id", updateLeaveAllocation);

export default router;