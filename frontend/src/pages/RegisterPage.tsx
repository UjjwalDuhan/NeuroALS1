import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "@/components/layout/AuthLayout";
import RoleSelector from "@/components/auth/RoleSelector";
import PasswordStrengthBar from "@/components/auth/PasswordStrengthBar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

import { useAuth } from "@/context/AuthContext";
import { useAuthForm } from "@/hooks/useAuthForm";
import { sendRegistrationOtp, verifyRegistrationOtp } from "@/services/authService";
import { registerSchema, RegisterSchema } from "@/utils/validators";
import { UserRole } from "@/types";

// ── Left panel ────────────────────────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="flex flex-col mt-auto">
    <div className="mb-10">
      <h2 className="font-display text-4xl font-black leading-tight mb-4">
        Join the future<br />of <em className="text-teal-400">ALS</em><br />diagnosis.
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
        Create your NeuroALS account and start analyzing EMG signals with transformer AI in under 60 seconds.
      </p>
    </div>

    <div className="space-y-4 mb-8">
      {[
        { icon: "🚀", title: "Free to Get Started",      sub: "Full platform access — no credit card required" },
        { icon: "📁", title: "Upload Any EMG CSV",        sub: "Standard format support with automatic preprocessing" },
        { icon: "🔬", title: "Research Publications",     sub: "Export anonymized datasets and benchmark results" },
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

    <div className="p-5 rounded-2xl bg-teal-500/[0.07] border border-teal-500/20">
      <div className="text-[10px] text-teal-400 font-semibold tracking-widest mb-4">PLATFORM STATS</div>
      <div className="grid grid-cols-2 gap-4">
        {[["128+", "Patients Analyzed"], ["91.2%", "Model Accuracy"], ["3", "AI Models"], ["24/7", "Availability"]].map(([v, l]) => (
          <div key={l}>
            <div className="font-display text-2xl font-black text-teal-400">{v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{l}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── OTP Input (6 boxes) ───────────────────────────────────────────────────────
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
    const next = arr.join("");
    onChange(next);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted);
      inputsRef.current[5]?.focus();
    }
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
          className="w-11 h-13 text-center text-xl font-bold rounded-xl border bg-white/[0.04] border-white/10 text-white focus:outline-none focus:border-teal-400 focus:bg-white/[0.08] transition-all duration-150"
          style={{ height: "52px" }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

// ── Register Page ─────────────────────────────────────────────────────────────
type Step = "form" | "otp" | "success";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isLoading, serverError, withLoading } = useAuthForm();

  const [step, setStep] = useState<Step>("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingFirstName, setPendingFirstName] = useState("");
  const [pendingRole, setPendingRole] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "doctor", agreeToTerms: false },
  });

  const selectedRole = watch("role");
  const passwordValue = watch("password") || "";

  const specialtyLabel = selectedRole === "doctor" ? "Specialty" : selectedRole === "researcher" ? "Research Field" : "Department";
  const specialtyPlaceholder = selectedRole === "doctor" ? "e.g. Neurology" : selectedRole === "researcher" ? "e.g. ALS / EMG Research" : "e.g. IT / Security";

  // ── Step 1: Submit form → send OTP ──────────────────────────────────────────
  const onSubmit = async (data: RegisterSchema) => {
    const result = await withLoading(async () =>
      sendRegistrationOtp({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
        institution: data.institution || undefined,
        specialty: data.specialty || undefined,
      })
    );

    if (result?.success) {
      setPendingEmail(data.email);
      setPendingFirstName(data.firstName);
      setPendingRole(data.role);
      setStep("otp");
      startResendCooldown();
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    setOtpError("");

    const result = await withLoading(async () =>
      verifyRegistrationOtp(pendingEmail, otp)
    );

    if (result?.success && result.data) {
      login(result.data.user, result.data.token);
      setStep("success");
    } else {
      setOtpError(result?.message || "Invalid OTP. Please try again.");
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
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
    const data = getValues();
    await withLoading(async () =>
      sendRegistrationOtp({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
        institution: data.institution || undefined,
        specialty: data.specialty || undefined,
      })
    );
    setOtp("");
    setOtpError("");
    startResendCooldown();
  };

  return (
    <AuthLayout leftPanel={<LeftPanel />}>
      <div className="animate-fade-up">
        {/* ── Success ─────────────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-teal-500/15 border-2 border-teal-400 flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-teal-500/20">🎉</div>
            <h2 className="font-display text-2xl font-black mb-2">Account created!</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Welcome to NeuroALS, <strong className="text-teal-400">{pendingFirstName}</strong>!<br />
              Your <strong className="text-sky-400">{pendingRole}</strong> account is ready.
            </p>
            <Button variant="teal" size="lg" onClick={() => navigate("/dashboard")}>
              Go to Dashboard →
            </Button>
          </div>
        )}

        {/* ── OTP Step ────────────────────────────────────────────────────── */}
        {step === "otp" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-sky-500/15 border-2 border-sky-400 flex items-center justify-center text-3xl mx-auto mb-5">✉️</div>
            <h2 className="font-display text-2xl font-black mb-2">Verify your email</h2>
            <p className="text-slate-400 text-sm mb-1">
              We sent a 6-digit OTP to
            </p>
            <p className="text-teal-400 font-semibold text-sm mb-7">{pendingEmail}</p>

            <OtpInput value={otp} onChange={setOtp} />

            {otpError && (
              <p className="text-xs text-red-400 mt-3">⚠ {otpError}</p>
            )}
            {serverError && (
              <div className="mt-3"><Alert type="error" message={serverError} /></div>
            )}

            <Button
              variant="teal"
              size="lg"
              fullWidth
              className="mt-6"
              isLoading={isLoading}
              onClick={onVerifyOtp}
            >
              {!isLoading && "Verify & Create Account →"}
            </Button>

            <p className="text-xs text-slate-500 mt-4">
              Didn't receive it?{" "}
              {resendCooldown > 0 ? (
                <span className="text-slate-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={onResendOtp}
                  className="text-sky-400 hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </p>

            <button
              onClick={() => { setStep("form"); setOtp(""); setOtpError(""); }}
              className="text-xs text-slate-500 hover:text-slate-300 mt-2 block mx-auto cursor-pointer"
            >
              ← Back to registration
            </button>
          </div>
        )}

        {/* ── Registration Form ────────────────────────────────────────────── */}
        {step === "form" && (
          <>
            <p className="text-right text-sm text-slate-400 mb-10">
              Already have an account?{" "}
              <Link to="/login" className="text-sky-400 font-medium hover:underline">
                Sign in →
              </Link>
            </p>

            <h1 className="font-display text-3xl font-black mb-1.5">Create account</h1>
            <p className="text-slate-400 text-sm mb-7">Select your role and fill in your details</p>

            <div className="mb-6">
              <RoleSelector
                value={selectedRole as UserRole}
                onChange={(role) => setValue("role", role)}
                error={errors.role?.message}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name *" icon="👤" placeholder="Emily" error={errors.firstName?.message} autoComplete="given-name" {...register("firstName")} />
                <Input label="Last Name *" icon="👤" placeholder="Reed" error={errors.lastName?.message} autoComplete="family-name" {...register("lastName")} />
              </div>

              <Input label="Email Address *" type="email" icon="✉" placeholder="you@hospital.org" error={errors.email?.message} autoComplete="email" {...register("email")} />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Institution" icon="🏥" placeholder="City ALS Center" error={errors.institution?.message} {...register("institution")} />
                <Input label={specialtyLabel} icon="🔬" placeholder={specialtyPlaceholder} error={errors.specialty?.message} {...register("specialty")} />
              </div>

              <div>
                <Input label="Password *" type="password" icon="🔒" placeholder="Min. 8 characters" error={errors.password?.message} autoComplete="new-password" {...register("password")} />
                <PasswordStrengthBar password={passwordValue} />
              </div>

              <Input label="Confirm Password *" type="password" icon="🔒" placeholder="Repeat password" error={errors.confirmPassword?.message} autoComplete="new-password" {...register("confirmPassword")} />

              <div className="flex items-start gap-2.5 pt-1">
                <input type="checkbox" id="agreeToTerms" className="accent-sky-400 w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer" {...register("agreeToTerms")} />
                <label htmlFor="agreeToTerms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                  I confirm I am an authorized medical or research professional and agree to the{" "}
                  <span className="text-sky-400">Terms of Service</span>,{" "}
                  <span className="text-sky-400">Privacy Policy</span>, and will handle patient data in compliance with applicable regulations.
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-xs text-red-400 -mt-2">⚠ {errors.agreeToTerms.message}</p>
              )}

              {serverError && <Alert type="error" message={serverError} />}

              <Button type="submit" variant="teal" size="lg" fullWidth isLoading={isLoading} className="mt-2">
                {!isLoading && `Send OTP to Email →`}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5 text-xs text-slate-500">
              <div className="flex-1 h-px bg-white/[0.08]" />or sign up with<div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[["🔵", "Google"], ["🏥", "Hospital SSO"]].map(([icon, label]) => (
                <button key={label} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-300 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 cursor-pointer">
                  {icon} {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
