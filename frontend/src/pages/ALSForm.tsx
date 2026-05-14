import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  patientName: string;
  age: string;
  sex: string;
  muscleStrength: string;
  muapDuration: string;
  muapAmplitude: string;
  percentPolyphasic: string;
  muscle: string;
  atrophy: string;
  recruitmentPattern: string;
  spontaneousActivity: string;
}

interface ModelResult {
  prediction: number;
  alsProbability: number;
  probabilities: number[];
  label: string;
}

const initialForm: FormData = {
  patientName: '',
  age: '',
  sex: '',
  muscleStrength: '',
  muapDuration: '',
  muapAmplitude: '',
  percentPolyphasic: '',
  muscle: '',
  atrophy: '',
  recruitmentPattern: '',
  spontaneousActivity: '',
};

const API_URL = 'http://localhost:5000';

function getRiskLevel(prob: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
  if (prob < 25) return 'Low';
  if (prob < 50) return 'Moderate';
  if (prob < 75) return 'High';
  return 'Critical';
}

const riskColors: Record<
  string,
  { glow: string; text: string; bar: string; border: string }
> = {
  Low: {
    glow: 'rgba(0,255,170,0.15)',
    text: '#00ffaa',
    bar: '#00ffaa',
    border: 'rgba(0,255,170,0.4)',
  },
  Moderate: {
    glow: 'rgba(255,220,0,0.15)',
    text: '#ffd900',
    bar: '#ffd900',
    border: 'rgba(255,220,0,0.4)',
  },
  High: {
    glow: 'rgba(255,120,0,0.15)',
    text: '#ff7800',
    bar: '#ff7800',
    border: 'rgba(255,120,0,0.4)',
  },
  Critical: {
    glow: 'rgba(255,50,80,0.18)',
    text: '#ff3250',
    bar: '#ff3250',
    border: 'rgba(255,50,80,0.5)',
  },
};

const riskFindings: Record<string, string[]> = {
  Low: [
    'Low probability of ALS based on current parameters',
    'EMG values within normal neuromuscular range',
    'Muscle recruitment pattern appears functional',
  ],
  Moderate: [
    'Moderate ALS risk — further evaluation recommended',
    'Some EMG parameters show mild deviation from normal',
    'Clinical correlation with patient history advised',
  ],
  High: [
    'High ALS probability detected from model',
    'Multiple EMG indicators suggest neuropathic changes',
    'Urgent neurologist consultation strongly advised',
  ],
  Critical: [
    'Critical ALS risk — immediate specialist referral required',
    'Severe neuromuscular abnormalities across multiple parameters',
    'Comprehensive nerve conduction study and MRI urgently needed',
  ],
};

const riskRecs: Record<string, string[]> = {
  Low: [
    'Routine follow-up in 12 months',
    'Maintain active lifestyle',
    'Repeat EMG if new symptoms arise',
  ],
  Moderate: [
    'Follow-up EMG in 3–6 months',
    'Consider physiotherapy consultation',
    'Evaluate for underlying systemic conditions',
    'Monitor for symptom progression',
  ],
  High: [
    'Prompt neurologist referral',
    'Begin targeted rehabilitation program',
    'MRI of affected muscle group recommended',
    'Investigate autoimmune and metabolic causes',
  ],
  Critical: [
    'Urgent neuromuscular specialist consultation',
    'Comprehensive nerve conduction study required',
    'Consider muscle biopsy for histopathology',
    'Multidisciplinary care team involvement essential',
    'Nutritional and respiratory support evaluation',
  ],
};

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Analysis', path: '/analysis' },
  { name: 'Reports', path: '/reports' },
  { name: 'About', path: '/about' },
];

export default function ALSForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<FormData>(initialForm);
  const [result, setResult] = useState<ModelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { token } = useAuth();

  const update = (k: keyof FormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseFloat(form.age),
          sex: form.sex,
          muscleStrength: parseFloat(form.muscleStrength),
          muapDuration: parseFloat(form.muapDuration || '0'),
          muapAmplitude: parseFloat(form.muapAmplitude || '0'),
          percentPolyphasic: parseFloat(form.percentPolyphasic || '0'),
          diagnosis: '',
          muscle: form.muscle,
          atrophy: form.atrophy,
          recruitmentPattern: form.recruitmentPattern,
          spontaneousActivity: form.spontaneousActivity,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Prediction failed');

      setResult(data);
      setAnalyzed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(
        msg.includes('fetch')
          ? '❌ Backend se connect nahi ho paya. Make sure app.py chal raha ho port 5000 pe.'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!result || !riskLevel) return;
    if (!form.patientName.trim()) {
      setSaveError('Please enter patient name before saving.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(
        'http://localhost:5001/api/patients/save-report',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientName: form.patientName,
            patientAge: form.age,
            patientSex: form.sex,
            muscleStrength: form.muscleStrength,
            muapDuration: form.muapDuration,
            muapAmplitude: form.muapAmplitude,
            percentPolyphasic: form.percentPolyphasic,
            muscle: form.muscle,
            atrophy: form.atrophy,
            recruitmentPattern: form.recruitmentPattern,
            spontaneousActivity: form.spontaneousActivity,
            prediction: result.prediction,
            alsProbability: result.alsProbability,
            label: result.label,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
      } else {
        setSaveError(data.message || 'Failed to save report.');
      }
    } catch {
      setSaveError('Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setAnalyzed(false);
    setSaveSuccess(false);
    setSaveError(null);
    setError(null);
  };

  const riskLevel = result ? getRiskLevel(result.alsProbability) : null;
  const rc = riskLevel ? riskColors[riskLevel] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; overflow: hidden; }
        body { font-family: 'DM Mono', monospace; }

        :root {
          --bg-deep:    #040b14;
          --bg-panel:   #070f1c;
          --bg-card:    #0a1628;
          --bg-input:   #0d1e35;
          --border:     rgba(0, 200, 255, 0.12);
          --border-h:   rgba(0, 200, 255, 0.35);
          --cyan:       #00c8ff;
          --cyan-dim:   rgba(0, 200, 255, 0.6);
          --cyan-glow:  rgba(0, 200, 255, 0.15);
          --text-hi:    #e8f4ff;
          --text-mid:   #6b8faf;
          --text-lo:    #2d4a6a;
          --accent:     #00ffcc;
        }

        .app {
          display: flex; flex-direction: column;
          height: 100vh; width: 100vw; overflow: hidden;
          background: var(--bg-deep);
          background-image:
            radial-gradient(ellipse 60% 50% at 10% 0%, rgba(0,120,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(0,200,255,0.06) 0%, transparent 70%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 59px,
              rgba(0,200,255,0.025) 59px,
              rgba(0,200,255,0.025) 60px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 59px,
              rgba(0,200,255,0.025) 59px,
              rgba(0,200,255,0.025) 60px
            );
        }

        /* ── Navbar ── */
        .nav {
          flex-shrink: 0; height: 52px;
          background: rgba(4, 11, 20, 0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          justify-content: space-between; padding: 0 1.4rem;
          z-index: 100;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-icon {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #0050ff, #00c8ff);
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; font-size: 14px;
          box-shadow: 0 0 14px rgba(0,200,255,0.4);
        }
        .nav-logo-name {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1rem; letter-spacing: -0.01em;
        }
        .nav-logo-name span { color: var(--cyan); }
        .nav-logo-sub { font-size: 0.54rem; color: var(--text-mid); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px; }

        .nav-links { display: flex; gap: 1.6rem; list-style: none; }
        .nav-links a {
          font-size: 0.72rem; color: var(--text-mid);
          text-decoration: none; font-weight: 500; cursor: pointer;
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--cyan); }
        .nav-links a.active { color: var(--cyan); }

        .nav-avatar {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #0050ff, #00c8ff);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 0.6rem; font-weight: 700;
          color: white; cursor: pointer;
          box-shadow: 0 0 10px rgba(0,200,255,0.3);
          font-family: 'Syne', sans-serif;
        }

        /* ── Body ── */
        .body {
          flex: 1; display: flex; gap: 0.8rem;
          padding: 0.8rem; overflow: hidden; min-height: 0;
        }

        /* ── Panel ── */
        .panel {
          flex: 1; background: var(--bg-panel);
          border-radius: 14px; border: 1px solid var(--border);
          display: flex; flex-direction: column;
          overflow: hidden; min-width: 0;
          box-shadow: 0 0 40px rgba(0,200,255,0.04), inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .panel-head {
          flex-shrink: 0; padding: 0.7rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
          background: rgba(0, 200, 255, 0.02);
        }
        .panel-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 13px;
        }
        .panel-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.88rem; color: var(--text-hi); letter-spacing: -0.01em;
        }
        .panel-sub { font-size: 0.6rem; color: var(--text-mid); margin-top: 1px; }

        .model-badge {
          margin-left: auto; display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 99px;
          background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.2);
          font-size: 0.58rem; font-weight: 600; color: var(--cyan);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .model-dot {
          width: 5px; height: 5px; background: var(--cyan);
          border-radius: 50%; box-shadow: 0 0 6px var(--cyan);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

        /* ── Scroll ── */
        .scroll { flex: 1; overflow-y: auto; padding: 0.8rem 1rem; min-height: 0; }
        .scroll::-webkit-scrollbar { width: 2px; }
        .scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        /* ── Section Label ── */
        .sec-label {
          font-size: 0.58rem; font-weight: 600; color: var(--cyan);
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 0.5rem; margin-top: 0.75rem;
          display: flex; align-items: center; gap: 6px;
        }
        .sec-label::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(0,200,255,0.2), transparent);
        }
        .sec-label:first-child { margin-top: 0; }

        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .full { grid-column: 1 / -1; }
        .fg { display: flex; flex-direction: column; gap: 3px; }

        .label {
          font-size: 0.58rem; font-weight: 500; color: var(--text-mid);
          letter-spacing: 0.08em; text-transform: uppercase;
        }

        .inp {
          width: 100%; padding: 6px 10px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 7px; outline: none;
          font-family: 'DM Mono', monospace; font-size: 0.78rem;
          color: var(--text-hi);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .inp:focus {
          border-color: var(--cyan-dim);
          box-shadow: 0 0 0 3px rgba(0,200,255,0.08), inset 0 0 12px rgba(0,200,255,0.04);
        }
        .inp::placeholder { color: var(--text-lo); }
        .inp option { background: #0a1628; }

        .sel {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b8faf' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 8px center;
          padding-right: 26px; cursor: pointer;
        }

        .divider { height: 1px; background: var(--border); margin: 0.65rem 0; }

        /* ── Buttons ── */
        .btn-primary {
          width: 100%; padding: 9px;
          background: linear-gradient(135deg, #0050ff, #00c8ff);
          border: none; border-radius: 9px; color: white;
          font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700;
          cursor: pointer; margin-top: 0.7rem; letter-spacing: 0.03em;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          box-shadow: 0 4px 20px rgba(0,150,255,0.3);
          position: relative; overflow: hidden;
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,200,255,0.4);
        }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-secondary {
          width: 100%; padding: 7px; background: transparent;
          border: 1px solid var(--border); border-radius: 9px;
          color: var(--text-mid); font-family: 'DM Mono', monospace;
          font-size: 0.72rem; cursor: pointer; margin-top: 6px;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-secondary:hover { border-color: var(--border-h); color: var(--text-hi); }

        .spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-box {
          margin-top: 0.6rem; padding: 9px 12px;
          background: rgba(255,50,80,0.08); border: 1px solid rgba(255,50,80,0.3);
          border-radius: 8px; font-size: 0.72rem; color: #ff3250; line-height: 1.5;
        }

        /* ── Empty State ── */
        .empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 100%; gap: 10px;
          text-align: center; padding: 2rem;
        }
        .empty-icon {
          width: 56px; height: 56px;
          background: rgba(0,200,255,0.06); border: 1px solid var(--border);
          border-radius: 14px; display: flex; align-items: center;
          justify-content: center; font-size: 24px;
          box-shadow: 0 0 20px rgba(0,200,255,0.08);
        }
        .empty-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.9rem; color: var(--text-hi);
        }
        .empty-desc { font-size: 0.7rem; color: var(--text-mid); max-width: 180px; line-height: 1.5; }

        /* ── Results ── */
        .risk-banner {
          border-radius: 11px; padding: 0.85rem 1rem; margin-bottom: 0.8rem;
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg-card); border-width: 1px; border-style: solid;
          position: relative; overflow: hidden;
        }
        .risk-banner::before {
          content: ''; position: absolute; inset: 0;
          background: var(--rc-glow);
          pointer-events: none;
        }
        .risk-lbl { font-size: 0.55rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7; }
        .risk-val { font-family: 'Syne', sans-serif; font-size: 1.7rem; font-weight: 800; letter-spacing: -0.03em; margin-top: 2px; }
        .risk-pill {
          padding: 4px 12px; border-radius: 99px; font-size: 0.68rem;
          font-weight: 600; background: rgba(0,0,0,0.3); border-width: 1px; border-style: solid;
          font-family: 'Syne', sans-serif;
        }

        .prob-wrap { margin-bottom: 0.8rem; }
        .prob-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .prob-label { font-size: 0.58rem; font-weight: 600; color: var(--text-mid); text-transform: uppercase; letter-spacing: 0.1em; }
        .prob-value { font-size: 0.82rem; font-weight: 700; font-family: 'Syne', sans-serif; }
        .prob-track { height: 6px; background: var(--bg-input); border-radius: 99px; overflow: hidden; border: 1px solid var(--border); }
        .prob-fill { height: 100%; border-radius: 99px; transition: width 0.9s cubic-bezier(0.34,1.2,0.64,1); }

        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 0.8rem; }
        .meta-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 9px; padding: 7px; text-align: center; }
        .meta-lbl { font-size: 0.52rem; font-weight: 600; color: var(--text-mid); letter-spacing: 0.1em; text-transform: uppercase; }
        .meta-val { font-size: 0.82rem; font-weight: 600; color: var(--text-hi); margin-top: 2px; font-family: 'Syne', sans-serif; }

        .summary {
          background: rgba(0,200,255,0.04); border: 1px solid rgba(0,200,255,0.15);
          border-radius: 9px; padding: 9px 11px;
          font-size: 0.72rem; color: var(--text-mid); line-height: 1.55;
          margin-bottom: 0.8rem;
        }
        .summary strong { color: var(--cyan); font-weight: 500; }

        .findings { display: flex; flex-direction: column; gap: 5px; }
        .finding {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 0.72rem; color: var(--text-mid); padding: 7px 9px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 7px; line-height: 1.45;
        }
        .finding-num {
          min-width: 18px; height: 18px; border-radius: 5px;
          background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.2);
          color: var(--cyan); font-size: 0.58rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          font-family: 'Syne', sans-serif;
        }

        .recs { display: flex; flex-direction: column; gap: 5px; }
        .rec { display: flex; align-items: flex-start; gap: 8px; font-size: 0.72rem; color: var(--text-mid); line-height: 1.45; }
        .rec-check {
          min-width: 16px; height: 16px; border-radius: 50%;
          background: rgba(0,255,170,0.1); border: 1px solid rgba(0,255,170,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; color: #00ffaa; margin-top: 1px; flex-shrink: 0;
        }

        @keyframes fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fadein { animation: fadein 0.35s ease; }
      `}</style>

      <div className="app">
        {/* ── Navbar ── */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            <div>
              <div className="nav-logo-name">
                Neuro<span>ALS</span>
              </div>
              <div className="nav-logo-sub">EMG Analysis Platform</div>
            </div>
          </div>
          <ul className="nav-links">
            {navItems.map(({ name, path }) => (
              <li key={name}>
                <a
                  className={location.pathname === path ? 'active' : ''}
                  onClick={() => navigate(path)}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-avatar">Dr</div>
        </nav>

        {/* ── Body ── */}
        <div className="body">
          {/* LEFT: Input Panel */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-icon">📋</div>
              <div>
                <div className="panel-title">Input Parameters</div>
                <div className="panel-sub">
                  Enter patient data to run ALS prediction
                </div>
              </div>
              <div className="model-badge">
                <div className="model-dot" />
                LightGBM Model
              </div>
            </div>

            <div className="scroll">
              {/* Demographics */}
              <div className="sec-label">Patient Demographics</div>
              <div className="fg full" style={{ marginBottom: '10px' }}>
                <label className="label">Patient Name *</label>
                <input
                  className="inp"
                  type="text"
                  placeholder="e.g., John Doe"
                  value={form.patientName}
                  onChange={(e) => update('patientName', e.target.value)}
                />
              </div>
              <div className="grid2">
                <div className="fg">
                  <label className="label">Age</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="e.g., 45"
                    value={form.age}
                    onChange={(e) => update('age', e.target.value)}
                  />
                </div>
                <div className="fg">
                  <label className="label">Sex</label>
                  <select
                    className="inp sel"
                    value={form.sex}
                    onChange={(e) => update('sex', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="fg">
                  <label className="label">Muscle Strength (1–5)</label>
                  <input
                    className="inp"
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    placeholder="e.g., 4"
                    value={form.muscleStrength}
                    onChange={(e) => update('muscleStrength', e.target.value)}
                  />
                </div>
                <div className="fg">
                  <label className="label">Muscle</label>
                  <select
                    className="inp sel"
                    value={form.muscle}
                    onChange={(e) => update('muscle', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Medial_vastus">Medial Vastus</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="divider" />

              {/* MUAP */}
              <div className="sec-label">MUAP Parameters</div>
              <div className="grid2">
                <div className="fg">
                  <label className="label">MUAP Duration (ms)</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="e.g., 12"
                    value={form.muapDuration}
                    onChange={(e) => update('muapDuration', e.target.value)}
                  />
                </div>
                <div className="fg">
                  <label className="label">MUAP Amplitude (μV)</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="e.g., 500"
                    value={form.muapAmplitude}
                    onChange={(e) => update('muapAmplitude', e.target.value)}
                  />
                </div>
                <div className="fg full">
                  <label className="label">% Polyphasic Potentials</label>
                  <input
                    className="inp"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 15"
                    value={form.percentPolyphasic}
                    onChange={(e) =>
                      update('percentPolyphasic', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="divider" />

              {/* Clinical Findings */}
              <div className="sec-label">Clinical Findings</div>
              <div className="grid2">
                <div className="fg">
                  <label className="label">Atrophy</label>
                  <select
                    className="inp sel"
                    value={form.atrophy}
                    onChange={(e) => update('atrophy', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="0">0 — None</option>
                    <option value="+">+ — Mild</option>
                    <option value="++">++ — Moderate</option>
                    <option value="+++">+++ — Severe</option>
                  </select>
                </div>
                <div className="fg">
                  <label className="label">Recruitment Pattern</label>
                  <select
                    className="inp sel"
                    value={form.recruitmentPattern}
                    onChange={(e) =>
                      update('recruitmentPattern', e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="Full">Full</option>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Discrete">Discrete</option>
                  </select>
                </div>
                <div className="fg full">
                  <label className="label">Spontaneous Activity</label>
                  <select
                    className="inp sel"
                    value={form.spontaneousActivity}
                    onChange={(e) =>
                      update('spontaneousActivity', e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="FA">FA</option>
                    <option value="Many_FA">Many FA</option>
                    <option value="DTF_PSW">DTF + PSW</option>
                    <option value="DTF_PSW_FA">DTF + PSW + FA</option>
                    <option value="DTF_Many_FA">DTF + Many FA</option>
                    <option value="Many_DTF_Many_FA">Many DTF + Many FA</option>
                  </select>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading || !form.age || !form.muscleStrength}
              >
                {loading ? (
                  <>
                    <div className="spinner" /> Running Model...
                  </>
                ) : (
                  <>⚡ Run ALS Prediction</>
                )}
              </button>

              <button className="btn-secondary" onClick={handleReset}>
                Reset Parameters
              </button>

              {error && <div className="error-box">{error}</div>}
            </div>
          </div>

          {/* RIGHT: Results Panel */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-icon">📊</div>
              <div>
                <div className="panel-title">Analysis Results</div>
                <div className="panel-sub">
                  LightGBM model prediction output
                </div>
              </div>
            </div>

            <div className="scroll">
              {!analyzed && !loading && (
                <div className="empty">
                  <div className="empty-icon">🧬</div>
                  <div className="empty-title">No Prediction Yet</div>
                  <div className="empty-desc">
                    Please enter the required parameters and run the ALS
                    prediction
                  </div>
                </div>
              )}

              {loading && (
                <div className="empty">
                  <div className="empty-icon">⚙️</div>
                  <div className="empty-title">Running XGBoost Model...</div>
                  <div className="empty-desc">
                    Processing neuromuscular parameters
                  </div>
                </div>
              )}

              {analyzed && result && !loading && riskLevel && rc && (
                <div className="fadein">
                  <div
                    className="risk-banner"
                    style={{
                      borderColor: rc.border,
                      // @ts-expect-error -- CSS custom property not in React.CSSProperties
                      '--rc-glow': rc.glow,
                    }}
                  >
                    <div>
                      <div className="risk-lbl" style={{ color: rc.text }}>
                        ALS Risk Level
                      </div>
                      <div className="risk-val" style={{ color: rc.text }}>
                        {riskLevel}
                      </div>
                    </div>
                    <div
                      className="risk-pill"
                      style={{ color: rc.text, borderColor: rc.border }}
                    >
                      {result.label}
                    </div>
                  </div>

                  <div className="prob-wrap">
                    <div className="prob-header">
                      <span className="prob-label">ALS Probability</span>
                      <span className="prob-value" style={{ color: rc.text }}>
                        {result.alsProbability}%
                      </span>
                    </div>
                    <div className="prob-track">
                      <div
                        className="prob-fill"
                        style={{
                          width: `${result.alsProbability}%`,
                          background: rc.bar,
                          boxShadow: `0 0 10px ${rc.bar}80`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="meta-grid">
                    {[
                      { label: 'Age', val: form.age || '—' },
                      {
                        label: 'Strength',
                        val: form.muscleStrength
                          ? `${form.muscleStrength}/5`
                          : '—',
                      },
                      {
                        label: 'Polyphasic',
                        val: form.percentPolyphasic
                          ? `${form.percentPolyphasic}%`
                          : '—',
                      },
                      { label: 'Atrophy', val: form.atrophy || '—' },
                    ].map(({ label, val }) => (
                      <div key={label} className="meta-item">
                        <div className="meta-lbl">{label}</div>
                        <div className="meta-val">{val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="summary">
                    Model predicts{' '}
                    <strong>{result.alsProbability}% ALS probability</strong>{' '}
                    for{' '}
                    {form.sex === 'M'
                      ? 'male'
                      : form.sex === 'F'
                        ? 'female'
                        : ''}{' '}
                    patient aged {form.age || '—'}. Risk level:{' '}
                    <strong>{riskLevel}</strong>.{' '}
                    {result.prediction === 1
                      ? 'ALS indicators detected.'
                      : 'No ALS pattern detected.'}
                  </div>

                  <div className="sec-label" style={{ marginTop: 0 }}>
                    Model Findings
                  </div>
                  <div className="findings">
                    {riskFindings[riskLevel].map((f, i) => (
                      <div key={i} className="finding">
                        <div className="finding-num">{i + 1}</div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="divider" />

                  <div className="sec-label" style={{ marginTop: 0 }}>
                    Clinical Recommendations
                  </div>
                  <div className="recs">
                    {riskRecs[riskLevel].map((r, i) => (
                      <div key={i} className="rec">
                        <div className="rec-check">✓</div>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Save & Email Report */}
                  <div className="divider" />
                  {saveSuccess ? (
                    <div
                      style={{
                        background: 'rgba(0,255,170,0.08)',
                        border: '1px solid rgba(0,255,170,0.3)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        textAlign: 'center',
                        color: '#00ffaa',
                        fontSize: '13px',
                      }}
                    >
                      ✅ Report saved & emailed to your registered email!{' '}
                      <button
                        onClick={() => navigate('/patient-history')}
                        style={{
                          color: '#00c8ff',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '13px',
                        }}
                      >
                        View History →
                      </button>
                    </div>
                  ) : (
                    <>
                      {saveError && (
                        <div
                          style={{
                            background: 'rgba(255,50,80,0.08)',
                            border: '1px solid rgba(255,50,80,0.3)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: '#ff3250',
                            fontSize: '12px',
                            marginBottom: '10px',
                          }}
                        >
                          ⚠ {saveError}
                        </div>
                      )}
                      <button
                        className="btn-primary"
                        onClick={handleSaveReport}
                        disabled={saving}
                        style={{ marginTop: '4px' }}
                      >
                        {saving ? (
                          <>
                            <div className="spinner" /> Saving & Sending
                            Email...
                          </>
                        ) : (
                          <>📧 Save Report & Email to Me</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
