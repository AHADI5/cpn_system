// src/api/admin.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1';

const getToken = () => localStorage.getItem('token');

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

async function http(path, { method = 'GET', body, headers = {}, query } = {}) {
  const token = getToken();

  const opts = {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    credentials: 'include',
  };

  if (body) opts.body = body instanceof FormData ? body : JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}${buildQuery(query)}`, opts);

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

// Users
// Backend DTO: UserResponse { userID, userName, isEnabled, roles: [{ roleID, roleName, description }], lastLogin }
export const fetchAllUsers = (params) => http('/users/', { query: params });

export const createUser = ({ userName, passWord, userRoleIds }) =>
  http('/users/', {
    method: 'POST',
    body: { userName, passWord, userRoleIds }, // UserRequest
  });

// Roles
// Backend DTO: UserRoleResponse { roleName, description, users: [...] } — if IDs are available, they should be included.
export const fetchAllRoles = () =>
  http('/roles/', { method: 'GET' }).then((arr) =>
    (Array.isArray(arr) ? arr : []).map((r, idx) => ({
      roleID: r.roleID ?? r.id ?? r.roleId ?? r.userRoleID ?? null,
      roleName: r.roleName,
      description: r.description,
      _fallbackKey: idx,
    }))
  );