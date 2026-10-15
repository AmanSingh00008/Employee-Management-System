
import { Router } from "express";

import {
  getMySessions,
  revokeMySession,
  revokeAllMySessions,
} from "../controllers/refreshSession.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getMySessions);
router.delete("/all", revokeAllMySessions);
router.delete("/:sessionId", revokeMySession);

export default router;
