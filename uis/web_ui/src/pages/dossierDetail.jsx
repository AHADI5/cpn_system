// src/pages/DossierDetail.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  Avatar,
  Breadcrumbs,
  Link,
  Chip,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import colors from '../utils/colors';
import { api } from '../apis/doctor';
import CreateCpnDialog from '../components/layout/createCPNDialog';

function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function stringToColor(string = '') {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += (`00${value.toString(16)}`).slice(-2);
  }
  return color;
}

function ageFromBirthDate(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return years;
}

function TabPanel({ value, current, children }) {
  return (
    <Box role="tabpanel" hidden={value !== current} sx={{ pt: 2 }}>
      {value === current ? children : null}
    </Box>
  );
}

export default function DossierDetail() {
  const { id } = useParams(); // dossier id
  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState(null);

  const [consultations, setConsultations] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(true);

  const [tab, setTab] = useState('cpn'); // default to CPNs tab
  const cpnRef = useRef(null);

  // Create CPN dialog state
  const [createOpen, setCreateOpen] = useState(false);

  const patient = dossier?.patient || {};
  const fullName = useMemo(
    () => [patient.firstName, patient.lastName].filter(Boolean).join(' '),
    [patient.firstName, patient.lastName]
  );
  const age = ageFromBirthDate(patient.birthDate || patient.dob);

  const upcomingConsultations = useMemo(() => {
    if (!Array.isArray(consultations)) return [];
    const now = Date.now();
    return consultations
      .filter((c) => c?.date && !Number.isNaN(new Date(c.date).getTime()) && new Date(c.date).getTime() >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [consultations]);

  const loadDossier = async () => {
    setLoading(true);
    try {
      const data = await api.fetchDossierById(id);
      setDossier(data || null);
    } catch {
      setDossier(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTabs = async () => {
    setLoadingTabs(true);
    try {
      const [cons, fichesRes] = await Promise.all([
        api.fetchConsultations({ dossierId: id }),
        api.fetchCpnFiches({ dossierId: id }),
      ]);
      setConsultations(Array.isArray(cons) ? cons : []);
      setFiches(Array.isArray(fichesRes) ? fichesRes : []);
    } catch {
      setConsultations([]);
      setFiches([]);
    } finally {
      setLoadingTabs(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [id]);

  useEffect(() => {
    loadTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const scrollToCpn = () => {
    setTab('cpn');
    cpnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenCreate = () => setCreateOpen(true);
  const handleCloseCreate = () => setCreateOpen(false);

  const handleCreated = async () => {
    setCreateOpen(false);
    setTab('cpn');
    await loadTabs();
    cpnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component={RouterLink} to="/dossiers" underline="hover" color="inherit">
          Dossiers
        </Link>
        <Typography color="text.primary">Dossier {dossier?.uniqueID || id}</Typography>
      </Breadcrumbs>

      {/* Title row + actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {fullName || 'Patient'} {dossier?.uniqueID ? `• ${dossier.uniqueID}` : `• #${id}`}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={scrollToCpn}>
            Fiches CPN ({loadingTabs ? '…' : fiches.length})
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            sx={{ backgroundColor: colors?.primary, '&:hover': { backgroundColor: colors?.primary } }}
          >
            Créer fiche CPN
          </Button>
        </Stack>
      </Stack>

      {/* Patient info (stacked in a single column) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        {loading ? (
          <Stack spacing={1}>
            <Skeleton height={28} />
            <Skeleton height={28} />
            <Skeleton height={28} />
            <Skeleton height={28} />
            <Skeleton height={28} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={patient.avatarUrl}
                alt={fullName}
                sx={{ width: 64, height: 64, bgcolor: stringToColor(fullName), color: '#fff' }}
              >
                {initials(fullName) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {fullName || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dossier?.uniqueID || `#${id}`}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={1.25}>
              {[
                { label: 'Sexe', value: patient.gender || '—' },
                {
                  label: 'Naissance',
                  value: patient.birthDate
                    ? `${new Date(patient.birthDate).toLocaleDateString()} ${age != null ? `(${age} ans)` : ''}`
                    : '—',
                },
                { label: 'Téléphone', value: patient.phoneNumber || '—' },
                { label: 'Email', value: patient.email || '—' },
                { label: 'Adresse', value: patient.address || '—' },
              ].map((f) => (
                <Box key={f.label}>
                  <Typography variant="caption" color="text.secondary">
                    {f.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>{f.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Paper>

      {/* Content with tabs: CPNs + Upcoming consultations */}
      <Paper ref={cpnRef} variant="outlined" sx={{ p: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
        >
          <Tab label={loadingTabs ? 'Fiches CPN' : `Fiches CPN (${fiches.length})`} value="cpn" />
          <Tab label="Consultations à venir" value="upcoming" />
        </Tabs>
        <Divider />

        {/* Fiches CPN */}
        <TabPanel value={tab} current="cpn">
          {loadingTabs ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Skeleton height={28} />
              <Skeleton height={28} />
              <Skeleton height={28} />
            </Stack>
          ) : fiches.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aucune fiche CPN.
            </Typography>
          ) : (
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fiches.map((f, i) => (
                  <TableRow key={f.id || i} hover>
                    <TableCell>{f.code || f.id || i + 1}</TableCell>
                    <TableCell>{f.date ? new Date(f.date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{f.status || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>

        {/* Consultations à venir */}
        <TabPanel value={tab} current="upcoming">
          {loadingTabs ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Skeleton height={28} />
              <Skeleton height={28} />
              <Skeleton height={28} />
            </Stack>
          ) : upcomingConsultations.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aucune consultation à venir.
            </Typography>
          ) : (
            <List dense sx={{ mt: 0.5 }}>
              {upcomingConsultations.map((c) => (
                <ListItem key={c.id} disableGutters divider>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontWeight: 600 }}>
                          {c.title || c.type || 'Consultation'}
                        </Typography>
                        {c.status ? <Chip label={c.status} size="small" /> : null}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {c.date ? new Date(c.date).toLocaleString() : '—'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>

      {/* Create CPN Dialog (separated) */}
      <CreateCpnDialog
        open={createOpen}
        onClose={handleCloseCreate}
        dossierId={id}
        onCreated={handleCreated}
      />
    </Box>
  );
}