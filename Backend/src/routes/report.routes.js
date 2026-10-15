
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  exportEmployeeReport,
  exportAttendanceReport,
  exportLeaveReport,
} from "../controllers/report.controller.js";
import { getMyReportHistory } from "../controllers/reportHistory.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/history", getMyReportHistory);
router.get("/employees", exportEmployeeReport);
router.get("/attendance", exportAttendanceReport);
router.get("/leave-requests", exportLeaveReport);

export default router;
