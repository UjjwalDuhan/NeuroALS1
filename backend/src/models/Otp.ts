import mongoose, { Schema, Document } from "mongoose";

// ── OTP Types ─────────────────────────────────────────────────────────────────
export type OtpPurpose = "registration" | "password_reset";

export interface IOtp extends Document {
  email: string;
  otp: string;           // hashed
  purpose: OtpPurpose;
  pendingData?: object;  // stores registration payload while unverified
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["registration", "password_reset"],
      required: true,
    },
    // Stores the full registration payload until the email is confirmed.
    // For password_reset this field is empty.
    pendingData: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index: automatically deletes the document after expiry
      index: { expires: 0 },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

// Compound unique index: one active OTP per email+purpose at a time
OtpSchema.index({ email: 1, purpose: 1 }, { unique: true });

const Otp = mongoose.model<IOtp>("Otp", OtpSchema);
export default Otp;
