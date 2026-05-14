import { Router } from "express";
import { body } from "express-validator";
import { saveAndEmailReport, getPatientHistory, deletePatientRecord } from "../controllers/patientController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";

const router = Router();

// All patient routes require authentication
router.use(protect);

// POST /api/patients/save-report  — save result + email report
router.post(
  "/save-report",
  validate([
    body("patientName").trim().notEmpty().withMessage("Patient name is required"),
    body("patientAge").isNumeric().withMessage("Valid age is required"),
    body("alsProbability").isNumeric().withMessage("ALS probability is required"),
    body("prediction").isNumeric().withMessage("Prediction value is required"),
    body("label").notEmpty().withMessage("Label is required"),
  ]),
  saveAndEmailReport
);

// GET /api/patients/history  — paginated history
router.get("/history", getPatientHistory);

// DELETE /api/patients/:id  — delete a record
router.delete("/:id", deletePatientRecord);

export default router;
