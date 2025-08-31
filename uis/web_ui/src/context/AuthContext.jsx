// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

function parseToken(token) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function extractRole(decoded) {
  if (!decoded) return null;
  let authorities = decoded.authorities ?? decoded.roles ?? decoded.role ?? null;
  const list = Array.isArray(authorities) ? authorities : [authorities];
  const upper = list.filter(Boolean).map((v) => String(v).toUpperCase());
  if (upper.some((v) => v.includes('ADMIN'))) return 'ADMIN';
  if (upper.some((v) => v.includes('DOCTOR'))) return 'DOCTOR';
  if (upper.some((v) => v.includes('RECEPTION'))) return 'RECEPTIONIST';
  return null;
}

export function defaultPathByRole(role) {
  switch (role) {
    case 'ADMIN':
      return '/adminDashboard';
    case 'DOCTOR':
      return '/doctorDashboard';
    case 'RECEPTIONIST':
      return '/dossiers';
    default:
      return '/dossiers';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decoded = parseToken(localStorage.getItem('token'));
    if (decoded) {
      setUser(decoded);
      setPermissions(decoded.permissions || []);
      setRole(extractRole(decoded));
    }
    setLoading(false);
  }, []);

  // Return the role so caller can redirect immediately
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = parseToken(token);
    const nextRole = extractRole(decoded);
    setUser(decoded);
    setPermissions(decoded?.permissions || []);
    setRole(nextRole);
    setLoading(false);
    return nextRole;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPermissions([]);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, permissions, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);