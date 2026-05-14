import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, UserRole } from "../types";

// ── Schema Definition ─────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "Role must be doctor, researcher, or admin",
      },
      required: [true, "Role is required"],
      default: UserRole.DOCTOR,
    },

    institution: {
      type: String,
      trim: true,
      maxlength: [100, "Institution name cannot exceed 100 characters"],
    },

    specialty: {
      type: String,
      trim: true,
      maxlength: [100, "Specialty cannot exceed 100 characters"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// ── Pre-save Hook: Hash password ──────────────────────────────────────────────
UserSchema.pre("save", async function (next) {
  // Only hash if password field was modified
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ── Instance Method: Compare password ────────────────────────────────────────
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Get full name ────────────────────────────────────────────
UserSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

// ── Transform: Remove sensitive fields from JSON output ───────────────────────
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { password, __v, ...result } = ret;
    return result;
  },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
