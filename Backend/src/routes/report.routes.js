
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  exportEmployeeReport,
  exportAttendanceReport,
  exportLeaveReport,
} from "../controllers/report.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/employees", exportEmployeeReport);
router.get("/attendance", exportAttendanceReport);
router.get("/leave-requests", exportLeaveReport);

export default router;
