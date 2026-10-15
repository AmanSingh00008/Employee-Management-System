import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  createEmployeeDocument,
  getEmployeeDocuments,
  getEmployeeDocumentById,
  updateEmployeeDocument,
  deactivateEmployeeDocument,
} from "../controllers/employeeDocument.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
  .post(createEmployeeDocument)
  .get(getEmployeeDocuments);

router.route("/:id")
  .get(getEmployeeDocumentById)
  .patch(updateEmployeeDocument)
  .delete(deactivateEmployeeDocument);

export default router;