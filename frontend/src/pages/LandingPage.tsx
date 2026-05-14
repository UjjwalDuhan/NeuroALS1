import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

type Page = 'home' | 'features' | 'how-it-works' | 'about-als' | 'research';

const stats = [
  { value: '96%', label: 'Model Accuracy' },
  { value: '--', label: 'Cases Analyzed' },
  { value: '<2s', label: 'Prediction Time' },
  { value: '4', label: 'EMG Channels' },
];

const features = [
  {
    icon: '⚡',
    title: 'EMG Signal Analysis',
    desc: 'Multi-channel processing with FFT, wavelet decomposition, and automated abnormality detection.',
  },
  {
    icon: '🧠',
    title: 'Transformer AI Model',
    desc: 'Modular PyTorch backbone for time-series medical signals — swap model weights without redeployment.',
  },
  {
    icon: '🔍',
    title: 'Explainable AI (SHAP)',
    desc: 'Attention heatmaps and SHAP values reveal exactly which features drive each diagnosis.',
  },
  {
    icon: '🔐',
    title: 'Clinical-Grade Security',
    desc: 'JWT auth, bcrypt hashing, role-based access control, and full audit logging.',
  },
  {
    icon: '📊',
    title: 'Model Comparison',
    desc: 'Benchmark Logistic Regression, Random Forest, SVM, and Transformer side-by-side.',
  },
  {
    icon: '🔬',
    title: 'Research Ready',
    desc: 'Anonymized dataset export and researcher dashboard built for publication-grade analysis.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Patient Intake',
    desc: 'Enter age, symptom duration, weakness score, and clinical notes.',
  },
  {
    n: '02',
    title: 'Upload EMG',
    desc: 'Upload raw CSV recordings. Our pipeline denoises and normalizes automatically.',
  },
  {
    n: '03',
    title: 'AI Analysis',
    desc: 'The transformer extracts temporal patterns and cross-correlates with clinical features.',
  },
  {
    n: '04',
    title: 'Explainable Result',
    desc: 'Receive prediction, confidence, risk score, and SHAP-driven feature explanations.',
  },
];

const mlModels = [
  { name: 'LightGBM', acc: 96, highlight: true, color: '#1d8cf8' },
  { name: 'XGBoost', acc: 95, highlight: false, color: '#00d4b4' },
  { name: 'Random Forest', acc: 95.5, highlight: false, color: '#818cf8' },
  { name: 'TabNet', acc: 95.5, highlight: false, color: '#60a5fa' },
  { name: 'SVM', acc: 93.5, highlight: false, color: '#a78bfa' },
  { name: 'Logistic Reg.', acc: 95.5, highlight: false, color: '#94a3b8' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ALS NEUROLOGICAL ILLUSTRATION  v2
   Realistic brain silhouette · clearer labels · better spatial layout
   Flow: Brain (Motor Cortex) → Corticospinal Tract → Spinal Cord →
         Peripheral Nerve (ALS break) → Muscle Atrophy
───────────────────────────────────────────────────────────────────────────── */
/* ─── ALS Illustration v5 ─── */
const ALSIllustration: React.FC = () => (
  <svg
    viewBox="0 0 580 680"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-[520px] mx-auto select-none"
  >
    <defs>
      <radialGradient id="v5-bg1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1d8cf8" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1d8cf8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="v5-bg2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00d4b4" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#00d4b4" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="v5-bg3" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f87171" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="v5-axon" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1d8cf8" />
        <stop offset="100%" stopColor="#00d4b4" />
      </linearGradient>
      <filter id="v5-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="v5-sglow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="8" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="v5-aura">
        <feGaussianBlur stdDeviation="20" />
      </filter>
      <marker
        id="v5-arr"
        markerWidth="9"
        markerHeight="9"
        refX="7"
        refY="4.5"
        orient="auto"
      >
        <path d="M0,1 L8,4.5 L0,8 Z" fill="#00d4b4" />
      </marker>
    </defs>

    {/* ambient glows */}
    <ellipse
      cx="230"
      cy="118"
      rx="115"
      ry="105"
      fill="url(#v5-bg1)"
      filter="url(#v5-aura)"
    />
    <ellipse
      cx="230"
      cy="390"
      rx="44"
      ry="130"
      fill="url(#v5-bg2)"
      filter="url(#v5-aura)"
    />
    <ellipse
      cx="295"
      cy="580"
      rx="68"
      ry="50"
      fill="url(#v5-bg3)"
      filter="url(#v5-aura)"
    />

    {/* ── LEFT STEP RAIL ── */}
    {(
      [
        { y: 88, n: '1', l1: 'Motor Cortex', l2: 'fires signal', c: '#1d8cf8' },
        { y: 298, n: '2', l1: 'Enters spinal', l2: 'cord', c: '#00d4b4' },
        { y: 456, n: '3', l1: 'ALS breaks', l2: 'nerve signal', c: '#f87171' },
        { y: 575, n: '4', l1: 'Muscle loses', l2: 'innervation', c: '#f87171' },
      ] as { y: number; n: string; l1: string; l2: string; c: string }[]
    ).map(({ y, n, l1, l2, c }) => (
      <g key={n}>
        <circle
          cx="18"
          cy={y}
          r="11"
          fill={`${c}22`}
          stroke={c}
          strokeWidth="1.3"
        />
        <text
          x="18"
          y={y + 4}
          textAnchor="middle"
          fill={c}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {n}
        </text>
        <text
          x="36"
          y={y - 3}
          fill={c}
          fontSize="8.5"
          fontFamily="monospace"
          opacity="0.9"
        >
          {l1}
        </text>
        <text
          x="36"
          y={y + 10}
          fill={c}
          fontSize="8.5"
          fontFamily="monospace"
          opacity="0.55"
        >
          {l2}
        </text>
      </g>
    ))}
    <line
      x1="18"
      y1="102"
      x2="18"
      y2="286"
      stroke="rgba(255,255,255,0.07)"
      strokeWidth="1"
      strokeDasharray="3 6"
    />
    <line
      x1="18"
      y1="312"
      x2="18"
      y2="444"
      stroke="rgba(255,255,255,0.07)"
      strokeWidth="1"
      strokeDasharray="3 6"
    />
    <line
      x1="18"
      y1="470"
      x2="18"
      y2="563"
      stroke="rgba(255,255,255,0.07)"
      strokeWidth="1"
      strokeDasharray="3 6"
    />

    {/* ════════════════════════════════════
        BRAIN — simple clean rounded rectangle
        with "BRAIN" label + sulci lines + motor cortex highlight
        Centre x=230, top y=18, width=160, height=140
    ════════════════════════════════════ */}

    {/* outer glow */}
    <rect
      x="148"
      y="16"
      width="164"
      height="144"
      rx="60"
      fill="none"
      stroke="rgba(29,140,248,0.12)"
      strokeWidth="12"
      filter="url(#v5-aura)"
    />

    {/* brain fill */}
    <rect x="150" y="18" width="160" height="140" rx="58" fill="#0b1e38" />

    {/* sulci — horizontal curved groove lines across brain */}
    <path
      d="M168 55 C190 50 220 50 250 52 C272 54 288 58 298 64"
      stroke="#1d8cf8"
      strokeWidth="1.4"
      strokeOpacity="0.55"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M160 78 C182 72 215 71 248 73 C270 75 288 80 300 87"
      stroke="#1d8cf8"
      strokeWidth="1.2"
      strokeOpacity="0.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M156 102 C180 96 214 95 248 97 C270 99 288 105 299 112"
      stroke="#1d8cf8"
      strokeWidth="1.2"
      strokeOpacity="0.45"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M158 126 C180 120 214 119 246 121 C266 123 283 129 293 136"
      stroke="#1d8cf8"
      strokeWidth="1.1"
      strokeOpacity="0.4"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M166 148 C186 143 212 142 238 143 C256 144 270 148 278 153"
      stroke="#1d8cf8"
      strokeWidth="1.0"
      strokeOpacity="0.32"
      strokeLinecap="round"
      fill="none"
    />

    {/* vertical sulci */}
    <path
      d="M210 22 C208 40 207 62 208 86 C209 108 212 128 215 144"
      stroke="#1d8cf8"
      strokeWidth="1.2"
      strokeOpacity="0.45"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M240 20 C238 38 237 60 238 84 C239 106 242 126 245 142"
      stroke="#1d8cf8"
      strokeWidth="1.1"
      strokeOpacity="0.38"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M270 24 C269 42 269 64 270 88 C271 110 273 130 275 146"
      stroke="#1d8cf8"
      strokeWidth="1.0"
      strokeOpacity="0.32"
      strokeLinecap="round"
      fill="none"
    />

    {/* Motor cortex highlight strip — left-centre band */}
    <path
      d="M198 22 C208 20 216 21 220 26 C222 36 222 56 220 78
             C218 98 215 118 213 136 C211 146 210 153 210 157
             C205 154 200 146 198 136 C195 120 194 100 195 80
             C196 58 197 38 198 22 Z"
      fill="rgba(29,140,248,0.25)"
      stroke="#1d8cf8"
      strokeWidth="1.6"
      strokeOpacity="0.95"
    />
    <text
      x="207"
      y="86"
      textAnchor="middle"
      fill="#1d8cf8"
      fontSize="7.5"
      fontFamily="monospace"
      fontWeight="bold"
    >
      Motor
    </text>
    <text
      x="207"
      y="97"
      textAnchor="middle"
      fill="#1d8cf8"
      fontSize="7.5"
      fontFamily="monospace"
      fontWeight="bold"
    >
      Cortex
    </text>

    {/* brain outer border */}
    <rect
      x="150"
      y="18"
      width="160"
      height="140"
      rx="58"
      fill="none"
      stroke="#1d8cf8"
      strokeWidth="2.2"
      filter="url(#v5-glow)"
    />

    {/* BRAIN text — inside top-right of brain, clear of sulci */}
    <text
      x="272"
      y="44"
      textAnchor="middle"
      fill="#1d8cf8"
      fontSize="12"
      fontFamily="monospace"
      fontWeight="bold"
      opacity="0.85"
    >
      BRAIN
    </text>

    {/* brain stem out bottom */}
    <rect
      x="220"
      y="157"
      width="20"
      height="46"
      rx="7"
      fill="#081526"
      stroke="#1d8cf8"
      strokeWidth="1.2"
      strokeOpacity="0.6"
    />

    {/* Upper MN cell */}
    <circle
      cx="230"
      cy="205"
      r="8"
      fill="#060d1a"
      stroke="#1d8cf8"
      strokeWidth="2.2"
      filter="url(#v5-glow)"
    />
    <circle cx="230" cy="205" r="4" fill="#1d8cf8" opacity="0.95" />

    {/* right label: Upper MN — y=196, clear above tract label */}
    <line
      x1="239"
      y1="203"
      x2="358"
      y2="190"
      stroke="#1d8cf8"
      strokeWidth="0.9"
      strokeDasharray="4 3"
      strokeOpacity="0.6"
    />
    <rect
      x="360"
      y="180"
      width="156"
      height="22"
      rx="5"
      fill="rgba(5,12,24,0.95)"
      stroke="#1d8cf8"
      strokeWidth="0.9"
      strokeOpacity="0.65"
    />
    <text
      x="438"
      y="194"
      textAnchor="middle"
      fill="#1d8cf8"
      fontSize="9.5"
      fontFamily="monospace"
    >
      Upper Motor Neuron
    </text>

    {/* ── CORTICOSPINAL TRACT ── */}
    <path
      d="M230 213 L230 282"
      stroke="url(#v5-axon)"
      strokeWidth="4.5"
      strokeLinecap="round"
      filter="url(#v5-glow)"
      markerEnd="url(#v5-arr)"
    />
    {[224, 238, 252, 266].map((y, i) => (
      <ellipse
        key={i}
        cx="230"
        cy={y}
        rx="8"
        ry="3.5"
        fill="rgba(29,140,248,0.1)"
        stroke="#1d8cf8"
        strokeWidth="1"
        strokeOpacity="0.48"
      />
    ))}

    {/* right label: Corticospinal Tract — y=248, 30px below Upper MN */}
    <line
      x1="239"
      y1="248"
      x2="358"
      y2="240"
      stroke="#00d4b4"
      strokeWidth="0.8"
      strokeDasharray="3 3"
      strokeOpacity="0.55"
    />
    <rect
      x="360"
      y="230"
      width="156"
      height="22"
      rx="5"
      fill="rgba(5,12,24,0.95)"
      stroke="#00d4b4"
      strokeWidth="0.9"
      strokeOpacity="0.55"
    />
    <text
      x="438"
      y="244"
      textAnchor="middle"
      fill="#00d4b4"
      fontSize="9.5"
      fontFamily="monospace"
    >
      Corticospinal Tract
    </text>

    {/* ── SPINAL CORD (x≈212–248, y≈290–520) ── */}
    <rect
      x="212"
      y="288"
      width="36"
      height="230"
      rx="11"
      fill="rgba(5,12,24,0.92)"
      stroke="#00d4b4"
      strokeWidth="1.6"
      strokeOpacity="0.65"
    />

    {Array.from({ length: 8 }, (_, i) => (
      <g key={i}>
        <rect
          x="204"
          y={294 + i * 27}
          width="52"
          height="18"
          rx="5"
          fill="rgba(8,18,36,0.85)"
          stroke="#00d4b4"
          strokeWidth="1"
          strokeOpacity={Math.max(0.14, 0.58 - i * 0.06)}
        />
        <path
          d={`M204 ${299 + i * 27} L196 ${303 + i * 27} L204 ${307 + i * 27}`}
          fill="none"
          stroke="#00d4b4"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          strokeLinejoin="round"
        />
        <path
          d={`M256 ${299 + i * 27} L264 ${303 + i * 27} L256 ${307 + i * 27}`}
          fill="none"
          stroke="#00d4b4"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          strokeLinejoin="round"
        />
      </g>
    ))}
    <line
      x1="230"
      y1="292"
      x2="230"
      y2="516"
      stroke="#00d4b4"
      strokeWidth="1.5"
      strokeOpacity="0.28"
      strokeDasharray="4 4"
    />

    {/* Synapse y=306 */}
    <circle
      cx="230"
      cy="306"
      r="10"
      fill="#060d1a"
      stroke="#00d4b4"
      strokeWidth="2.2"
      filter="url(#v5-glow)"
    />
    <circle cx="230" cy="306" r="5" fill="#00d4b4" opacity="0.9" />

    {/* Lower MN y=362 */}
    <circle
      cx="230"
      cy="362"
      r="11"
      fill="#060d1a"
      stroke="#00d4b4"
      strokeWidth="2.2"
      filter="url(#v5-glow)"
    />
    <circle cx="230" cy="362" r="5.5" fill="#00d4b4" opacity="0.65" />
    <path
      d="M219 360 C210 354 200 350 192 348"
      stroke="#00d4b4"
      strokeWidth="1.2"
      strokeOpacity="0.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M219 366 C210 370 200 374 192 376"
      stroke="#00d4b4"
      strokeWidth="1.2"
      strokeOpacity="0.4"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="191" cy="348" r="2.5" fill="#00d4b4" opacity="0.4" />
    <circle cx="191" cy="376" r="2.5" fill="#00d4b4" opacity="0.3" />

    {/* right labels — each 30px apart, none overlapping */}
    {/* Synapse y=306 → label anchored at y=296 */}
    <line
      x1="241"
      y1="306"
      x2="358"
      y2="296"
      stroke="#00d4b4"
      strokeWidth="0.8"
      strokeDasharray="3 3"
      strokeOpacity="0.55"
    />
    <rect
      x="360"
      y="286"
      width="88"
      height="20"
      rx="5"
      fill="rgba(5,12,24,0.95)"
      stroke="#00d4b4"
      strokeWidth="0.9"
      strokeOpacity="0.55"
    />
    <text
      x="404"
      y="299"
      textAnchor="middle"
      fill="#00d4b4"
      fontSize="9.5"
      fontFamily="monospace"
    >
      Synapse
    </text>

    {/* Lower MN y=362 → label at y=352 */}
    <line
      x1="242"
      y1="362"
      x2="358"
      y2="352"
      stroke="#00d4b4"
      strokeWidth="0.8"
      strokeDasharray="3 3"
      strokeOpacity="0.55"
    />
    <rect
      x="360"
      y="342"
      width="156"
      height="20"
      rx="5"
      fill="rgba(5,12,24,0.95)"
      stroke="#00d4b4"
      strokeWidth="0.9"
      strokeOpacity="0.55"
    />
    <text
      x="438"
      y="355"
      textAnchor="middle"
      fill="#00d4b4"
      fontSize="9.5"
      fontFamily="monospace"
    >
      Lower Motor Neuron
    </text>

    {/* Spinal Cord label y=406 → label at y=396 */}
    <line
      x1="250"
      y1="406"
      x2="358"
      y2="396"
      stroke="#00d4b4"
      strokeWidth="0.8"
      strokeDasharray="3 3"
      strokeOpacity="0.4"
    />
    <rect
      x="360"
      y="386"
      width="104"
      height="20"
      rx="5"
      fill="rgba(5,12,24,0.95)"
      stroke="#00d4b4"
      strokeWidth="0.8"
      strokeOpacity="0.4"
    />
    <text
      x="412"
      y="399"
      textAnchor="middle"
      fill="#00d4b4"
      fontSize="9"
      fontFamily="monospace"
      opacity="0.85"
    >
      Spinal Cord
    </text>

    {/* ── PERIPHERAL NERVE (damaged) ── */}
    <path
      d="M230 374 C238 390 250 408 266 426 C278 440 292 454 306 464"
      stroke="#f87171"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeDasharray="9 5"
      filter="url(#v5-glow)"
      opacity="0.88"
    />

    {/* break marker */}
    <circle
      cx="308"
      cy="466"
      r="12"
      fill="rgba(248,113,113,0.14)"
      stroke="#f87171"
      strokeWidth="2.2"
      filter="url(#v5-glow)"
    />
    <line
      x1="301"
      y1="459"
      x2="315"
      y2="473"
      stroke="#f87171"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="315"
      y1="459"
      x2="301"
      y2="473"
      stroke="#f87171"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* fragment tail */}
    <path
      d="M310 475 C318 487 326 498 332 508"
      stroke="#f87171"
      strokeWidth="1.8"
      strokeDasharray="3 8"
      opacity="0.28"
    />

    {/* Neurodegeneration label — y=456, well below Spinal Cord label */}
    <line
      x1="320"
      y1="464"
      x2="358"
      y2="456"
      stroke="#f87171"
      strokeWidth="0.9"
      strokeDasharray="3 2"
      strokeOpacity="0.65"
    />
    <rect
      x="360"
      y="444"
      width="168"
      height="34"
      rx="6"
      fill="rgba(5,12,24,0.97)"
      stroke="#f87171"
      strokeWidth="1.2"
      strokeOpacity="0.75"
    />
    <text
      x="444"
      y="458"
      textAnchor="middle"
      fill="#f87171"
      fontSize="10"
      fontFamily="monospace"
      fontWeight="bold"
    >
      ⚠ Neurodegeneration
    </text>
    <text
      x="444"
      y="471"
      textAnchor="middle"
      fill="#f87171"
      fontSize="8"
      fontFamily="monospace"
      opacity="0.7"
    >
      ALS breaks signal here
    </text>

    {/* ── MUSCLE ── */}
    <path
      d="M285 516 C296 510 314 506 330 508 C348 511 362 522 368 536
             C374 550 370 566 360 576 C350 586 334 592 318 590
             C302 588 288 580 281 568 C274 556 274 540 281 530 C283 524 284 519 285 516 Z"
      fill="rgba(8,18,36,0.9)"
      stroke="#f87171"
      strokeWidth="1.8"
      strokeOpacity="0.6"
      strokeDasharray="5 3"
    />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = 288 + i * 12;
      const yt = 520 + Math.abs(i - 2.5) * 5;
      const yb = 582 - Math.abs(i - 2.5) * 5;
      return (
        <path
          key={i}
          d={`M${x} ${yt} Q${x + 3} ${(yt + yb) / 2} ${x} ${yb}`}
          stroke={i < 3 ? '#f87171' : 'rgba(248,113,113,0.18)'}
          strokeWidth={i < 3 ? 2.5 : 1.5}
          strokeLinecap="round"
          opacity={i < 3 ? 0.55 : 0.18}
          fill="none"
        />
      );
    })}
    <text
      x="325"
      y="552"
      textAnchor="middle"
      fill="#f87171"
      fontSize="11"
      fontFamily="monospace"
      fontWeight="bold"
      opacity="0.85"
    >
      MUSCLE
    </text>
    <text
      x="325"
      y="566"
      textAnchor="middle"
      fill="#f87171"
      fontSize="8.5"
      fontFamily="monospace"
      opacity="0.5"
    >
      Atrophy
    </text>

    {/* ── LEGEND ── */}
    <rect
      x="8"
      y="628"
      width="228"
      height="58"
      rx="9"
      fill="rgba(5,12,24,0.97)"
      stroke="rgba(29,140,248,0.25)"
      strokeWidth="1"
    />
    <text
      x="122"
      y="644"
      textAnchor="middle"
      fill="#64748b"
      fontSize="8"
      fontFamily="monospace"
      fontWeight="bold"
    >
      LEGEND
    </text>
    <line
      x1="18"
      y1="648"
      x2="226"
      y2="648"
      stroke="rgba(255,255,255,0.06)"
      strokeWidth="0.8"
    />
    <line
      x1="18"
      y1="658"
      x2="46"
      y2="658"
      stroke="url(#v5-axon)"
      strokeWidth="3"
    />
    <text x="52" y="662" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
      Healthy nerve signal
    </text>
    <line
      x1="18"
      y1="672"
      x2="46"
      y2="672"
      stroke="#f87171"
      strokeWidth="2.5"
      strokeDasharray="6 4"
    />
    <text x="52" y="676" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
      ALS nerve degeneration
    </text>
    <circle
      cx="32"
      cy="683"
      r="5"
      fill="rgba(248,113,113,0.15)"
      stroke="#f87171"
      strokeWidth="1.5"
    />
    <line
      x1="27"
      y1="678"
      x2="37"
      y2="688"
      stroke="#f87171"
      strokeWidth="1.5"
    />
    <line
      x1="37"
      y1="678"
      x2="27"
      y2="688"
      stroke="#f87171"
      strokeWidth="1.5"
    />
    <text x="52" y="687" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
      Neuron break site
    </text>

    {/* ── ALS PATHWAY BADGE ── */}
    <rect
      x="250"
      y="628"
      width="322"
      height="58"
      rx="9"
      fill="rgba(5,12,24,0.97)"
      stroke="rgba(248,113,113,0.45)"
      strokeWidth="1.2"
    />
    <text
      x="411"
      y="646"
      textAnchor="middle"
      fill="#f87171"
      fontSize="11"
      fontFamily="monospace"
      fontWeight="bold"
    >
      ALS PATHWAY
    </text>
    <line
      x1="260"
      y1="651"
      x2="562"
      y2="651"
      stroke="rgba(248,113,113,0.18)"
      strokeWidth="0.8"
    />
    <text
      x="411"
      y="663"
      textAnchor="middle"
      fill="#94a3b8"
      fontSize="8.5"
      fontFamily="monospace"
    >
      Upper MN → Corticospinal Tract
    </text>
    <text
      x="411"
      y="676"
      textAnchor="middle"
      fill="#94a3b8"
      fontSize="8.5"
      fontFamily="monospace"
    >
      → Lower MN → Peripheral Nerve → Muscle
    </text>

    {/* ── ANIMATIONS ── */}
    {/* pulse down corticospinal tract */}
    <circle r="6" fill="#00d4b4" filter="url(#v5-sglow)">
      <animateMotion
        dur="1.5s"
        repeatCount="indefinite"
        path="M230 213 L230 282"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
    {/* pulse through cord */}
    <circle r="5" fill="#00d4b4" filter="url(#v5-glow)">
      <animateMotion
        dur="1.2s"
        repeatCount="indefinite"
        begin="1.4s"
        path="M230 306 L230 362"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        dur="1.2s"
        repeatCount="indefinite"
        begin="1.4s"
      />
    </circle>
    {/* degraded pulse on damaged nerve */}
    <circle r="5" fill="#f87171" filter="url(#v5-glow)">
      <animateMotion
        dur="3.5s"
        repeatCount="indefinite"
        begin="2.5s"
        path="M230 374 C238 390 250 408 266 426 C278 440 292 454 306 464"
      />
      <animate
        attributeName="opacity"
        values="0;0.9;0.7;0.3;0"
        dur="3.5s"
        repeatCount="indefinite"
        begin="2.5s"
      />
      <animate
        attributeName="r"
        values="5;5;4;2.5;1"
        dur="3.5s"
        repeatCount="indefinite"
        begin="2.5s"
      />
    </circle>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE SECTIONS
───────────────────────────────────────────────────────────────────────────── */

const HomePage: React.FC<{
  navigate: (p: string) => void;
  isAuthenticated: boolean;
  setPage: (p: Page) => void;
}> = ({ navigate, isAuthenticated, setPage }) => (
  <>
    {/* Hero */}
    <section className="relative z-10 flex flex-col lg:flex-row items-center gap-16 px-6 md:px-16 pt-20 pb-16 max-w-7xl mx-auto">
      <div className="flex-1">
        <div className="stagger-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-semibold mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          AI-Powered Neurology Platform
        </div>
        <h1 className="stagger-2 font-display text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6">
          <span className="block text-slate-100">Early ALS</span>
          <span className="block text-teal-400 italic">Detection,</span>
          <span className="block text-slate-400 text-[0.7em] font-light">
            Reimagined with AI
          </span>
        </h1>
        <p className="stagger-3 text-slate-400 text-base leading-relaxed max-w-lg mb-10">
          NeuroALS combines transformer deep learning with EMG signal analysis
          and clinical data to assist neurologists in detecting ALS months
          earlier than traditional methods.
        </p>
        <div className="stagger-4 flex flex-wrap gap-4 mb-14">
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              navigate(isAuthenticated ? '/dashboard' : '/register')
            }
          >
            Start Diagnosis Free →
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPage('about-als')}
          >
            Learn About ALS
          </Button>
        </div>
        <div className="stagger-5 flex flex-wrap gap-10">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="font-display text-3xl font-black bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent">
                {value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Illustration */}
      <div className="stagger-4 flex-shrink-0 w-full lg:w-[460px]">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(29,140,248,0.1) 0%, rgba(0,212,180,0.07) 50%, transparent 75%)',
              filter: 'blur(20px)',
            }}
          />
          <ALSIllustration />
          <div className="text-center mt-3 text-[10px] text-slate-600 font-mono tracking-wider">
            Motor Neuron Degeneration · Brain → Spinal Cord → Muscle
          </div>
        </div>
      </div>
    </section>

    {/* Stats bar */}
    <section className="relative z-10 px-6 md:px-16 pb-16 max-w-7xl mx-auto">
      <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { v: '96%', l: 'LightGBM', sub: 'Best performing model' },
          { v: '5+', l: 'ML/DL Models', sub: 'Benchmarked & compared' },
          {
            v: '4',
            l: 'Diagnostic Domains',
            sub: 'Biomarker · EMG · AI',
          },
          { v: '<2s', l: 'Prediction Time', sub: 'Real-time inference' },
        ].map(({ v, l, sub }) => (
          <div key={l}>
            <div className="font-display text-3xl font-black bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent mb-1">
              {v}
            </div>
            <div className="text-sm font-semibold text-slate-200 mb-0.5">
              {l}
            </div>
            <div className="text-xs text-slate-500">{sub}</div>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="relative z-10 mx-6 md:mx-16 mb-20 p-10 md:p-14 rounded-2xl bg-gradient-to-br from-blue-900/50 to-teal-900/30 border border-teal-500/25 flex flex-col md:flex-row items-center justify-between gap-8">
      <div>
        <h2 className="font-display text-3xl font-black mb-3">
          Ready to transform ALS diagnosis?
        </h2>
        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
          Join clinicians and researchers using NeuroALS to detect ALS earlier
          and improve patient outcomes.
        </p>
      </div>
      <div className="flex gap-3 flex-shrink-0">
        <Button variant="teal" size="lg" onClick={() => navigate('/register')}>
          Create Free Account
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    </section>
  </>
);

const FeaturesPage: React.FC = () => (
  <section className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto animate-fade-up">
    <div className="text-xs tracking-[3px] uppercase text-teal-400 font-semibold mb-4">
      Platform Capabilities
    </div>
    <h2 className="font-display text-4xl font-black mb-4">
      Built for clinical precision.
    </h2>
    <p className="text-slate-400 text-base max-w-xl leading-relaxed mb-14">
      Every module designed to support neurologists with transparent,
      explainable AI — ready for real-world clinical workflows.
    </p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map((f) => (
        <div
          key={f.title}
          className="group glass-card p-7 hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-250 cursor-default"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl mb-5">
            {f.icon}
          </div>
          <div className="font-display text-lg font-bold mb-2">{f.title}</div>
          <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

const HowItWorksPage: React.FC = () => (
  <section className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto animate-fade-up">
    <div className="text-xs tracking-[3px] uppercase text-teal-400 font-semibold mb-4">
      How It Works
    </div>
    <h2 className="font-display text-4xl font-black mb-4">
      Diagnosis in four steps.
    </h2>
    <p className="text-slate-400 text-base max-w-xl leading-relaxed mb-14">
      From patient data entry to explainable AI-driven diagnosis — the entire
      pipeline runs in under 2 seconds.
    </p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      {steps.map((s, i) => (
        <div key={s.n} className="relative glass-card p-7 text-center">
          {i < steps.length - 1 && (
            <div className="hidden lg:block absolute top-8 -right-3 z-10 text-slate-600 text-xl">
              →
            </div>
          )}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-sky-400 flex items-center justify-center font-display text-base font-black mx-auto mb-4 shadow-lg shadow-sky-500/25">
            {s.n}
          </div>
          <div className="font-display text-base font-bold mb-2">{s.title}</div>
          <div className="text-xs text-slate-400 leading-relaxed">{s.desc}</div>
        </div>
      ))}
    </div>
    <div className="glass-card p-8 md:p-12">
      <div className="text-xs tracking-[3px] uppercase text-sky-400 font-semibold mb-6">
        System Architecture
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: 'Data Layer',
            items: [
              'EMG CSV Upload',
              'Clinical Form Input',
              'Preprocessing Pipeline',
              'Normalization & Denoising',
            ],
            color: '#1d8cf8',
          },
          {
            title: 'AI Core',
            items: [
              'Transformer Encoder',
              'XGBoost Classifier',
              'SHAP Explainability',
              'Multi-Model Ensemble',
            ],
            color: '#00d4b4',
          },
          {
            title: 'Output',
            items: [
              'Prediction + Confidence',
              'Risk Score (0–100)',
              'Feature Importance',
              'Clinical Report',
            ],
            color: '#818cf8',
          },
        ].map(({ title, items, color }) => (
          <div
            key={title}
            className="p-5 rounded-xl border"
            style={{ borderColor: `${color}28`, background: `${color}0a` }}
          >
            <div
              className="font-display text-sm font-bold mb-4"
              style={{ color }}
            >
              {title}
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 text-xs text-slate-400"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: color, opacity: 0.7 }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const AboutALSPage: React.FC<{
  navigate: (p: string) => void;
  isAuthenticated: boolean;
}> = ({ navigate, isAuthenticated }) => (
  <section className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto animate-fade-up">
    <div className="text-xs tracking-[3px] uppercase text-teal-400 font-semibold mb-4">
      About The Disease
    </div>
    <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
      Understanding <span className="text-teal-400">ALS</span>
    </h2>
    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-16">
      Amyotrophic Lateral Sclerosis — also known as{' '}
      <strong className="text-slate-300">Lou Gehrig's Disease</strong> — is a
      fatal neurodegenerative disorder affecting the motor neurons responsible
      for voluntary muscle movement.
    </p>

    <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
      {/* Left: illustration + key facts */}
      <div>
        <div className="glass-card p-5 mb-6">
          <ALSIllustration />
          <div className="text-center text-[10px] text-slate-600 font-mono tracking-wider mt-3">
            Upper &amp; Lower Motor Neuron Degeneration Pathway in ALS
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Typical Onset Age',
              value: '40–70 yrs',
              color: '#1d8cf8',
            },
            { label: 'Mean Survival', value: '2–5 years', color: '#f87171' },
            { label: 'Prevalence', value: '~5/100k', color: '#00d4b4' },
            { label: 'Diagnosis Delay', value: '12–18 mo', color: '#fb923c' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div
                className="font-display text-2xl font-black mb-1"
                style={{ color }}
              >
                {value}
              </div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: content blocks */}
      <div className="space-y-5">
        <div className="glass-card p-6">
          <h3 className="font-display text-xl font-bold mb-3 text-slate-100">
            What is ALS?
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            ALS is a progressive neurodegenerative disorder that leads to the
            gradual loss of motor neurons — the nerve cells responsible for
            voluntary muscle movement. As the disease advances, patients
            experience muscle weakness, difficulty speaking and swallowing,
            paralysis, and eventually respiratory failure.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Despite advancements in medical science, early diagnosis remains a
            major clinical challenge. The disease presents with non-specific
            symptoms, lacks a single confirmatory diagnostic test, and often
            results in delayed intervention — with valuable time lost between
            symptom onset and confirmed diagnosis, reducing the effectiveness of
            available treatments.
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-xl font-bold mb-3 text-sky-400">
            Our Research Foundation
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            This platform is built upon a systematic review and technical
            analysis of ALS diagnostic research, focusing on four key domains:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                icon: '🧬',
                label: 'Fluid Biomarkers',
                sub: 'Neurofilaments, Chitinases',
              },
              { icon: '🧲', label: 'Neuroimaging', sub: 'MRI, DTI, PET' },
              {
                icon: '⚡',
                label: 'Electrophysiology',
                sub: 'EMG, Single-Fiber EMG',
              },
              { icon: '🤖', label: 'Machine Learning', sub: 'ML & AI Models' },
            ].map(({ icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-500/5 border border-sky-500/15"
              >
                <span className="text-xl leading-none">{icon}</span>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {label}
                  </div>
                  <div className="text-[10px] text-slate-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4 leading-relaxed">
            Biomarkers such as Neurofilament Light Chain (NfL) and chitinases
            show strong diagnostic potential, yet lack complete specificity when
            used independently. EMG remains a clinical gold standard but
            typically detects the disease after significant neuronal damage has
            already occurred.
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-xl font-bold mb-3 text-teal-400">
            Why Multimodal AI Matters
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            ALS is a heterogeneous disease — its manifestation varies
            significantly across patients. Our approach combines multiple
            diagnostic streams for a complete picture:
          </p>
          {[
            'Integration of Clinical Records',
            'EMG Time-Series Analysis',
            'Transformer-Based Architectures for sequential data',
            'Federated Learning for privacy-preserving collaboration',
            'Explainable AI (SHAP, attention visualization) for clinical trust',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2.5 text-xs text-slate-400 mb-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Research gap */}
    <div
      className="glass-card p-8 mb-8"
      style={{ borderLeft: '4px solid #f59e0b' }}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">⚠️</span>
        <div>
          <h3 className="font-display text-lg font-bold text-amber-400 mb-2">
            Critical Research Gap
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            A major research gap exists in integrating multiple diagnostic
            modalities into a unified, multimodal AI-based diagnostic system.
            NeuroALS directly addresses this gap by combining electrophysiology,
            structured clinical data, and AI-driven pattern recognition into a
            single platform.
          </p>
        </div>
      </div>
    </div>

    {/* Privacy */}
    <div className="glass-card p-8">
      <h3 className="font-display text-2xl font-bold mb-4 text-slate-100">
        Privacy-Preserving & Scalable Design
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">
        Due to strict medical confidentiality regulations and the rarity of ALS,
        patient data is often scattered across institutions. Our system is
        designed to support federated, privacy-preserving AI research at scale.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: '🔗', label: 'Federated Learning' },
          { icon: '🔐', label: 'JWT Auth' },
          { icon: '👥', label: 'Role-Based Access' },
          { icon: '🔒', label: 'Encrypted Params' },
          { icon: '☁️', label: 'Cloud Scalable' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="text-center p-4 rounded-xl bg-sky-500/5 border border-sky-500/15"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-12 text-center">
      <Button
        variant="teal"
        size="lg"
        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
      >
        Start Using NeuroALS →
      </Button>
    </div>
  </section>
);

const ResearchPage: React.FC = () => (
  <section className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto animate-fade-up">
    <div className="text-xs tracking-[3px] uppercase text-teal-400 font-semibold mb-4">
      AI Research
    </div>
    <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
      Model <span className="text-teal-400">Performance</span>
    </h2>
    <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-16">
      Across all experimented Machine Learning and Deep Learning models —{' '}
      <strong className="text-teal-400">
        LightGBM achieved the highest diagnostic accuracy
      </strong>{' '}
      — demonstrating superior performance in classification accuracy,
      precision, recall, F1-score, and generalization on limited datasets.
    </p>

    {/* XGBoost highlight */}
    <div
      className="relative glass-card p-8 md:p-10 mb-10 overflow-hidden"
      style={{ borderColor: 'rgba(0,212,180,0.4)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 80% 50%, rgba(0,212,180,0.1), transparent 60%)',
        }}
      />
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-4">
            🏆 Best Performing Model
          </div>
          <h3 className="font-display text-3xl font-black text-teal-400 mb-3">
            LightGBM
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            LightGBM (Light Gradient Boosting Machine) excels in handling
            structured clinical and EMG-derived features, especially in rare
            disease scenarios where dataset size is limited. Its iterative
            error-correction technique produces robust, generalizable
            predictions unmatched by other models tested.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          {[
            { metric: 'Accuracy', value: '96%', color: '#00d4b4' },
            { metric: 'Precision', value: '96%', color: '#1d8cf8' },
            { metric: 'Recall', value: '96%', color: '#818cf8' },
            { metric: 'F1-Score', value: '96%', color: '#60a5fa' },
            { metric: 'ROC-AUC', value: '99.21%', color: '#87aad5' },
            { metric: 'Sensitivity', value: '96.77%', color: '#87aad5' },
          ].map(({ metric, value, color }) => (
            <div
              key={metric}
              className="text-center p-4 rounded-xl border"
              style={{ borderColor: `${color}33`, background: `${color}0d` }}
            >
              <div
                className="font-display text-2xl font-black mb-1"
                style={{ color }}
              >
                {value}
              </div>
              <div className="text-[10px] text-slate-500 tracking-wider uppercase">
                {metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Model comparison bars */}
    <div className="glass-card p-8 mb-10">
      <h3 className="font-display text-xl font-bold mb-1.5">
        Model Accuracy Comparison
      </h3>
      <p className="text-slate-500 text-sm mb-8">
        All models evaluated on identical ALS clinical + EMG dataset splits
      </p>
      <div className="space-y-5">
        {mlModels.map((m, i) => (
          <div key={m.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                {m.highlight && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 font-semibold">
                    BEST
                  </span>
                )}
                <span
                  className={`font-display text-sm font-bold ${m.highlight ? 'text-teal-400' : 'text-slate-300'}`}
                >
                  {m.name}
                </span>
              </div>
              <span
                className="font-display font-black text-sm"
                style={{ color: m.color }}
              >
                {m.acc}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${m.acc}%`,
                  background: m.highlight
                    ? 'linear-gradient(to right, #00d4b4, #1d8cf8)'
                    : m.color,
                  boxShadow: m.highlight
                    ? `0 0 14px rgba(0,212,180,0.5)`
                    : 'none',
                  animation: `fillIn 1.4s ${i * 0.15}s ease-out both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Why XGBoost + Future */}
    <div className="grid md:grid-cols-2 gap-6 mb-10">
      <div className="glass-card p-7">
        <h3 className="font-display text-lg font-bold text-teal-400 mb-4">
          Why LightGBM Outperforms
        </h3>
        {[
          {
            title: 'Handles small datasets',
            desc: 'Rare disease data is scarce — gradient boosting generalizes well with limited samples.',
          },
          {
            title: 'Built-in feature importance',
            desc: 'Natively ranks clinical features, aligning with SHAP explainability requirements.',
          },
          {
            title: 'Robust to missing values',
            desc: 'Clinical records often have gaps; LightGBM handles them without imputation.',
          },
          {
            title: 'Fast sub-second inference',
            desc: 'Suitable for real-time clinical decision support workflows.',
          },
        ].map(({ title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 mb-2.5"
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-slate-200 mb-0.5">
                {title}
              </div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card p-7">
        <h3 className="font-display text-lg font-bold text-sky-400 mb-4">
          Future Research Directions
        </h3>
        {[
          {
            icon: '🧠',
            title: 'Transformer + LightGBM Ensemble',
            desc: 'Combining sequential EMG features with clinical tabular data.',
          },
          {
            icon: '🔬',
            title: 'Multi-omics Integration',
            desc: 'Adding proteomics and genomics streams to the feature set.',
          },
          {
            icon: '📊',
            title: 'Longitudinal Modeling',
            desc: 'Tracking disease progression over time for prognosis prediction.',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10 mb-2.5"
          >
            <span className="text-xl leading-none">{icon}</span>
            <div>
              <div className="text-sm font-semibold text-slate-200 mb-0.5">
                {title}
              </div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Vision */}
    <div className="glass-card p-8 md:p-12 text-center">
      <h3 className="font-display text-2xl font-bold mb-4">
        Vision & Future Scope
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed max-w-3xl mx-auto mb-8">
        By bridging biomarkers, electrophysiology, imaging insights, and
        advanced machine learning techniques, this work establishes a scalable
        foundation for rare disease diagnostic systems. The long-term goal:
        earlier ALS detection, precise risk stratification, and multicenter
        collaborative research with clinically interpretable AI.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {[
          'Earlier Detection',
          'Risk Stratification',
          'Multicenter Research',
          'Transformer EMG Models',
          'Interpretable AI',
        ].map((tag) => (
          <span
            key={tag}
            className="px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-semibold"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<Page>('home');

  const navItems: { label: string; page: Page }[] = [
    { label: 'Features', page: 'features' },
    { label: 'How it Works', page: 'how-it-works' },
    { label: 'Research', page: 'research' },
    { label: 'About ALS', page: 'about-als' },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="orb opacity-55"
          style={{
            width: 700,
            height: 700,
            background:
              'radial-gradient(circle, rgba(15,75,160,0.65), transparent 70%)',
            top: -200,
            right: -150,
          }}
        />
        <div
          className="orb opacity-40"
          style={{
            width: 500,
            height: 500,
            background:
              'radial-gradient(circle, rgba(0,180,150,0.4), transparent 70%)',
            bottom: -100,
            left: -100,
            animationDelay: '-7s',
          }}
        />
        <div className="fixed inset-0 grid-bg" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 border-b border-white/5 backdrop-blur-xl bg-navy/70">
        <button
          onClick={() => setActivePage('home')}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-teal-400 flex items-center justify-center text-lg shadow-lg shadow-teal-500/20">
            ⚡
          </div>
          <span className="font-display text-xl font-bold">
            Neuro<span className="text-teal-400">ALS</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1 text-sm">
          {navItems.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => {
                setActivePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer font-medium ${
                activePage === page
                  ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          >
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </Button>
          <Button
            variant="teal"
            size="sm"
            onClick={() =>
              navigate(isAuthenticated ? '/dashboard' : '/register')
            }
          >
            {isAuthenticated ? 'Go to App →' : 'Get Started →'}
          </Button>
        </div>
      </nav>

      {/* Page content — SPA switching, no scroll jump */}
      <div key={activePage} className="animate-fade-up">
        {activePage === 'home' && (
          <HomePage
            navigate={navigate}
            isAuthenticated={isAuthenticated}
            setPage={setActivePage}
          />
        )}
        {activePage === 'features' && <FeaturesPage />}
        {activePage === 'how-it-works' && <HowItWorksPage />}
        {activePage === 'about-als' && (
          <AboutALSPage navigate={navigate} isAuthenticated={isAuthenticated} />
        )}
        {activePage === 'research' && <ResearchPage />}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-16 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-700 to-teal-400 flex items-center justify-center text-xs">
            ⚡
          </div>
          <span>NeuroALS · AI Diagnosis Platform</span>
        </div>
        <span>© 2026 NeuroALS. Built with React + FastAPI + MongoDB.</span>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Security', 'Contact'].map((l) => (
            <span
              key={l}
              className="cursor-pointer hover:text-slate-300 transition-colors"
            >
              {l}
            </span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes wavePulse {
          from { opacity: 0.6; transform: scaleY(0.9); }
          to   { opacity: 1;   transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
