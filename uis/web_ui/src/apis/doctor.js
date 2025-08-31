// src/apis/doctor.js
// Fake API for dossier form view (Odoo-style)

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function hashCode(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function mulberry32(seed) {
  let t = seed + 0x6D2B79F5;
  return function () {
    t += 0x6D2B79F5;
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

async function fetchDossierById(id) {
  await delay(200);
  const seed = hashCode(String(id));
  const { first, last } = namesBySeed(seed);
  const gender = 'F'; // your app focuses on CPN
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
    // optionally other dossier fields…
  };
}

async function fetchConsultations({ dossierId }) {
  await delay(280);
  const seed = hashCode(`cons:${dossierId}`);
  const rnd = mulberry32(seed);
  const statuses = ['Planifiée', 'Terminée', 'Annulée'];
  const types = ['CPN', 'Suivi', 'Gynéco'];
  const count = 2 + Math.floor(rnd() * 3); // 2..4

  const items = Array.from({ length: count }).map((_, i) => {
    const dayOffset = -i * 7; // weekly history
    const time = ['08:30:00', '10:00:00', '14:00:00'][i % 3];
    return {
      id: `c-${dossierId}-${i + 1}`,
      title: `Consultation ${i + 1}`,
      type: types[Math.floor(rnd() * types.length)],
      status: statuses[Math.floor(rnd() * statuses.length)],
      date: dateShift(dayOffset, time),
    };
  });

  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function fetchCpnFiches({ dossierId }) {
  await delay(260);
  const seed = hashCode(`fiche:${dossierId}`);
  const rnd = mulberry32(seed);
  const statuses = ['Brouillon', 'Soumise', 'Validée'];
  const count = 1 + Math.floor(rnd() * 3); // 1..3

  return Array.from({ length: count }).map((_, i) => {
    const code = `FCPN-${String(dossierId).padStart(4, '0')}-${i + 1}`;
    const dayOffset = -i * 14;
    return {
      id: `f-${dossierId}-${i + 1}`,
      code,
      date: dateShift(dayOffset, '09:15:00').slice(0, 10), // only date
      status: statuses[Math.floor(rnd() * statuses.length)],
    };
  });
}

export const api = {
  fetchDossierById,
  fetchConsultations,
  fetchCpnFiches,
};