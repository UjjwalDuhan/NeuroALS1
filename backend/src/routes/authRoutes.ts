import { Router } from "express";
import { body } from "express-validator";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { UserRole } from "../types";

const router = Router();

// ── Shared validation rules ───────────────────────────────────────────────────

const registrationFields = [
  body("firstName")
    .trim().notEmpty().withMessage("First name is required")
    .isLength({ min: 2, max: 50 }).withMessage("First name must be 2–50 characters"),

  body("lastName")
    .trim().notEmpty().withMessage("Last name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Last name must be 2–50 characters"),

  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(Object.values(UserRole)).withMessage("Role must be doctor, researcher, or admin"),

  body("institution").optional().trim().isLength({ max: 100 }),
  body("specialty").optional().trim().isLength({ max: 100 }),
];

const otpField = [
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email"),
  body("otp")
    .trim().notEmpty().withMessage("OTP is required")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
    .isNumeric().withMessage("OTP must be numeric"),
];

const loginValidation = [
  body("email").trim().notEmpty().isEmail(),
  body("password").notEmpty(),
  body("role").notEmpty().isIn(Object.values(UserRole)),
];

const passwordValidation = [
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number"),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// --- Registration (2-step) ---
// Step 1: Validate form data and send OTP
router.post("/register/send-otp", validate(registrationFields), sendRegistrationOtp);
// Step 2: Verify OTP and create account
router.post("/register/verify-otp", validate(otpField), verifyRegistrationOtp);

// --- Login ---
router.post("/login", validate(loginValidation), login);

// --- Forgot / Reset Password (2-step) ---
// Step 1: Send reset OTP
router.post(
  "/forgot-password",
  validate([body("email").trim().notEmpty().isEmail()]),
  forgotPassword
);
// Step 2: Verify OTP and set new password
router.post(
  "/reset-password",
  validate([...otpField, ...passwordValidation]),
  resetPassword
);

// --- Protected ---
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
