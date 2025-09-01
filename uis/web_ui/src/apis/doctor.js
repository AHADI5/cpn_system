// src/apis/doctor.js
// Fake API for dossier form view (Odoo-style)

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// In-memory store for created CPN fiches (so they persist during the dev session)
const memory = {
  cpnByDossier: {}, // { [dossierId]: Array<fiche> }
};

function hashCode(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
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
  const firstNames = ['Aïcha', 'Leïla', 'Fatou', 'Nadia', 'Amal', 'Sara', 'Mina', 'Yara'];
  const lastNames = ['Ndiaye', 'Mahmoud', 'Diallo', 'Benali', 'Khalil', 'Rami', 'Haddad', 'Benslimane'];
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

async function fetchDossierById(id) {
  await delay(200);
  const seed = hashCode(String(id));
  const { first, last } = namesBySeed(seed);
  const gender = 'F'; // app CPN
  const ageYears = 20 + (seed % 18); // 20..37
  const birthYear = new Date().getFullYear() - ageYears;
  const birthDate = `${birthYear}-0${(seed % 8) + 1}-1${seed % 9}`;

  return {
    id,
    uniqueID: `DS-${String(id).padStart(4, '0')}`,
    patient: {
      firstName: first,
      lastName: last,
      gender,
      birthDate,
      phoneNumber: `+221 77 ${String(seed).slice(0, 3)} ${String(seed).slice(3, 6) || '123'}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      address: ['Dakar', 'Thiès', 'Saint-Louis'][seed % 3] + ', SN',
      avatarUrl: '', // leave blank to use initials
    },
  };
}

async function fetchConsultations({ dossierId }) {
  await delay(280);
  const seed = hashCode(`cons:${dossierId}`);
  const rnd = mulberry32(seed);
  const statuses = ['Planifiée', 'Terminée', 'Annulée'];
  const types = ['CPN', 'Suivi', 'Gynéco'];

  const pastCount = 2 + Math.floor(rnd() * 2); // 2..3
  const futureCount = 1 + Math.floor(rnd() * 2); // 1..2

  const past = Array.from({ length: pastCount }).map((_, i) => {
    const offset = -7 * (i + 1); // weekly in the past
    const time = ['08:30:00', '10:00:00', '14:00:00'][i % 3];
    const status = ['Terminée', 'Terminée', 'Annulée'][i % 3]; // mostly done
    return {
      id: `c-${dossierId}-p-${i + 1}`,
      title: `Consultation ${i + 1}`,
      type: types[Math.floor(rnd() * types.length)],
      status,
      date: dateShift(offset, time),
    };
  });

  const future = Array.from({ length: futureCount }).map((_, i) => {
    const offset = 7 * (i + 1); // weekly in the future
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
  // Sort by date descending (newest first)
  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function fetchCpnFiches({ dossierId }) {
  await delay(260);
  const seed = hashCode(`fiche:${dossierId}`);
  const rnd = mulberry32(seed);
  const statuses = ['Brouillon', 'Soumise', 'Validée'];
  const count = 1 + Math.floor(rnd() * 3); // 1..3

  // Base generated items (deterministic)
  const base = Array.from({ length: count }).map((_, i) => {
    const code = `FCPN-${String(dossierId).padStart(4, '0')}-${i + 1}`;
    const dayOffset = -i * 14;
    return {
      id: `f-${dossierId}-g-${i + 1}`,
      code,
      date: dateShift(dayOffset, '09:15:00').slice(0, 10), // only date
      status: statuses[Math.floor(rnd() * statuses.length)],
    };
  });

  // In-memory created items
  const created = memory.cpnByDossier[dossierId] || [];

  // Merge and sort (newest by date desc)
  const all = [...base, ...created].sort((a, b) => new Date(b.date) - new Date(a.date));
  return all;
}

// New: fetch obstetrical antecedent blocks (structure from backend)
async function fetchAntecedentBlocks({ dossierId, antecedentType }) {
  await delay(200);
  // You can branch on "antecedentType" if needed; here we return the exact structure provided
  return [
    {
      id: 2,
      code: 'PREV_PREGNENCIES',
      name: 'PREVIOUS PREGNENCIES',
      description: 'OBSTETRICS ANTECEDANT ',
      antecedentType: antecedentType || 'OBSTETRICS ANTECEDANT',
      active: true,
      fields: [
        {
          id: 1,
          code: 'Enfant-nouveau-né',
          label: 'Enfant nouveau né',
          type: 'number',
          required: true,
          displayOrder: null,
          constraints: {},
          ui: {},
        },
      ],
    },
  ];
}

// Optional alias for compatibility if someone calls fetchAntecedents
const fetchAntecedents = fetchAntecedentBlocks;

// New: create CPN fiche and keep it in memory so it appears in lists
async function createCpnFiche(payload) {
  await delay(300);
  const { dossierId, lastAmenorrheaDate, antecedents } = payload || {};
  if (!dossierId) throw new Error('dossierId is required');
  // Compute next code number based on existing items
  const existing = await fetchCpnFiches({ dossierId });
  const nextNum = existing.length + 1;
  const code = `FCPN-${String(dossierId).padStart(4, '0')}-${nextNum}`;

  const created = {
    id: `f-${dossierId}-m-${Date.now()}`,
    code,
    date: todayDateStr(), // creation date
    status: 'Brouillon',
    lastAmenorrheaDate: lastAmenorrheaDate || null,
    antecedents: Array.isArray(antecedents) ? antecedents : [],
  };

  if (!memory.cpnByDossier[dossierId]) memory.cpnByDossier[dossierId] = [];
  memory.cpnByDossier[dossierId].push(created);

  return created;
}

export const api = {
  fetchDossierById,
  fetchConsultations,
  fetchCpnFiches,
  // New endpoints
  fetchAntecedentBlocks,
  fetchAntecedents,
  createCpnFiche,
};