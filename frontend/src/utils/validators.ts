import { z } from "zod";

// ── Login Schema ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),

  role: z.enum(["doctor", "researcher", "admin"], {
    required_error: "Please select a role",
  }),

  rememberMe: z.boolean().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// ── Register Schema ───────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    role: z.enum(["doctor", "researcher", "admin"], {
      required_error: "Please select a role",
    }),

    institution: z
      .string()
      .max(100, "Institution name cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),

    specialty: z
      .string()
      .max(100, "Specialty cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),

    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the terms to continue",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

// ── Password strength calculator ──────────────────────────────────────────────
export type PasswordStrength = "empty" | "weak" | "fair" | "strong";

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return "empty";
  if (password.length < 6) return "weak";
  if (password.length < 10) return "fair";
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  return score >= 3 ? "strong" : "fair";
};
