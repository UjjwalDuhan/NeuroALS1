/**
 * NeuroALS RAG Knowledge Base
 * 
 * This file contains structured knowledge chunks about ALS disease and the
 * NeuroALS platform. Each chunk has an ID, category, title, and content.
 * 
 * For production: Replace with vector DB (Pinecone, Weaviate, or pgvector)
 * and use semantic search. This in-memory version uses keyword matching.
 */

export interface KnowledgeChunk {
  id: string;
  category: "als_disease" | "emg" | "platform" | "ml_model" | "diagnosis" | "treatment";
  title: string;
  keywords: string[];
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // ── ALS Disease ────────────────────────────────────────────────────────────
  {
    id: "als_001",
    category: "als_disease",
    title: "What is ALS?",
    keywords: ["als", "amyotrophic", "lateral sclerosis", "motor neuron", "lou gehrig", "disease", "what is"],
    content: `Amyotrophic Lateral Sclerosis (ALS), also called Lou Gehrig's disease, is a progressive 
    neurodegenerative disease that affects nerve cells (neurons) in the brain and spinal cord. 
    ALS attacks motor neurons — the nerve cells that control voluntary muscle movement including speaking, 
    walking, breathing, and swallowing. As motor neurons degenerate and die, the brain can no longer 
    initiate and control muscle movement. Eventually muscles atrophy (waste away) leading to paralysis.`,
  },
  {
    id: "als_002",
    category: "als_disease",
    title: "ALS Early Symptoms",
    keywords: ["symptom", "early", "sign", "weakness", "twitching", "fasciculation", "slurred", "cramp", "fatigue"],
    content: `Early ALS symptoms include:
    - Muscle weakness in one limb (often arm or leg) — the most common first sign
    - Muscle twitching (fasciculations) — visible rippling under the skin
    - Muscle cramps and stiffness (spasticity)
    - Slurred or nasal speech (dysarthria)
    - Difficulty swallowing (dysphagia)
    - Fatigue and difficulty with fine motor tasks (buttoning, writing)
    - Tripping, dropping things, or difficulty walking
    
    ALS typically begins in one region — limb-onset ALS (arms or legs) or bulbar-onset ALS (speech/swallowing). 
    Early recognition is critical as it enables timely intervention and supportive care.`,
  },
  {
    id: "als_003",
    category: "als_disease",
    title: "ALS Progression and Prognosis",
    keywords: ["progression", "prognosis", "survival", "stage", "life expectancy", "average", "years"],
    content: `ALS progression varies by individual:
    - Average survival: 2–5 years from symptom onset
    - ~10% of patients survive 10+ years (including Stephen Hawking, who lived 55 years post-diagnosis)
    - Progression rate varies widely — some progress rapidly within months, others slowly over years
    - Bulbar-onset ALS often progresses faster than limb-onset
    - Death is usually due to respiratory failure
    - Riluzole and Edaravone are FDA-approved drugs that modestly slow progression
    - Disease staging: El Escorial criteria and King's College Staging are commonly used`,
  },
  {
    id: "als_004",
    category: "als_disease",
    title: "ALS Genetic and Risk Factors",
    keywords: ["genetic", "hereditary", "familial", "sporadic", "sod1", "c9orf72", "risk", "cause"],
    content: `ALS Types:
    - Sporadic ALS: ~90% of cases — no family history, unknown cause
    - Familial ALS: ~10% of cases — inherited genetic mutations
    
    Key genetic mutations:
    - C9orf72 repeat expansion (most common familial and sporadic genetic cause)
    - SOD1 mutations (first ALS gene discovered)
    - TARDBP (TDP-43) and FUS mutations
    
    Risk factors: Age (peak onset 55–75), male sex (slightly higher risk), military service, 
    exposure to heavy metals or pesticides (possible link), smoking.`,
  },

  // ── EMG ───────────────────────────────────────────────────────────────────
  {
    id: "emg_001",
    category: "emg",
    title: "EMG in ALS Diagnosis",
    keywords: ["emg", "electromyography", "needle", "nerve conduction", "ncs", "electrical", "signal", "muscle"],
    content: `Electromyography (EMG) is the most important electrodiagnostic test for ALS:
    
    What EMG measures:
    - Electrical activity in muscles at rest and during contraction
    - Detects denervation (loss of nerve supply) in muscles
    
    ALS-specific EMG findings:
    - Fibrillation potentials and positive sharp waves (spontaneous muscle fiber activity)
    - Fasciculation potentials (visible twitches)
    - Large amplitude, long duration, polyphasic motor unit potentials (reinnervation)
    - Reduced motor unit recruitment
    
    EMG is performed across multiple body regions to confirm widespread lower motor neuron involvement 
    — a requirement for ALS diagnosis per El Escorial / Awaji criteria.`,
  },
  {
    id: "emg_002",
    category: "emg",
    title: "EMG Signal Features for ML Prediction",
    keywords: ["emg", "feature", "mfcc", "amplitude", "frequency", "signal", "machine learning", "input", "prediction"],
    content: `EMG signal features used in the NeuroALS ML model:
    
    Time-domain features:
    - Mean Absolute Value (MAV)
    - Root Mean Square (RMS) — reflects signal amplitude/power
    - Waveform Length (WL) — measures signal complexity
    - Zero Crossing Rate (ZCR)
    
    Frequency-domain features:
    - Mean Power Frequency (MPF)
    - Median Frequency (MDF)
    - Spectral entropy
    
    Advanced features:
    - MFCC (Mel-Frequency Cepstral Coefficients)
    - Wavelet decomposition coefficients
    
    The NeuroALS model combines these EMG features with clinical variables (age, symptom duration, 
    muscle groups affected) to generate an ALS risk probability score.`,
  },

  // ── NeuroALS Platform ──────────────────────────────────────────────────────
  {
    id: "platform_001",
    category: "platform",
    title: "NeuroALS Platform Overview",
    keywords: ["platform", "neuroals", "system", "features", "overview", "how", "work"],
    content: `NeuroALS is a full-stack AI healthcare web application for early ALS prediction.
    
    Key features:
    - Role-based authentication (Doctor, Researcher, Admin)
    - ALS prediction form — submit patient clinical and EMG data
    - Real-time ALS risk prediction using XGBoost ML model
    - Results dashboard with risk probability visualization
    - AI chatbot assistant (NeuroBot) for guidance
    
    System components:
    - Frontend: React + TypeScript + Tailwind CSS
    - Backend API: Node.js + Express + JWT authentication
    - ML API: FastAPI service running the XGBoost model
    - Databases: MongoDB (user data) + PostgreSQL (clinical records)`,
  },
  {
    id: "platform_002",
    category: "platform",
    title: "How to Submit a Prediction",
    keywords: ["submit", "prediction", "form", "als form", "input", "how to", "use", "predict"],
    content: `How to submit an ALS prediction on NeuroALS:
    
    1. Login with your credentials (Doctor or Researcher role)
    2. Navigate to the ALS Prediction Form (Dashboard → New Prediction or /als-form)
    3. Fill in patient clinical data:
       - Age, sex, symptom duration
       - Affected muscle groups
       - Symptom onset type (limb vs bulbar)
    4. Upload or enter EMG signal data / features
    5. Click "Predict" to submit
    6. The system sends data to the FastAPI ML service
    7. View the risk score: Low / Medium / High probability of ALS
    8. Results are saved to your dashboard history`,
  },
  {
    id: "platform_003",
    category: "platform",
    title: "User Roles in NeuroALS",
    keywords: ["role", "doctor", "researcher", "admin", "access", "permission", "account"],
    content: `NeuroALS has three user roles:
    
    Doctor:
    - Submit ALS prediction forms for patients
    - View prediction results and history
    - Access patient-level data
    
    Researcher:
    - Access anonymized datasets for analysis
    - View aggregate statistics and model performance
    - Submit predictions for research purposes
    
    Admin:
    - Manage user accounts and roles
    - Access platform analytics
    - Manage system configuration
    
    Role is selected at registration and determines what features you can access.`,
  },

  // ── ML Model ──────────────────────────────────────────────────────────────
  {
    id: "ml_001",
    category: "ml_model",
    title: "XGBoost ALS Prediction Model",
    keywords: ["xgboost", "model", "machine learning", "algorithm", "accuracy", "training", "prediction", "ml"],
    content: `The NeuroALS prediction model uses XGBoost (Extreme Gradient Boosting):
    
    Why XGBoost for ALS prediction:
    - Excellent performance on tabular clinical data
    - Handles missing values natively
    - Feature importance explanability
    - Robust against overfitting with regularization
    
    Model input features:
    - Patient age and sex
    - Symptom onset type and duration
    - Affected muscle groups
    - EMG signal features (RMS, MDF, fasciculation presence)
    - Clinical score (ALSFRS-R or similar)
    
    Model output:
    - Probability score 0–1
    - Risk tier: Low (< 0.3), Medium (0.3–0.7), High (> 0.7)
    
    The model is served via a FastAPI endpoint at /predict (POST).`,
  },
  {
    id: "ml_002",
    category: "ml_model",
    title: "Interpreting Prediction Results",
    keywords: ["result", "interpret", "score", "probability", "risk", "low", "medium", "high", "output"],
    content: `Interpreting NeuroALS prediction results:
    
    Risk Score Tiers:
    - Low Risk (0–30%): Clinical features less consistent with ALS. Continue monitoring; consider other diagnoses.
    - Medium Risk (30–70%): Features partially consistent with ALS. Recommend specialist neurologist referral and comprehensive EMG.
    - High Risk (70–100%): Features strongly consistent with ALS. Urgent neurology referral recommended. Begin El Escorial diagnostic workup.
    
    Important notes:
    - The model is a decision-support tool, not a definitive diagnostic instrument
    - Always combine ML results with full clinical assessment
    - False positives/negatives are possible — clinical judgment takes precedence
    - ALS diagnosis requires EMG, clinical examination, and exclusion of mimicking conditions`,
  },

  // ── Diagnosis ─────────────────────────────────────────────────────────────
  {
    id: "diagnosis_001",
    category: "diagnosis",
    title: "ALS Diagnostic Criteria",
    keywords: ["diagnosis", "criteria", "el escorial", "awaji", "diagnose", "differential", "confirm"],
    content: `ALS is diagnosed using clinical and electrodiagnostic criteria:
    
    El Escorial / Revised El Escorial Criteria (most widely used):
    - Requires evidence of upper motor neuron (UMN) AND lower motor neuron (LMN) dysfunction
    - Involvement must spread across body regions: bulbar, cervical, thoracic, lumbar
    - Diagnosis levels: Possible → Probable → Definite ALS
    
    Awaji Criteria (updated, more sensitive):
    - EMG fasciculation potentials count equally to fibrillation potentials
    - Increases diagnostic sensitivity especially in early disease
    
    Differential diagnoses to exclude:
    - Multifocal motor neuropathy (MMN) — treatable, EMG distinguishes it
    - Kennedy disease (SBMA) — genetic test
    - Spinal muscular atrophy (SMA)
    - Cervical myelopathy — MRI`,
  },

  // ── Treatment ─────────────────────────────────────────────────────────────
  {
    id: "treatment_001",
    category: "treatment",
    title: "ALS Treatment and Management",
    keywords: ["treatment", "therapy", "riluzole", "edaravone", "medication", "management", "care", "multidisciplinary"],
    content: `ALS treatment focuses on slowing progression and managing symptoms:
    
    FDA-approved medications:
    - Riluzole (Rilutek): First ALS drug (1995). Glutamate blocker. Extends survival ~2–3 months.
    - Edaravone (Radicava): Antioxidant. Slows functional decline in select patients.
    - AMX0035 (Relyvrio): Combination neuroprotective therapy approved 2022 (Canada/US).
    - Tofersen (Qalsody): SOD1-targeting antisense oligonucleotide (2023).
    
    Multidisciplinary care (most important aspect):
    - Neurologist: Disease monitoring and medication
    - Pulmonologist: Respiratory support (NIV/BiPAP)
    - Speech therapist: Communication and swallowing
    - Physical/occupational therapy: Mobility and function
    - Nutritionist: Maintain weight and nutrition
    - Psychologist: Mental health support`,
  },
];
