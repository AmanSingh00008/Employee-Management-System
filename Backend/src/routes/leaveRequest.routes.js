
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  reviewLeaveRequest,
  cancelLeaveRequest,
} from "../controllers/leaveRequest.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createLeaveRequest);
router.get("/", getLeaveRequests);
router.get("/:id", getLeaveRequestById);

router.patch(
  "/:id/review",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  reviewLeaveRequest
);

router.patch("/:id/cancel", cancelLeaveRequest);

export default router;
