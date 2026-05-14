import { Response, NextFunction } from "express";
import PatientRecord from "../models/PatientRecord";
import User from "../models/User";
import { sendALSReport } from "../services/emailService";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../types";

// ── Helper: risk level from probability ──────────────────────────────────────
function getRiskLevel(prob: number): string {
  if (prob < 25) return "Low";
  if (prob < 50) return "Moderate";
  if (prob < 75) return "High";
  return "Critical";
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/patients/save-report
// Save analysis result to DB and email report to the logged-in doctor
// ─────────────────────────────────────────────────────────────────────────────
export const saveAndEmailReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) { sendError(res, "Not authenticated.", 401); return; }

    const {
      patientName,
      patientAge,
      patientSex,
      muscleStrength,
      muapDuration,
      muapAmplitude,
      percentPolyphasic,
      muscle,
      atrophy,
      recruitmentPattern,
      spontaneousActivity,
      prediction,
      alsProbability,
      label,
    } = req.body;

    if (!patientName) { sendError(res, "Patient name is required.", 400); return; }

    const riskLevel = getRiskLevel(Number(alsProbability));

    // Save to database
    const record = await PatientRecord.create({
      userId: req.user.userId,
      patientName: patientName.trim(),
      patientAge: Number(patientAge),
      patientSex,
      muscleStrength: Number(muscleStrength),
      muapDuration: Number(muapDuration),
      muapAmplitude: Number(muapAmplitude),
      percentPolyphasic: Number(percentPolyphasic),
      muscle,
      atrophy,
      recruitmentPattern,
      spontaneousActivity,
      prediction: Number(prediction),
      alsProbability: Number(alsProbability),
      label,
      riskLevel,
    });

    // Get doctor details for the email
    const user = await User.findById(req.user.userId);
    if (!user) { sendError(res, "User not found.", 404); return; }

    // Send report email
    try {
      await sendALSReport({
        doctorName: `${user.firstName} ${user.lastName}`,
        doctorEmail: user.email,
        patientName: patientName.trim(),
        patientAge: Number(patientAge),
        patientSex,
        muscleStrength: Number(muscleStrength),
        muapDuration: Number(muapDuration),
        muapAmplitude: Number(muapAmplitude),
        percentPolyphasic: Number(percentPolyphasic),
        muscle,
        atrophy,
        recruitmentPattern,
        spontaneousActivity,
        prediction: Number(prediction),
        alsProbability: Number(alsProbability),
        label,
        riskLevel,
        analyzedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });

      // Mark email as sent
      await PatientRecord.findByIdAndUpdate(record._id, { reportEmailSent: true });
    } catch (emailErr) {
      // Don't fail the request if email fails — record is already saved
      console.error("Report email failed:", emailErr);
    }

    sendSuccess(
      res,
      { recordId: record._id, riskLevel },
      "Report saved and emailed successfully.",
      201
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/patients/history
// Get all past analyses for the logged-in user (newest first)
// ─────────────────────────────────────────────────────────────────────────────
export const getPatientHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) { sendError(res, "Not authenticated.", 401); return; }

    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      PatientRecord.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PatientRecord.countDocuments({ userId: req.user.userId }),
    ]);

    sendSuccess(res, {
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, "Patient history retrieved.");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/patients/:id
// Delete a single patient record (only by its owner)
// ─────────────────────────────────────────────────────────────────────────────
export const deletePatientRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) { sendError(res, "Not authenticated.", 401); return; }

    const record = await PatientRecord.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!record) { sendError(res, "Record not found.", 404); return; }

    await record.deleteOne();
    sendSuccess(res, {}, "Record deleted.");
  } catch (error) {
    next(error);
  }
};
