import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  createLeaveType,
  getLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deactivateLeaveType,
} from "../controllers/leaveType.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
  .post(createLeaveType)
  .get(getLeaveTypes);

router.route("/:id")
  .get(getLeaveTypeById)
  .patch(updateLeaveType)
  .delete(deactivateLeaveType);

export default router;
