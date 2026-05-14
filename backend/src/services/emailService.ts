import nodemailer from "nodemailer";
import { env } from "../config/env";

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  secure: env.EMAIL_PORT === "465",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// ── Send Registration OTP ─────────────────────────────────────────────────────
export const sendRegistrationOTP = async (
  toEmail: string,
  firstName: string,
  otp: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"NeuroALS" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your NeuroALS Registration OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
        <h2 style="color:#2dd4bf;margin-bottom:8px;">Verify your email</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">Hi ${firstName}, use the OTP below to complete your NeuroALS registration.</p>
        <div style="background:#1e293b;border:1px solid #2dd4bf33;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2dd4bf;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>`,
  });
};

// ── Send Password Reset OTP ───────────────────────────────────────────────────
export const sendPasswordResetOTP = async (
  toEmail: string,
  firstName: string,
  otp: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"NeuroALS" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: "NeuroALS Password Reset OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
        <h2 style="color:#38bdf8;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">Hi ${firstName}, use the OTP below to reset your NeuroALS password.</p>
        <div style="background:#1e293b;border:1px solid #38bdf833;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#38bdf8;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>`,
  });
};

// ── Send ALS Analysis Report ──────────────────────────────────────────────────
interface ReportData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientAge: number;
  patientSex: string;
  muscleStrength: number;
  muapDuration: number;
  muapAmplitude: number;
  percentPolyphasic: number;
  muscle: string;
  atrophy: string;
  recruitmentPattern: string;
  spontaneousActivity: string;
  alsProbability: number;
  label: string;
  riskLevel: string;
  prediction: number;
  analyzedAt: string;
}

const riskColor: Record<string, string> = {
  Low:      "#00ffaa",
  Moderate: "#ffd900",
  High:     "#ff7800",
  Critical: "#ff3250",
};

const riskFindings: Record<string, string[]> = {
  Low:      ["Low probability of ALS based on current parameters", "EMG values within normal neuromuscular range", "Muscle recruitment pattern appears functional"],
  Moderate: ["Moderate ALS risk — further evaluation recommended", "Some EMG parameters show mild deviation from normal", "Clinical correlation with patient history advised"],
  High:     ["High ALS probability detected from model", "Multiple EMG indicators suggest neuropathic changes", "Urgent neurologist consultation strongly advised"],
  Critical: ["Critical ALS risk — immediate specialist referral required", "Severe neuromuscular abnormalities across multiple parameters", "Comprehensive nerve conduction study and MRI urgently needed"],
};

const riskRecs: Record<string, string[]> = {
  Low:      ["Routine follow-up in 12 months", "Maintain active lifestyle", "Repeat EMG if new symptoms arise"],
  Moderate: ["Follow-up EMG in 3–6 months", "Consider physiotherapy consultation", "Evaluate for underlying systemic conditions"],
  High:     ["Prompt neurologist referral", "Begin targeted rehabilitation program", "MRI of affected muscle group recommended"],
  Critical: ["Urgent neuromuscular specialist consultation", "Comprehensive nerve conduction study required", "Consider muscle biopsy for histopathology", "Multidisciplinary care team involvement essential"],
};

export const sendALSReport = async (data: ReportData): Promise<void> => {
  const color = riskColor[data.riskLevel] || "#e2e8f0";
  const findings = (riskFindings[data.riskLevel] || []).map((f) => `<li style="margin-bottom:6px;">${f}</li>`).join("");
  const recs = (riskRecs[data.riskLevel] || []).map((r) => `<li style="margin-bottom:6px;">✓ ${r}</li>`).join("");

  const params = [
    ["Age", `${data.patientAge} years`],
    ["Sex", data.patientSex === "M" ? "Male" : data.patientSex === "F" ? "Female" : data.patientSex],
    ["Muscle Strength", `${data.muscleStrength}/5`],
    ["MUAP Duration", `${data.muapDuration} ms`],
    ["MUAP Amplitude", `${data.muapAmplitude} mV`],
    ["Polyphasic %", `${data.percentPolyphasic}%`],
    ["Muscle", data.muscle || "—"],
    ["Atrophy", data.atrophy || "—"],
    ["Recruitment Pattern", data.recruitmentPattern || "—"],
    ["Spontaneous Activity", data.spontaneousActivity || "—"],
  ].map(([k, v]) => `
    <tr>
      <td style="padding:8px 12px;color:#94a3b8;border-bottom:1px solid #1e293b;">${k}</td>
      <td style="padding:8px 12px;color:#e2e8f0;border-bottom:1px solid #1e293b;font-weight:500;">${v}</td>
    </tr>`).join("");

  await transporter.sendMail({
    from: `"NeuroALS" <${env.EMAIL_USER}>`,
    to: data.doctorEmail,
    subject: `NeuroALS Report — ${data.patientName} | ${data.riskLevel} Risk`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">

      <!-- Header -->
      <div style="display:flex;align-items:center;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #1e293b;">
        <div>
          <div style="font-size:22px;font-weight:900;color:#2dd4bf;">🧠 NeuroALS</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">AI-Powered ALS Analysis Report</div>
        </div>
      </div>

      <p style="color:#94a3b8;margin-bottom:20px;">
        Dear <strong style="color:#e2e8f0;">${data.doctorName}</strong>,<br/>
        The following ALS analysis report has been generated for your patient.
      </p>

      <!-- Risk Banner -->
      <div style="background:#1e293b;border:2px solid ${color}33;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">ALS Risk Level</div>
        <div style="font-size:32px;font-weight:900;color:${color};">${data.riskLevel}</div>
        <div style="font-size:14px;color:${color};margin-top:4px;">${data.label}</div>
        <div style="margin-top:16px;">
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">ALS Probability</div>
          <div style="background:#0f172a;border-radius:999px;height:10px;overflow:hidden;">
            <div style="width:${data.alsProbability}%;height:10px;background:${color};border-radius:999px;"></div>
          </div>
          <div style="font-size:20px;font-weight:bold;color:${color};margin-top:6px;">${data.alsProbability}%</div>
        </div>
      </div>

      <!-- Patient Info -->
      <div style="margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#2dd4bf;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Patient Information</div>
        <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:8px 12px;color:#94a3b8;border-bottom:1px solid #0f172a;">Patient Name</td>
            <td style="padding:8px 12px;color:#e2e8f0;border-bottom:1px solid #0f172a;font-weight:500;">${data.patientName}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#94a3b8;border-bottom:1px solid #0f172a;">Analyzed By</td>
            <td style="padding:8px 12px;color:#e2e8f0;border-bottom:1px solid #0f172a;font-weight:500;">${data.doctorName}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#94a3b8;">Date & Time</td>
            <td style="padding:8px 12px;color:#e2e8f0;font-weight:500;">${data.analyzedAt}</td>
          </tr>
        </table>
      </div>

      <!-- EMG Parameters -->
      <div style="margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#2dd4bf;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">EMG Parameters</div>
        <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden;">
          ${params}
        </table>
      </div>

      <!-- Findings -->
      <div style="margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#2dd4bf;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Model Findings</div>
        <ul style="background:#1e293b;border-radius:8px;padding:16px 16px 16px 32px;margin:0;color:#94a3b8;">${findings}</ul>
      </div>

      <!-- Recommendations -->
      <div style="margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:#2dd4bf;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Clinical Recommendations</div>
        <ul style="background:#1e293b;border-radius:8px;padding:16px 16px 16px 32px;margin:0;color:#94a3b8;">${recs}</ul>
      </div>

      <div style="border-top:1px solid #1e293b;padding-top:16px;font-size:11px;color:#475569;text-align:center;">
        This report is generated by NeuroALS AI. It is not a substitute for clinical judgment.<br/>
        Always verify findings with a qualified neurologist.
      </div>
    </div>`,
  });
};
