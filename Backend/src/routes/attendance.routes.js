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

  router.use(verifyJWT);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  markAttendance
);

router.get(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  getAttendanceRecords
);

router.get("/:id", getAttendanceById);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  updateAttendance
);

export default router;