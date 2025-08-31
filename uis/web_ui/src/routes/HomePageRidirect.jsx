// src/routes/RoleHomeRedirect.jsx
import { Navigate } from 'react-router-dom';
import { useAuth, defaultPathByRole } from '../context/AuthContext';

export default function RoleHomeRedirect() {
  const { loading, user, role } = useAuth();
  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={defaultPathByRole(role)} replace />;
}