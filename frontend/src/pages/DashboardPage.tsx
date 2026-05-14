import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ✅ NEW — ALS navigation
  const goToALS = () => {
    navigate('/als-form');
  };

  // ✅ NEW — History navigation
  const goToHistory = () => {
    navigate('/patient-history');
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="glass-card p-12 max-w-md w-full text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 to-teal-400 flex items-center justify-center text-2xl font-bold font-display mx-auto mb-6">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>

        <h1 className="font-display text-3xl font-black mb-2">
          Welcome, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-400 text-sm mb-2">
          Signed in as{' '}
          <span className="text-sky-400 font-semibold">{user?.role}</span>
        </p>
        <p className="text-slate-500 text-xs mb-8">{user?.email}</p>

        {user?.institution && (
          <div className="px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm text-sky-400 mb-8">
            🏥 {user.institution}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Role', value: user?.role || '-' },
            { label: 'Verified', value: user?.isVerified ? 'Yes' : 'Pending' },
            { label: 'Status', value: 'Active' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]"
            >
              <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                {label}
              </div>
              <div className="text-sm font-semibold text-teal-400">{value}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          🚧 Full dashboard with patient management, EMG viewer, and diagnosis
          tools will be connected here.
        </p>

        {/* ✅ NEW ALS BUTTON */}
        <Button variant="primary" size="md" fullWidth onClick={goToALS}>
          ⚡ Start ALS Analysis
        </Button>

        <div className="mt-3" />

        {/* ✅ PATIENT HISTORY BUTTON */}
        <Button variant="outline" size="md" fullWidth onClick={goToHistory}>
          🕒 View Patient History
        </Button>

        <div className="mt-3" />

        <Button variant="danger" size="md" fullWidth onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
