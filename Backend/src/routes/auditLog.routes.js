import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  getAuditLogs,
  getAuditLogById,
} from "../controllers/auditLog.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getAuditLogs);
router.get("/:id", getAuditLogById);

export default router;
