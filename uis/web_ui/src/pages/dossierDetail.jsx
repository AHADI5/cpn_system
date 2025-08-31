// src/pages/DossierDetail.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  Tabs,
  Tab,
  Grid,
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
} from '@mui/material';
import colors from '../utils/colors';
// Uses fake API defined in src/apis/doctor.js
import { api } from '../apis/doctor';

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
  const [tab, setTab] = useState('consultations');

  const [consultations, setConsultations] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(true);

  const patient = dossier?.patient || {};
  const fullName = useMemo(
    () => [patient.firstName, patient.lastName].filter(Boolean).join(' '),
    [patient.firstName, patient.lastName]
  );
  const age = ageFromBirthDate(patient.birthDate || patient.dob);

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

  return (
    <Box sx={{ p: 2 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component={RouterLink} to="/dossiers" underline="hover" color="inherit">
          Dossiers
        </Link>
        <Typography color="text.primary">Dossier {dossier?.uniqueID || id}</Typography>
      </Breadcrumbs>

      {/* Title row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {fullName || 'Patient'} {dossier?.uniqueID ? `• ${dossier.uniqueID}` : `• #${id}`}
        </Typography>

        {/* Example action: create CPN fiche (wire later) */}
        <Button variant="contained" sx={{ backgroundColor: colors?.primary, '&:hover': { backgroundColor: colors?.primary } }}>
          Créer fiche CPN
        </Button>
      </Stack>

      {/* Patient info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        {loading ? (
          <Stack spacing={1}>
            <Skeleton height={28} />
            <Skeleton height={28} />
            <Skeleton height={28} />
          </Stack>
        ) : (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Avatar
                src={patient.avatarUrl}
                alt={fullName}
                sx={{ width: 64, height: 64, bgcolor: stringToColor(fullName), color: '#fff' }}
              >
                {initials(fullName) || '?'}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Nom complet</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{fullName || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Identifiant</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{dossier?.uniqueID || `#${id}`}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Sexe</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{patient.gender || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Naissance</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {patient.birthDate
                      ? `${new Date(patient.birthDate).toLocaleDateString()} ${age != null ? `(${age} ans)` : ''}`
                      : '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{patient.phoneNumber || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{patient.email || '—'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Adresse</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{patient.address || '—'}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Notebook (tabs) */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
        >
          <Tab label="Consultations" value="consultations" />
          <Tab label="Fiches CPN" value="fiches" />
        </Tabs>
        <Divider />

        {/* Consultations tab */}
        <TabPanel value={tab} current="consultations">
          {loadingTabs ? (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Skeleton height={28} />
              <Skeleton height={28} />
              <Skeleton height={28} />
            </Stack>
          ) : consultations.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Aucune consultation.
            </Typography>
          ) : (
            <List dense sx={{ mt: 1 }}>
              {consultations.map((c) => (
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

        {/* Fiches CPN tab */}
        <TabPanel value={tab} current="fiches">
          {loadingTabs ? (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Skeleton height={28} />
              <Skeleton height={28} />
              <Skeleton height={28} />
            </Stack>
          ) : fiches.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
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
      </Paper>
    </Box>
  );
}