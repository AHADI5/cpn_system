// src/App.jsx
import React from 'react';
import './App.css';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/loginPage';
import DossiersPage from './pages/dossierPage';
import AppLayout from './components/layout/appLayout';

function ProtectedShell() {
  const { user, loading } = useAuth();

  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/login" replace />;

  // Authenticated area with shared layout (TopBar + Sidebar)
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected + Layout */}
        <Route element={<ProtectedShell />}>
          <Route path="/" element={<Navigate to="/dossiers" replace />} />
          <Route path="/dossiers" element={<DossiersPage />} />
          {/* Add more authenticated routes here */}
          {/* <Route path="/patients" element={<PatientsPage />} /> */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dossiers" replace />} />
      </Routes>
    </AuthProvider>
  );
}