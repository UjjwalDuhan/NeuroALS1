// ── User Role ─────────────────────────────────────────────────────────────────
export type UserRole = "doctor" | "researcher" | "admin";

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  institution?: string;
  specialty?: string;
  isVerified: boolean;
  createdAt: string;
}

// ── Auth State ────────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ── Auth Response Data ────────────────────────────────────────────────────────
export interface AuthResponseData {
  token: string;
  user: User;
}

// ── Register Form Fields ──────────────────────────────────────────────────────
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  institution?: string;
  specialty?: string;
  agreeToTerms: boolean;
}

// ── Login Form Fields ─────────────────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
  rememberMe?: boolean;
}

// ── Role Config (for UI) ──────────────────────────────────────────────────────
export interface RoleConfig {
  key: UserRole;
  label: string;
  icon: string;
  description: string;
}

export const ROLES: RoleConfig[] = [
  {
    key: "doctor",
    label: "Doctor",
    icon: "🩺",
    description: "Diagnose patients",
  },
  {
    key: "researcher",
    label: "Researcher",
    icon: "🔬",
    description: "Analyze datasets",
  },
  {
    key: "admin",
    label: "Admin",
    icon: "🛡️",
    description: "Manage platform",
  },
];
