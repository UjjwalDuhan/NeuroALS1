"""
ALS EMG Prediction Backend - LightGBM
Run: pip install flask lightgbm scikit-learn pandas numpy
Then: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import lightgbm
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ─── Load Model ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model    = joblib.load(os.path.join(BASE_DIR, "als_model.pkl"))

MODEL_COLUMNS = [
    "Age",
    "Muscle_Strength_1_5",
    "MUAP_Duration_ms",
    "MUAP_Amplitude_uV",
    "Percent_Polyphasic",
    "Sex_F",
    "Sex_M",
    "Muscle_Brachial_biceps",
    "Muscle_Medial_vastus",
    "Atrophy_+",
    "Atrophy_++",
    "Atrophy_+++",
    "Atrophy_0",
    "Recruitment_Pattern_Discrete",
    "Recruitment_Pattern_Full",
    "Recruitment_Pattern_Normal",
    "Recruitment_Pattern_Reduced",
    "Spontaneous_Activity_DTF_FA",
    "Spontaneous_Activity_DTF_Many_FA",
    "Spontaneous_Activity_DTF_PSW_FA",
    "Spontaneous_Activity_FA",
    "Spontaneous_Activity_Many_DTF_Many_FA",
    "Spontaneous_Activity_Many_FA",
    "Spontaneous_Activity_No",
]

print(f"✅ Model loaded: {type(model).__name__}")
print(f"✅ Features: {len(MODEL_COLUMNS)}")


# ─── Prediction Endpoint ─────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Build feature row — all zeros first
        row = {col: 0 for col in MODEL_COLUMNS}

        # ── Numeric features ──
        row["Age"]                 = float(data.get("age", 0))
        row["Muscle_Strength_1_5"] = float(data.get("muscleStrength", 0))
        row["MUAP_Duration_ms"]    = float(data.get("muapDuration", 0))
        row["MUAP_Amplitude_uV"]   = float(data.get("muapAmplitude", 0))
        row["Percent_Polyphasic"]  = float(data.get("percentPolyphasic", 0))

        # ── Sex ──
        sex = data.get("sex", "")
        if sex == "M":
            row["Sex_M"] = 1
        elif sex == "F":
            row["Sex_F"] = 1

        # ── Muscle ──
        muscle = data.get("muscle", "")
        if muscle == "Brachial_biceps":
            row["Muscle_Brachial_biceps"] = 1
        elif muscle == "Medial_vastus":
            row["Muscle_Medial_vastus"] = 1

        # ── Atrophy ──
        atrophy = data.get("atrophy", "")
        if atrophy == "0":
            row["Atrophy_0"] = 1
        elif atrophy == "+":
            row["Atrophy_+"] = 1
        elif atrophy == "++":
            row["Atrophy_++"] = 1
        elif atrophy == "+++":
            row["Atrophy_+++"] = 1

        # ── Recruitment Pattern ──
        rp = data.get("recruitmentPattern", "")
        if rp == "Discrete":
            row["Recruitment_Pattern_Discrete"] = 1
        elif rp == "Full":
            row["Recruitment_Pattern_Full"] = 1
        elif rp == "Normal":
            row["Recruitment_Pattern_Normal"] = 1
        elif rp == "Reduced":
            row["Recruitment_Pattern_Reduced"] = 1

        # ── Spontaneous Activity ──
        sa_map = {
            "DTF_FA":           "Spontaneous_Activity_DTF_FA",
            "DTF_Many_FA":      "Spontaneous_Activity_DTF_Many_FA",
            "DTF_PSW_FA":       "Spontaneous_Activity_DTF_PSW_FA",
            "FA":               "Spontaneous_Activity_FA",
            "Many_DTF_Many_FA": "Spontaneous_Activity_Many_DTF_Many_FA",
            "Many_FA":          "Spontaneous_Activity_Many_FA",
            "No":               "Spontaneous_Activity_No",
        }
        sa = data.get("spontaneousActivity", "")
        if sa in sa_map:
            row[sa_map[sa]] = 1

        # ── Predict ──
        df         = pd.DataFrame([row], columns=MODEL_COLUMNS)
        prediction = int(model.predict(df)[0])
        proba      = model.predict_proba(df)[0].tolist()
        als_prob   = proba[1] if len(proba) > 1 else proba[0]

        return jsonify({
            "success":      True,
            "prediction":   prediction,
            "alsProbability": round(als_prob * 100, 1),
            "probabilities":  proba,
            "label": "ALS Detected" if prediction == 1 else "No ALS Detected",
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": type(model).__name__})


# ─── Run ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀 Starting ALS Prediction API on http://localhost:5000\n")
    app.run(debug=True, port=5000)