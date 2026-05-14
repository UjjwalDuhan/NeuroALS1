import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User";
import Otp from "../models/Otp";
import { generateToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import { sendRegistrationOTP, sendPasswordResetOTP } from "../services/emailService";
import { AuthRequest, RegisterDto, LoginDto, PublicUser, UserRole } from "../types";

// ── Helper: Strip private fields ──────────────────────────────────────────────
const toPublicUser = (user: InstanceType<typeof User>): PublicUser => ({
  _id: (user._id as { toString(): string }).toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role as UserRole,
  institution: user.institution,
  specialty: user.specialty,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// ── Helper: Generate & store a hashed OTP ────────────────────────────────────
const createAndStoreOTP = async (
  email: string,
  purpose: "registration" | "password_reset",
  pendingData?: object
): Promise<string> => {
  // 6-digit numeric OTP
  const plainOtp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert: replace any existing OTP for this email+purpose
  await Otp.findOneAndUpdate(
    { email: email.toLowerCase(), purpose },
    { otp: hashedOtp, expiresAt, pendingData },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return plainOtp;
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 – Send OTP for Registration
// POST /api/auth/register/send-otp
// ─────────────────────────────────────────────────────────────────────────────
export const sendRegistrationOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role, institution, specialty }: RegisterDto =
      req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendError(res, "An account with this email already exists.", 409);
      return;
    }

    // Store full registration payload (password will be hashed on account creation)
    const pendingData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password, // plain; will be hashed by User model pre-save hook
      role,
      institution: institution?.trim(),
      specialty: specialty?.trim(),
    };

    const otp = await createAndStoreOTP(email.toLowerCase(), "registration", pendingData);
    await sendRegistrationOTP(email, firstName, otp);

    sendSuccess(res, { email }, "OTP sent to your email address. Valid for 10 minutes.");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 – Verify OTP and Create Account
// POST /api/auth/register/verify-otp
// ─────────────────────────────────────────────────────────────────────────────
export const verifyRegistrationOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp }: { email: string; otp: string } = req.body;

    const record = await Otp.findOne({
      email: email.toLowerCase(),
      purpose: "registration",
    });

    if (!record) {
      sendError(res, "No pending OTP found for this email. Please register again.", 400);
      return;
    }

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      sendError(res, "OTP has expired. Please register again to get a new OTP.", 400);
      return;
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
      sendError(res, "Invalid OTP. Please check and try again.", 400);
      return;
    }

    // OTP valid — create the user from stored pending data
    const data = record.pendingData as RegisterDto;
    const user = await User.create({
      ...data,
      isVerified: true, // email confirmed via OTP
    });

    // Clean up OTP record
    await record.deleteOne();

    const token = generateToken(
      (user._id as { toString(): string }).toString(),
      user.email,
      user.role as UserRole
    );

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    sendSuccess(
      res,
      { token, user: toPublicUser(user) },
      "Account created successfully! Welcome to NeuroALS.",
      201
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, role }: LoginDto = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    }).select("+password");

    if (!user) {
      sendError(res, "Invalid email or password.", 401);
      return;
    }

    if (user.role !== role) {
      sendError(
        res,
        `This account is registered as ${user.role}. Please select the correct role.`,
        401
      );
      return;
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      sendError(res, "Invalid email or password.", 401);
      return;
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(
      (user._id as { toString(): string }).toString(),
      user.email,
      user.role as UserRole
    );

    sendSuccess(res, { token, user: toPublicUser(user) }, `Welcome back, ${user.firstName}!`);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD – Send OTP
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email }: { email: string } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });

    // Always respond 200 to prevent email enumeration
    if (!user) {
      sendSuccess(
        res,
        {},
        "If that email is registered, an OTP has been sent."
      );
      return;
    }

    const otp = await createAndStoreOTP(email.toLowerCase(), "password_reset");
    await sendPasswordResetOTP(email, user.firstName, otp);

    sendSuccess(res, { email }, "OTP sent to your email address. Valid for 10 minutes.");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD – Verify OTP + Set New Password
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp, newPassword }: { email: string; otp: string; newPassword: string } =
      req.body;

    const record = await Otp.findOne({
      email: email.toLowerCase(),
      purpose: "password_reset",
    });

    if (!record) {
      sendError(res, "No password reset request found. Please request a new OTP.", 400);
      return;
    }

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      sendError(res, "OTP has expired. Please request a new one.", 400);
      return;
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
      sendError(res, "Invalid OTP. Please check and try again.", 400);
      return;
    }

    // Update password (pre-save hook in User model hashes it)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      sendError(res, "User not found.", 404);
      return;
    }

    user.password = newPassword;
    await user.save(); // triggers bcrypt pre-save hook

    await record.deleteOne();

    sendSuccess(res, {}, "Password reset successfully. You can now log in with your new password.");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ME
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Not authenticated.", 401);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      sendError(res, "User not found or account deactivated.", 404);
      return;
    }

    sendSuccess(res, { user: toPublicUser(user) }, "User profile retrieved.");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(res, null, "Logged out successfully. Please remove the token on client.");
  } catch (error) {
    next(error);
  }
};
