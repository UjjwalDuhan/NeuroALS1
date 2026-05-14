import api from "./api";
import { ApiResponse, AuthResponseData, RegisterFormData, LoginFormData } from "@/types";

// ── Registration (2-step OTP) ─────────────────────────────────────────────────

/** Step 1: Validate form data, send OTP to email */
export const sendRegistrationOtp = async (
  data: Omit<RegisterFormData, "confirmPassword" | "agreeToTerms">
): Promise<ApiResponse<{ email: string }>> => {
  const response = await api.post<ApiResponse<{ email: string }>>(
    "/auth/register/send-otp",
    data
  );
  return response.data;
};

/** Step 2: Submit OTP → account is created and token returned */
export const verifyRegistrationOtp = async (
  email: string,
  otp: string
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    "/auth/register/verify-otp",
    { email, otp }
  );
  return response.data;
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (
  data: Omit<LoginFormData, "rememberMe">
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>("/auth/login", data);
  return response.data;
};

// ── Forgot Password ───────────────────────────────────────────────────────────

/** Request a password-reset OTP */
export const forgotPassword = async (
  email: string
): Promise<ApiResponse<{ email: string }>> => {
  const response = await api.post<ApiResponse<{ email: string }>>(
    "/auth/forgot-password",
    { email }
  );
  return response.data;
};

/** Verify OTP and set a new password */
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<ApiResponse<{}>> => {
  const response = await api.post<ApiResponse<{}>>("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

// ── Get Current User ──────────────────────────────────────────────────────────
export const getCurrentUser = async (): Promise<
  ApiResponse<{ user: AuthResponseData["user"] }>
> => {
  const response = await api.get<ApiResponse<{ user: AuthResponseData["user"] }>>("/auth/me");
  return response.data;
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};
