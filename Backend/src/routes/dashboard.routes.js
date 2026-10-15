
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/summary", getDashboardSummary);

export default router;
