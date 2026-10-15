
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

import {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(verifyJWT);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  markAttendance
);

router.get("/", getAttendanceRecords);
router.get("/:id", getAttendanceById);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  updateAttendance
);

export default router;
