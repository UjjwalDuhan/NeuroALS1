import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ChatWidget from '@/components/chat/ChatWidget';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import ALSForm from '@/pages/ALSForm';
import PatientHistoryPage from '@/pages/PatientHistoryPage';

import { useAuth } from '@/context/AuthContext';

const AppContent: React.FC = () => {
  const { token } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/als-form" element={<ALSForm />} />
          <Route path="/patient-history" element={<PatientHistoryPage />} />
        </Route>

        {/* Admin-only */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          {/* <Route path="/admin/users" element={<UsersPage />} /> */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {token && <ChatWidget token={token} />}
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
