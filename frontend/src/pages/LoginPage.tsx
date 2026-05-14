import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "@/components/layout/AuthLayout";
import RoleSelector from "@/components/auth/RoleSelector";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

import { useAuth } from "@/context/AuthContext";
import { useAuthForm } from "@/hooks/useAuthForm";
import { loginUser } from "@/services/authService";
import { loginSchema, LoginSchema } from "@/utils/validators";
import { UserRole } from "@/types";

// ── Left branding panel content ───────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="flex flex-col mt-auto">
    <div className="mb-10">
      <h2 className="font-display text-4xl font-black leading-tight mb-4">
        Detect ALS<br /><em className="text-teal-400">earlier.</em><br />Treat smarter.
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
        AI-powered diagnosis combining transformer deep learning with EMG analysis for neurologists and researchers.
      </p>
    </div>

    {/* Feature list */}
    <div className="space-y-4 mb-8">
      {[
        { icon: "⚡", title: "Real-time EMG Analysis",     sub: "Multi-channel waveform processing with abnormality detection" },
        { icon: "🧠", title: "Transformer AI — 91.2% Acc", sub: "Explainable SHAP-driven predictions on every diagnosis" },
        { icon: "🔐", title: "HIPAA-Ready Security",       sub: "JWT auth, audit logs, and role-based access control" },
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

    {/* Testimonial */}
    <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
      <p className="text-sm text-slate-300 italic leading-relaxed mb-4">
        "NeuroALS flagged early fasciculation patterns that traditional EMG review missed. We caught three ALS cases 4 months earlier."
      </p>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-700 to-sky-400 flex items-center justify-center text-xs font-bold">RO</div>
        <div>
          <div className="text-xs font-semibold">Dr. Rachel Osei</div>
          <div className="text-[10px] text-slate-500">Neurologist, ALS Research Center</div>
        </div>
      </div>
    </div>
  </div>
);

// ── Login Page ────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isLoading, serverError, withLoading } = useAuthForm();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "doctor", rememberMe: false },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: LoginSchema) => {
    const result = await withLoading(async () => {
      const res = await loginUser({ email: data.email, password: data.password, role: data.role as UserRole });
      return res;
    });

    if (result?.success && result.data) {
      login(result.data.user, result.data.token);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    }
  };

  return (
    <AuthLayout leftPanel={<LeftPanel />}>
      <div className="animate-fade-up">
        {/* Top link */}
        <p className="text-right text-sm text-slate-400 mb-10">
          Don't have an account?{" "}
          <Link to="/register" className="text-sky-400 font-medium hover:underline">
            Sign up free →
          </Link>
        </p>

        {success ? (
          // ── Success State ──
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-teal-500/15 border-2 border-teal-400 flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-teal-500/20">✓</div>
            <h2 className="font-display text-2xl font-black mb-2">Welcome back!</h2>
            <p className="text-slate-400 text-sm">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-black mb-1.5">Sign in</h1>
            <p className="text-slate-400 text-sm mb-8">Select your role and enter your credentials</p>

            {/* Role selector */}
            <div className="mb-7">
              <RoleSelector
                value={selectedRole as UserRole}
                onChange={(role) => setValue("role", role)}
                error={errors.role?.message}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                type="email"
                icon="✉"
                placeholder="you@hospital.org"
                error={errors.email?.message}
                autoComplete="email"
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                icon="🔒"
                placeholder="••••••••••"
                error={errors.password?.message}
                autoComplete="current-password"
                {...register("password")}
              />

              {/* Remember me + forgot */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="accent-sky-400 w-3.5 h-3.5"
                    {...register("rememberMe")}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sky-400 cursor-pointer hover:underline">Forgot password?</Link>
              </div>

              {/* Server error */}
              {serverError && <Alert type="error" message={serverError} />}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                {!isLoading && `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6 text-xs text-slate-500">
              <div className="flex-1 h-px bg-white/[0.08]" />
              or continue with
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              {[["🔵", "Google"], ["🏥", "Hospital SSO"]].map(([icon, label]) => (
                <button
                  key={label}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-300 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 cursor-pointer"
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 text-center mt-6 leading-relaxed">
              By signing in you agree to our{" "}
              <span className="text-sky-400 cursor-pointer">Terms</span> and{" "}
              <span className="text-sky-400 cursor-pointer">Privacy Policy</span>.
              <br />This platform is for authorized medical personnel only.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
