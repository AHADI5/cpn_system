// src/App.jsx
import React from 'react';
import './App.css';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/loginPage';
import DossiersPage from './pages/dossierPage';
import AppLayout from './components/layout/appLayout';
import RoleHomeRedirect from './routes/HomePageRidirect';
import AdminDashboard from './pages/adminDashboard';
import UsersPage from './pages/usersPage';
import DoctorDashboard from './pages/doctorDasboard';
import DossierDetail  from './pages/dossierDetail';
// Authenticated shell (keeps your layout)
function ProtectedShell() {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

// Role gate for specific pages
function RoleGuard({ allow, children }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}

// Temporary placeholders — replace with your real pages


function ConsultationsPage() {
  return <div style={{ padding: 16 }}>Consultations</div>;
}

function RolesPage() {
  return <div style={{ padding: 16 }}>Roles (Admin only)</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected + Layout */}
        <Route element={<ProtectedShell />}>
          {/* Role-based home */}
          <Route path="/" element={<RoleHomeRedirect />} />

          {/* Role-gated dashboards */}
          <Route
            path="/doctorDashboard"
            element={
              <RoleGuard allow={['DOCTOR']}>
                <DoctorDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/adminDashboard"
            element={
              <RoleGuard allow={['ADMIN']}>
                <AdminDashboard />
              </RoleGuard>
            }
          />

          {/* Shared routes */}
          <Route path="/dossiers" element={<DossiersPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />

          {/* Admin-only routes from menu */}
          <Route
            path="/users"
            element={
              <RoleGuard allow={['ADMIN']}>
                <UsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="/roles"
            element={
              <RoleGuard allow={['ADMIN']}>
                <RolesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/dossiers/:id"
            element={
              <RoleGuard allow={['DOCTOR']}>
                <DossierDetail />
              </RoleGuard>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}