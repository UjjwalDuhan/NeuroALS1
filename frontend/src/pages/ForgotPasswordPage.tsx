import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import AuthLayout from "@/components/layout/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import PasswordStrengthBar from "@/components/auth/PasswordStrengthBar";

import { useAuthForm } from "@/hooks/useAuthForm";
import { forgotPassword, resetPassword } from "@/services/authService";

// ── Validation schemas ────────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type EmailSchema = z.infer<typeof emailSchema>;

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type ResetSchema = z.infer<typeof resetSchema>;

// ── OTP Input ─────────────────────────────────────────────────────────────────
interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
}
const OtpInput: React.FC<OtpInputProps> = ({ value, onChange }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const arr = value.split("").concat(Array(6).fill("")).slice(0, 6);
    arr[index] = digit;
    onChange(arr.join(""));
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { onChange(pasted); inputsRef.current[5]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 text-center text-xl font-bold rounded-xl border bg-white/[0.04] border-white/10 text-white focus:outline-none focus:border-sky-400 focus:bg-white/[0.08] transition-all duration-150"
          style={{ height: "52px" }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

// ── Left panel ────────────────────────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="flex flex-col mt-auto">
    <div className="mb-10">
      <h2 className="font-display text-4xl font-black leading-tight mb-4">
        Secure<br />account<br /><em className="text-sky-400">recovery.</em>
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
        We'll send a one-time password to your registered email address to verify your identity before resetting your password.
      </p>
    </div>
    <div className="space-y-4">
      {[
        { icon: "✉️", title: "Email Verification", sub: "OTP sent to your registered email only" },
        { icon: "⏱️", title: "Expires in 10 Minutes", sub: "Request a new one if yours expires" },
        { icon: "🔐", title: "Secure Reset",          sub: "Your new password is hashed and never stored in plain text" },
      ].map((f) => (
        <div key={f.title} className="flex gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-base flex-shrink-0">{f.icon}</div>
          <div>
            <div className="text-sm font-semibold mb-0.5">{f.title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{f.sub}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
type Step = "email" | "otp" | "newPassword" | "success";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, serverError, withLoading } = useAuthForm();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailForm = useForm<EmailSchema>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetSchema>({ resolver: zodResolver(resetSchema) });
  const newPasswordValue = resetForm.watch("newPassword") || "";

  // ── Step 1: Request OTP ──────────────────────────────────────────────────────
  const onRequestOtp = async (data: EmailSchema) => {
    await withLoading(async () => forgotPassword(data.email));
    // Always advance (server hides whether email exists)
    setEmail(data.email);
    setStep("otp");
    startResendCooldown();
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────────
  const onVerifyOtp = () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    setOtpError("");
    setStep("newPassword");
  };

  // ── Step 3: Set new password ─────────────────────────────────────────────────
  const onResetPassword = async (data: ResetSchema) => {
    const result = await withLoading(async () =>
      resetPassword(email, otp, data.newPassword)
    );

    if (result?.success) {
      setStep("success");
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const onResendOtp = async () => {
    if (resendCooldown > 0) return;
    await withLoading(async () => forgotPassword(email));
    setOtp("");
    setOtpError("");
    startResendCooldown();
  };

  return (
    <AuthLayout leftPanel={<LeftPanel />}>
      <div className="animate-fade-up">

        {/* ── Success ──────────────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-teal-500/15 border-2 border-teal-400 flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-teal-500/20">✅</div>
            <h2 className="font-display text-2xl font-black mb-2">Password reset!</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Your password has been updated successfully.<br />You can now sign in with your new password.
            </p>
            <Button variant="teal" size="lg" onClick={() => navigate("/login")}>
              Go to Login →
            </Button>
          </div>
        )}

        {/* ── Step 1: Email ─────────────────────────────────────────────────── */}
        {step === "email" && (
          <>
            <p className="text-right text-sm text-slate-400 mb-10">
              Remembered it?{" "}
              <Link to="/login" className="text-sky-400 font-medium hover:underline">Sign in →</Link>
            </p>
            <h1 className="font-display text-3xl font-black mb-1.5">Forgot password?</h1>
            <p className="text-slate-400 text-sm mb-7">Enter your email and we'll send you a reset OTP.</p>

            <form onSubmit={emailForm.handleSubmit(onRequestOtp)} className="space-y-4" noValidate>
              <Input
                label="Email Address *"
                type="email"
                icon="✉"
                placeholder="you@hospital.org"
                error={emailForm.formState.errors.email?.message}
                autoComplete="email"
                {...emailForm.register("email")}
              />
              {serverError && <Alert type="error" message={serverError} />}
              <Button type="submit" variant="teal" size="lg" fullWidth isLoading={isLoading} className="mt-2">
                {!isLoading && "Send Reset OTP →"}
              </Button>
            </form>
          </>
        )}

        {/* ── Step 2: Enter OTP ────────────────────────────────────────────── */}
        {step === "otp" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-sky-500/15 border-2 border-sky-400 flex items-center justify-center text-3xl mx-auto mb-5">✉️</div>
            <h2 className="font-display text-2xl font-black mb-2">Enter OTP</h2>
            <p className="text-slate-400 text-sm mb-1">We sent a 6-digit OTP to</p>
            <p className="text-sky-400 font-semibold text-sm mb-7">{email}</p>

            <OtpInput value={otp} onChange={setOtp} />

            {otpError && <p className="text-xs text-red-400 mt-3">⚠ {otpError}</p>}
            {serverError && <div className="mt-3"><Alert type="error" message={serverError} /></div>}

            <Button variant="teal" size="lg" fullWidth className="mt-6" isLoading={isLoading} onClick={onVerifyOtp}>
              {!isLoading && "Verify OTP →"}
            </Button>

            <p className="text-xs text-slate-500 mt-4">
              Didn't receive it?{" "}
              {resendCooldown > 0 ? (
                <span className="text-slate-400">Resend in {resendCooldown}s</span>
              ) : (
                <button onClick={onResendOtp} className="text-sky-400 hover:underline cursor-pointer">
                  Resend OTP
                </button>
              )}
            </p>

            <button
              onClick={() => { setStep("email"); setOtp(""); setOtpError(""); }}
              className="text-xs text-slate-500 hover:text-slate-300 mt-2 block mx-auto cursor-pointer"
            >
              ← Change email
            </button>
          </div>
        )}

        {/* ── Step 3: New Password ─────────────────────────────────────────── */}
        {step === "newPassword" && (
          <>
            <div className="text-center mb-7">
              <div className="w-16 h-16 rounded-full bg-teal-500/15 border-2 border-teal-400 flex items-center justify-center text-3xl mx-auto mb-5">🔐</div>
              <h2 className="font-display text-2xl font-black mb-2">Set new password</h2>
              <p className="text-slate-400 text-sm">Choose a strong password for your account.</p>
            </div>

            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4" noValidate>
              <div>
                <Input
                  label="New Password *"
                  type="password"
                  icon="🔒"
                  placeholder="Min. 8 characters"
                  error={resetForm.formState.errors.newPassword?.message}
                  autoComplete="new-password"
                  {...resetForm.register("newPassword")}
                />
                <PasswordStrengthBar password={newPasswordValue} />
              </div>

              <Input
                label="Confirm New Password *"
                type="password"
                icon="🔒"
                placeholder="Repeat password"
                error={resetForm.formState.errors.confirmPassword?.message}
                autoComplete="new-password"
                {...resetForm.register("confirmPassword")}
              />

              {serverError && <Alert type="error" message={serverError} />}

              <Button type="submit" variant="teal" size="lg" fullWidth isLoading={isLoading} className="mt-2">
                {!isLoading && "Reset Password →"}
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
