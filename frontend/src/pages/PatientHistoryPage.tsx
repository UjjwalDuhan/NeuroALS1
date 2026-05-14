import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PatientRecord {
  _id: string;
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
  reportEmailSent: boolean;
  createdAt: string;
}

const riskColors: Record<string, string> = {
  Low:      '#00ffaa',
  Moderate: '#ffd900',
  High:     '#ff7800',
  Critical: '#ff3250',
};

const API = 'http://localhost:5001';

export default function PatientHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/patients/history?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      } else {
        setError(data.message || 'Failed to load history.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(page); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient record?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/api/patients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) => prev.filter((r) => r._id !== id));
        setTotal((t) => t - 1);
      }
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: #040b14; }
        body { font-family: 'DM Mono', monospace; color: #e8f4ff; }

        .ph-wrap { min-height: 100vh; background: #040b14; background-image:
          radial-gradient(ellipse 60% 50% at 10% 0%, rgba(0,120,255,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 90% 100%, rgba(0,200,255,0.05) 0%, transparent 70%); }

        .ph-nav { height: 52px; background: rgba(4,11,20,0.94); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,200,255,0.12); display: flex; align-items: center;
          justify-content: space-between; padding: 0 1.4rem; position: sticky; top: 0; z-index: 50; }
        .ph-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .ph-logo-icon { width: 30px; height: 30px; background: linear-gradient(135deg,#0050ff,#00c8ff);
          border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .ph-logo-text { font-size: 15px; font-weight: 700; color: #00c8ff; font-family: 'Syne', sans-serif; }
        .ph-back { background: none; border: 1px solid rgba(0,200,255,0.2); border-radius: 8px;
          color: #6b8faf; padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: 'DM Mono', monospace;
          transition: all .2s; }
        .ph-back:hover { color: #00c8ff; border-color: rgba(0,200,255,0.4); }

        .ph-body { max-width: 960px; margin: 0 auto; padding: 32px 20px; }
        .ph-header { margin-bottom: 28px; }
        .ph-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #e8f4ff; }
        .ph-sub { color: #6b8faf; font-size: 13px; margin-top: 4px; }

        .ph-stats { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
        .ph-stat { background: rgba(0,200,255,0.05); border: 1px solid rgba(0,200,255,0.12);
          border-radius: 10px; padding: 14px 20px; min-width: 120px; }
        .ph-stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #00c8ff; }
        .ph-stat-lbl { font-size: 11px; color: #6b8faf; margin-top: 2px; }

        .ph-card { background: rgba(7,15,28,0.9); border: 1px solid rgba(0,200,255,0.1);
          border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: border-color .2s; }
        .ph-card:hover { border-color: rgba(0,200,255,0.25); }

        .ph-card-head { display: flex; align-items: center; gap: 14px; padding: 16px 20px; cursor: pointer; }
        .ph-risk-badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
          border: 1px solid; flex-shrink: 0; }
        .ph-name { font-size: 15px; font-weight: 600; color: #e8f4ff; flex: 1; }
        .ph-meta { font-size: 12px; color: #6b8faf; }
        .ph-prob { font-size: 18px; font-weight: 700; flex-shrink: 0; }
        .ph-chevron { color: #6b8faf; font-size: 12px; flex-shrink: 0; transition: transform .2s; }
        .ph-chevron.open { transform: rotate(180deg); }

        .ph-card-body { border-top: 1px solid rgba(0,200,255,0.08); padding: 16px 20px; }
        .ph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-bottom: 14px; }
        .ph-field { background: rgba(0,200,255,0.04); border-radius: 8px; padding: 10px 12px; }
        .ph-field-lbl { font-size: 10px; color: #6b8faf; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .ph-field-val { font-size: 13px; color: #e8f4ff; font-weight: 500; }

        .ph-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .ph-btn-del { background: rgba(255,50,80,0.08); border: 1px solid rgba(255,50,80,0.25);
          border-radius: 8px; color: #ff3250; padding: 7px 16px; font-size: 12px; cursor: pointer;
          font-family: 'DM Mono', monospace; transition: all .2s; }
        .ph-btn-del:hover { background: rgba(255,50,80,0.18); }
        .ph-btn-del:disabled { opacity: 0.5; cursor: not-allowed; }

        .ph-email-tag { font-size: 11px; color: #00ffaa; background: rgba(0,255,170,0.08);
          border: 1px solid rgba(0,255,170,0.2); border-radius: 999px; padding: 3px 10px; flex-shrink: 0; }

        .ph-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 24px; }
        .ph-pg-btn { background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.15);
          border-radius: 8px; color: #6b8faf; padding: 7px 18px; font-size: 12px; cursor: pointer;
          font-family: 'DM Mono', monospace; transition: all .2s; }
        .ph-pg-btn:hover:not(:disabled) { color: #00c8ff; border-color: rgba(0,200,255,0.35); }
        .ph-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ph-pg-info { font-size: 12px; color: #6b8faf; }

        .ph-empty { text-align: center; padding: 60px 20px; color: #6b8faf; }
        .ph-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .ph-empty-title { font-size: 16px; font-weight: 600; color: #2d4a6a; margin-bottom: 6px; }
        .ph-loading { text-align: center; padding: 60px; color: #6b8faf; font-size: 14px; }
      `}</style>

      <div className="ph-wrap">
        {/* Nav */}
        <nav className="ph-nav">
          <div className="ph-logo" onClick={() => navigate('/dashboard')}>
            <div className="ph-logo-icon">🧠</div>
            <span className="ph-logo-text">NeuroALS</span>
          </div>
          <button className="ph-back" onClick={() => navigate('/als-form')}>
            ← Back to Analysis
          </button>
        </nav>

        <div className="ph-body">
          <div className="ph-header">
            <div className="ph-title">Patient History</div>
            <div className="ph-sub">All past ALS analyses — newest first</div>
          </div>

          {/* Stats */}
          {!loading && !error && (
            <div className="ph-stats">
              <div className="ph-stat">
                <div className="ph-stat-val">{total}</div>
                <div className="ph-stat-lbl">Total Records</div>
              </div>
              <div className="ph-stat">
                <div className="ph-stat-val" style={{ color: '#ff3250' }}>
                  {records.filter((r) => r.riskLevel === 'Critical' || r.riskLevel === 'High').length}
                </div>
                <div className="ph-stat-lbl">High / Critical (this page)</div>
              </div>
              <div className="ph-stat">
                <div className="ph-stat-val" style={{ color: '#00ffaa' }}>
                  {records.filter((r) => r.reportEmailSent).length}
                </div>
                <div className="ph-stat-lbl">Reports Emailed (this page)</div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading && <div className="ph-loading">⚙️ Loading history...</div>}
          {error && (
            <div style={{ color: '#ff3250', background: 'rgba(255,50,80,0.07)', border: '1px solid rgba(255,50,80,0.25)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              ⚠ {error}
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="ph-empty">
              <div className="ph-empty-icon">🧬</div>
              <div className="ph-empty-title">No records yet</div>
              <div style={{ fontSize: '13px' }}>Run an ALS analysis and save a report to see it here.</div>
              <button className="ph-back" style={{ marginTop: '16px' }} onClick={() => navigate('/als-form')}>
                Go to Analysis →
              </button>
            </div>
          )}

          {!loading && records.map((r) => {
            const color = riskColors[r.riskLevel] || '#e8f4ff';
            const isOpen = expanded === r._id;
            return (
              <div key={r._id} className="ph-card">
                <div className="ph-card-head" onClick={() => setExpanded(isOpen ? null : r._id)}>
                  <span
                    className="ph-risk-badge"
                    style={{ color, borderColor: color + '55', background: color + '12' }}
                  >
                    {r.riskLevel}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="ph-name">{r.patientName}</div>
                    <div className="ph-meta">
                      Age {r.patientAge} · {r.patientSex === 'M' ? 'Male' : r.patientSex === 'F' ? 'Female' : r.patientSex} · {fmt(r.createdAt)}
                    </div>
                  </div>
                  {r.reportEmailSent && <span className="ph-email-tag">✉ Emailed</span>}
                  <div className="ph-prob" style={{ color }}>{r.alsProbability}%</div>
                  <div className={`ph-chevron ${isOpen ? 'open' : ''}`}>▼</div>
                </div>

                {isOpen && (
                  <div className="ph-card-body">
                    <div className="ph-grid">
                      {[
                        ['Muscle Strength', `${r.muscleStrength}/5`],
                        ['MUAP Duration', `${r.muapDuration} ms`],
                        ['MUAP Amplitude', `${r.muapAmplitude} mV`],
                        ['Polyphasic %', `${r.percentPolyphasic}%`],
                        ['Muscle', r.muscle || '—'],
                        ['Atrophy', r.atrophy || '—'],
                        ['Recruitment', r.recruitmentPattern || '—'],
                        ['Spontaneous Act.', r.spontaneousActivity || '—'],
                        ['Prediction', r.prediction === 1 ? 'ALS Detected' : 'No ALS'],
                        ['Model Label', r.label],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="ph-field">
                          <div className="ph-field-lbl">{lbl}</div>
                          <div className="ph-field-val">{val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="ph-actions">
                      <button
                        className="ph-btn-del"
                        disabled={deleting === r._id}
                        onClick={() => handleDelete(r._id)}
                      >
                        {deleting === r._id ? 'Deleting...' : '🗑 Delete Record'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ph-pagination">
              <button
                className="ph-pg-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="ph-pg-info">Page {page} of {totalPages}</span>
              <button
                className="ph-pg-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
