import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
  .post(markAttendance)
  .get(getAttendanceRecords);

router.route("/:id")
  .get(getAttendanceById)
  .patch(updateAttendance);

export default router;