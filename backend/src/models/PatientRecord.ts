import mongoose, { Schema, Document, Types } from "mongoose";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface IPatientRecord extends Document {
  userId: Types.ObjectId;       // which doctor/researcher ran the analysis
  patientName: string;
  patientAge: number;
  patientSex: string;
  // EMG parameters
  muscleStrength: number;
  muapDuration: number;
  muapAmplitude: number;
  percentPolyphasic: number;
  muscle: string;
  atrophy: string;
  recruitmentPattern: string;
  spontaneousActivity: string;
  // Result
  prediction: number;
  alsProbability: number;
  label: string;
  riskLevel: string;
  // Meta
  reportEmailSent: boolean;
  createdAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────
const PatientRecordSchema = new Schema<IPatientRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    patientAge: { type: Number, required: true },
    patientSex: { type: String, required: true },
    muscleStrength: { type: Number, default: 0 },
    muapDuration: { type: Number, default: 0 },
    muapAmplitude: { type: Number, default: 0 },
    percentPolyphasic: { type: Number, default: 0 },
    muscle: { type: String, default: "" },
    atrophy: { type: String, default: "" },
    recruitmentPattern: { type: String, default: "" },
    spontaneousActivity: { type: String, default: "" },
    prediction: { type: Number, required: true },
    alsProbability: { type: Number, required: true },
    label: { type: String, required: true },
    riskLevel: { type: String, required: true },
    reportEmailSent: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

PatientRecordSchema.index({ userId: 1, createdAt: -1 });

const PatientRecord = mongoose.model<IPatientRecord>("PatientRecord", PatientRecordSchema);
export default PatientRecord;
