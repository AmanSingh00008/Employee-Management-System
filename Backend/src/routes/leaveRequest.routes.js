import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  reviewLeaveRequest,
  cancelLeaveRequest,
} from "../controllers/leaveRequest.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
  .post(createLeaveRequest)
  .get(getLeaveRequests);

router.get("/:id", getLeaveRequestById);
router.patch("/:id/review", reviewLeaveRequest);
router.patch("/:id/cancel", cancelLeaveRequest);

export default router;