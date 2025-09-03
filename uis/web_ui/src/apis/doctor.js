// src/apis/doctor.js
// Fake + real API hybrid for CPN app (avec support du token Bearer)

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Config runtime
let BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8080/api/v1';

const AUTH = {
  token: null,
  tokenProvider: null, // fonction optionnelle pour fournir le token dynamiquement
  onUnauthorized: null, // callback optionnel sur 401
};

// In-memory stores (dev fallback)
const memory = {
  cpnByDossier: {}, // { [dossierId]: Array<fiche> }
  antecedentDefs: [], // list of antecedent definitions
  _idSeq: 1,
};

function nextId() {
  return memory._idSeq++;
}

export function setApiBaseUrl(url) {
  if (typeof url === 'string' && url) BASE_URL = url;
}

export function setAuthToken(token) {
  AUTH.token = token;
}

export function setTokenProvider(fn) {
  AUTH.tokenProvider = typeof fn === 'function' ? fn : null;
}

export function setOnUnauthorized(fn) {
  AUTH.onUnauthorized = typeof fn === 'function' ? fn : null;
}

function getAuthToken() {
  // Priorité: variable en mémoire -> provider -> storage
  let t = AUTH.token;
  if (!t && typeof AUTH.tokenProvider === 'function') {
    try {
      t = AUTH.tokenProvider();
    } catch {
      /* no-op */
    }
  }
  if (!t) {
    t =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      null;
  }
  return t || null;
}

async function http(method, path, body, extraHeaders = {}) {
  const token = getAuthToken ? getAuthToken() : null;
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  const headers = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    mode: 'cors',
  });

  if (!res.ok) {
    if (res.status === 401 && typeof AUTH.onUnauthorized === 'function') {
      try {
        AUTH.onUnauthorized();
      } catch {
        /* no-op */
      }
    }
    const text = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json();
}

/* ------------------ Fake endpoints pour dossier / consultations / fiches ------------------ */
function hashCode(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1)
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function mulberry32(seed) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function namesBySeed(seed) {
  const firstNames = [
    'Aïcha',
    'Leïla',
    'Fatou',
    'Nadia',
    'Amal',
    'Sara',
    'Mina',
    'Yara',
  ];
  const lastNames = [
    'Ndiaye',
    'Mahmoud',
    'Diallo',
    'Benali',
    'Khalil',
    'Rami',
    'Haddad',
    'Benslimane',
  ];
  const rnd = mulberry32(seed);
  return {
    first: firstNames[Math.floor(rnd() * firstNames.length)],
    last: lastNames[Math.floor(rnd() * lastNames.length)],
  };
}
function dateShift(days = 0, time = '10:00:00') {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${time}`;
}
function todayDateStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Replace this function in src/apis/doctor.js
async function fetchDossierById(uniqueID) {
  // Real backend call (Authorization header handled by your http() helper)
  return await http('GET', `/dossier/${encodeURIComponent(uniqueID)}`);
}

async function fetchConsultations({ dossierId }) {
  await delay(280);
  const seed = hashCode(`cons:${dossierId}`);
  const rnd = mulberry32(seed);
  const statuses = ['Planifiée', 'Terminée', 'Annulée'];
  const types = ['CPN', 'Suivi', 'Gynéco'];

  const pastCount = 2 + Math.floor(rnd() * 2);
  const futureCount = 1 + Math.floor(rnd() * 2);

  const past = Array.from({ length: pastCount }).map((_, i) => {
    const offset = -7 * (i + 1);
    const time = ['08:30:00', '10:00:00', '14:00:00'][i % 3];
    const status = ['Terminée', 'Terminée', 'Annulée'][i % 3];
    return {
      id: `c-${dossierId}-p-${i + 1}`,
      title: `Consultation ${i + 1}`,
      type: types[Math.floor(rnd() * types.length)],
      status,
      date: dateShift(offset, time),
    };
  });

  const future = Array.from({ length: futureCount }).map((_, i) => {
    const offset = 7 * (i + 1);
    const time = ['08:30:00', '10:00:00', '14:00:00'][i % 3];
    return {
      id: `c-${dossierId}-f-${i + 1}`,
      title: `Consultation planifiée ${i + 1}`,
      type: types[Math.floor(rnd() * types.length)],
      status: 'Planifiée',
      date: dateShift(offset, time),
    };
  });

  const items = [...past, ...future];
  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function fetchCpnFiches({ dossierId }) {
  await delay(260);
  const seed = hashCode(`fiche:${dossierId}`);
  const rnd = mulberry32(seed);
  const statuses = ['Brouillon', 'Soumise', 'Validée'];
  const count = 1 + Math.floor(rnd() * 3);

  const base = Array.from({ length: count }).map((_, i) => {
    const code = `FCPN-${String(dossierId).padStart(4, '0')}-${i + 1}`;
    const dayOffset = -i * 14;
    return {
      id: `f-${dossierId}-g-${i + 1}`,
      code,
      date: dateShift(dayOffset, '09:15:00').slice(0, 10),
      status: statuses[Math.floor(rnd() * statuses.length)],
    };
  });

  const created = memory.cpnByDossier[dossierId] || [];
  return [...base, ...created].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

async function fetchAntecedentBlocks({ dossierId, antecedentType }) {
  await delay(200);
  return [
    {
      id: 2,
      code: 'PREV_PREGNENCIES',
      name: 'PREVIOUS PREGNENCIES',
      description: 'OBSTETRICS ANTECEDANT ',
      antecedentType: antecedentType || 'OBSTETRICS',
      active: true,
      fields: [
        {
          id: 1,
          code: 'Enfant-nouveau-né',
          label: 'Nombre',
          type: 'INTEGER',
          required: true,
          displayOrder: 1,
          constraints: { min: 0 },
          ui: {},
        },
      ],
    },
  ];
}
const fetchAntecedents = fetchAntecedentBlocks;

/* ------------------ Real CPN endpoints (POST then GET) ------------------ */

async function fetchCpnById(id) {
  return await http('GET', `/cpn/${encodeURIComponent(id)}`);
}

async function postCpn(payload) {
  const token = getAuthToken ? getAuthToken() : null;
  const res = await fetch(`${BASE_URL}/cpn`, {
    method: 'POST',
    headers: {
      Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    mode: 'cors',
  });

  const raw = await res.text().catch(() => '');
  if (!res.ok) {
    if (res.status === 401 && typeof AUTH.onUnauthorized === 'function') {
      try {
        AUTH.onUnauthorized();
      } catch {
        /* no-op */
      }
    }
    const err = new Error(`HTTP ${res.status}: ${raw || res.statusText}`);
    err.status = res.status;
    throw err;
  }

  // Backend returns plain text ID (e.g. "123")
  let id = Number((raw || '').trim());
  if (!Number.isFinite(id)) {
    // fallback if the backend returns JSON in the future
    try {
      const maybeJson = JSON.parse(raw);
      id = Number(maybeJson?.id ?? maybeJson);
    } catch {
      /* ignore */
    }
  }
  if (!Number.isFinite(id)) {
    throw new Error(
      'Unable to parse created CPN id from response payload (expected plain id)'
    );
  }
  return id;
}

async function createCpn(payload) {
  // 1) POST -> get id (text)
  const id = await postCpn(payload);
  // 2) GET -> fetch full CPN with consultations
  const cpn = await fetchCpnById(id);
  return cpn; // PrenatalConsultationFormResponse
}

/* ------------------ CRUD des définitions d’antécédents (API réelle + fallback) ------------------ */

async function listAntecedentDefinitions() {
  try {
    const res = await http('GET', '/antecedent');
    return res;
  } catch (e) {
    // Fallback mémoire
    await delay(100);
    return memory.antecedentDefs;
  }
}

async function createAntecedentDefinition(def) {
  // def: { code, name, description, antecedentType, fields }
  try {
    const created = await http('POST', '/antecedent', def);
    return created;
  } catch (e) {
    // Fallback mémoire
    await delay(100);
    const exists = memory.antecedentDefs.find((d) => d.code === def.code);
    if (exists) throw new Error('Code already exists (memory fallback)');
    const created = { id: nextId(), ...def };
    memory.antecedentDefs.push(created);
    return created;
  }
}

async function updateAntecedentDefinition(idOrCode, def) {
  try {
    const path = `/antecedent/${encodeURIComponent(idOrCode)}`;
    const updated = await http('PUT', path, def);
    return updated;
  } catch (e) {
    // Fallback mémoire
    await delay(100);
    const idx = memory.antecedentDefs.findIndex(
      (d) => d.id === idOrCode || d.code === idOrCode
    );
    if (idx < 0) throw new Error('Not found (memory fallback)');
    memory.antecedentDefs[idx] = {
      ...(memory.antecedentDefs[idx] || {}),
      ...def,
    };
    return memory.antecedentDefs[idx];
  }
}

async function deleteAntecedentDefinition(idOrCode) {
  try {
    const path = `/antecedent/${encodeURIComponent(idOrCode)}`;
    await http('DELETE', path);
    return true;
  } catch (e) {
    // Fallback mémoire
    await delay(100);
    const before = memory.antecedentDefs.length;
    memory.antecedentDefs = memory.antecedentDefs.filter(
      (d) => d.id !== idOrCode && d.code !== idOrCode
    );
    return memory.antecedentDefs.length < before;
  }
}

// Backward-compat alias used by CreateCpnDialog
async function submitPatientAntecedents(_patientId, request) {
  // POST then immediate GET full CPN
  const created = await createCpn(request);
  return created;
}

/* ------------------ Dev fallback for "fiches" (not CPN API) ------------------ */

async function createCpnFiche(payload) {
  await delay(300);
  const { dossierId } = payload || {};
  if (!dossierId) throw new Error('dossierId is required');
  const existing = await fetchCpnFiches({ dossierId });
  const nextNum = existing.length + 1;
  const code = `FCPN-${String(dossierId).padStart(4, '0')}-${nextNum}`;
  const created = {
    id: `f-${dossierId}-m-${Date.now()}`,
    code,
    date: todayDateStr(),
    status: 'Brouillon',
    ...payload,
  };
  if (!memory.cpnByDossier[dossierId]) memory.cpnByDossier[dossierId] = [];
  memory.cpnByDossier[dossierId].push(created);
  return created;
}

export const api = {
  // Existing
  fetchDossierById,
  fetchConsultations,
  fetchCpnFiches,
  fetchAntecedentBlocks,
  fetchAntecedents,
  createCpnFiche,
  // New CRUD
  listAntecedentDefinitions,
  createAntecedentDefinition,
  updateAntecedentDefinition,
  deleteAntecedentDefinition,
  // CPN endpoints
  fetchCpnById,
  createCpn,
  submitPatientAntecedents, // alias for CreateCpnDialog usage
};