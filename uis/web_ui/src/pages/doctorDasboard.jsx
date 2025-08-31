// src/pages/DoctorDashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  IconButton,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Skeleton,
} from '@mui/material';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ChildFriendlyRoundedIcon from '@mui/icons-material/ChildFriendlyRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import DoNotDisturbOnRoundedIcon from '@mui/icons-material/DoNotDisturbOnRounded';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import colors from '../utils/colors';
import * as doctorApi from '../apis/doctor';

// Fixed StatCard: use flex centering and a simple palette key fallback
function StatCard({ icon, label, value, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: color || 'primary.light',
            color: '#fff',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {value ?? '—'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

const PIE_COLORS = ['#2e7d32', '#e53935']; // normal, complicated

function todayISO() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function timeHM(dateStr) {
  const d = dateStr ? new Date(dateStr) : null;
  return d && !isNaN(d.getTime())
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';
}

export default function DoctorDashboard() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingConsult, setLoadingConsult] = useState(true);
  const [error, setError] = useState('');

  // KPIs
  const [births, setBirths] = useState(0);
  const [abortions, setAbortions] = useState(0);

  // Charts
  const [ageBuckets, setAgeBuckets] = useState([]); // [{ range: '0-12', count: 10 }, ...]
  const [complicationStats, setComplicationStats] = useState({ normal: 0, complicated: 0 });

  // Consultations
  const [consultDate, setConsultDate] = useState(todayISO());
  const [consultations, setConsultations] = useState([]);

  const loadStats = async () => {
    setError('');
    setLoadingStats(true);
    try {
      const [summary, buckets, compStats] = await Promise.all([
        doctorApi.fetchSummary(), // { births, abortions }
        doctorApi.fetchPregnancyAgeBuckets(), // [{ range, count }]
        doctorApi.fetchComplicationStats(), // { normal, complicated }
      ]);

      setBirths(summary?.births ?? 0);
      setAbortions(summary?.abortions ?? 0);
      setAgeBuckets(Array.isArray(buckets) ? buckets : []);
      setComplicationStats({
        normal: Number(compStats?.normal ?? 0),
        complicated: Number(compStats?.complicated ?? 0),
      });
    } catch (e) {
      setError(e.message || 'Failed to load doctor dashboard');
    } finally {
      setLoadingStats(false);
    }
  };

  const loadConsultations = async (dateStr) => {
    setLoadingConsult(true);
    try {
      const items = await doctorApi.fetchConsultations({ date: dateStr });
      setConsultations(Array.isArray(items) ? items : []);
    } catch {
      setConsultations([]);
    } finally {
      setLoadingConsult(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadConsultations(consultDate);
  }, [consultDate]);

  const pieData = useMemo(
    () => [
      { name: 'Normales', value: Math.max(0, Number(complicationStats.normal)) },
      { name: 'Compliquées', value: Math.max(0, Number(complicationStats.complicated)) },
    ],
    [complicationStats]
  );

  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Tableau de bord — Médecin
        </Typography>
        <IconButton
          onClick={() => {
            loadStats();
            loadConsultations(consultDate);
          }}
          title="Rafraîchir"
        >
          <RefreshRoundedIcon />
        </IconButton>
      </Stack>

      {/* Main layout: left (content) | right (consultations) */}
      <Grid container spacing={2}>
        {/* Left side */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              {loadingStats ? (
                <Skeleton variant="rounded" height={96} />
              ) : (
                <StatCard
                  icon={<ChildFriendlyRoundedIcon />}
                  label="Naissances"
                  value={births}
                  color={colors?.primary}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {loadingStats ? (
                <Skeleton variant="rounded" height={96} />
              ) : (
                <StatCard
                  icon={<DoNotDisturbOnRoundedIcon />}
                  label="Avortements"
                  value={abortions}
                  color="#a855f7"
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {loadingStats ? (
                <Skeleton variant="rounded" height={96} />
              ) : (
                <StatCard
                  icon={<ReportProblemRoundedIcon />}
                  label="Grossesses compliquées"
                  value={complicationStats.complicated}
                  color="#ef4444"
                />
              )}
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* Pregnancy age distribution */}
            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Répartition par âge de grossesse (semaines)
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ height: 300 }}>
                  {loadingStats ? (
                    <Skeleton variant="rounded" height={300} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageBuckets}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis allowDecimals={false} />
                        <ReTooltip />
                        <Bar
                          dataKey="count"
                          fill={colors?.primary || '#1976d2'}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Complicated pregnancies */}
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Grossesses compliquées
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ height: 300 }}>
                  {loadingStats ? (
                    <Skeleton variant="rounded" height={300} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                        <ReTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Right side: consultations with date filter */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1, gap: 1 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Consultations
              </Typography>
              <TextField
                size="small"
                type="date"
                label="Date"
                value={consultDate}
                onChange={(e) => setConsultDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                {loadingConsult ? 'Chargement…' : `${consultations.length} consultation(s)`}
              </Typography>
              {!loadingConsult && (
                <Button size="small" onClick={() => loadConsultations(consultDate)}>
                  Actualiser
                </Button>
              )}
            </Stack>

            {loadingConsult ? (
              <Stack spacing={1}>
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} />
              </Stack>
            ) : consultations.length === 0 ? (
              <Typography color="text.secondary">Aucune consultation pour cette date.</Typography>
            ) : (
              <List dense sx={{ maxHeight: 430, overflow: 'auto' }}>
                {consultations.map((c) => (
                  <ListItem key={c.id} disableGutters divider>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ fontWeight: 500 }}>
                            {c.patientName || 'Patient(e)'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.type || ''}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {timeHM(c.datetime)} • {c.status || '—'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {error ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}