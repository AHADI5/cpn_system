// src/pages/DossiersPage.jsx
import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  TextField,
  InputAdornment,
  CardActionArea,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import Avatar from '@mui/material/Avatar';

import colors from '../utils/colors';
import { api } from '../apis/api';
import CreateDossierDialog from '../components/layout/createDossier';
import { useAuth } from '../context/AuthContext';

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

function normalize(str = '') {
  return String(str).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function getDossierDate(dossier) {
  const raw =
    dossier?.createdAt ||
    dossier?.created_at ||
    dossier?.date ||
    dossier?.updatedAt ||
    null;
  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function FolderCard({ dossier }) {
  const patient = dossier?.patient || {};
  const fullName = useMemo(
    () => [patient.firstName, patient.lastName].filter(Boolean).join(' '),
    [patient.firstName, patient.lastName]
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'visible',
        p: 2,
        pt: 3,
        height: '100%',
        borderColor: colors.borderColor,
        transition: (t) => t.transitions.create('box-shadow'),
        '&:hover': { boxShadow: 4 },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: 'primary.main',
          opacity: 0.15,
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -10,
          left: 16,
          width: 72,
          height: 16,
          backgroundColor: 'primary.main',
          opacity: 0.3,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          boxShadow: 1,
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={patient.avatarUrl}
            alt={fullName}
            sx={{ bgcolor: stringToColor(fullName), color: '#fff' }}
          >
            {initials(fullName) || '?'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {fullName || 'Unnamed patient'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dossier?.uniqueID
                ? `${dossier.uniqueID}`
                : dossier?.id
                ? `#${dossier.id}`
                : 'Folder'}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small">
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default function DossiersPage() {
  const { role } = useAuth();
  const canOpen = role === 'DOCTOR';
  const canCreate = role === 'RECEPTIONIST'; // per your spec
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  // Filters
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(''); // yyyy-mm-dd

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.fetchDossiers();
      setDossiers(Array.isArray(data) ? data : []);
    } catch (e) {
      setToast({ open: true, msg: e.message || 'Failed to load dossiers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredDossiers = useMemo(() => {
    const q = normalize(search.trim());
    const hasQuery = q.length > 0;
    const hasDate = Boolean(filterDate);

    return dossiers.filter((d) => {
      if (hasQuery) {
        const patient = d?.patient || {};
        const name = normalize([patient.firstName, patient.lastName].filter(Boolean).join(' '));
        const nameAlt = normalize([patient.lastName, patient.firstName].filter(Boolean).join(' '));
        const uid = normalize(d?.uniqueID ?? d?.id ?? '');
        const matchesText = name.includes(q) || nameAlt.includes(q) || String(uid).includes(q);
        if (!matchesText) return false;
      }

      if (hasDate) {
        const itemDate = getDossierDate(d);
        if (!itemDate) return false;
        const [yyyy, mm, dd] = filterDate.split('-').map((n) => parseInt(n, 10));
        const selected = new Date(yyyy, (mm || 1) - 1, dd || 1);
        if (!isSameDay(itemDate, selected)) return false;
      }

      return true;
    });
  }, [dossiers, search, filterDate]);

  const clearFilters = () => {
    setSearch('');
    setFilterDate('');
  };

  return (
    <Box sx={{ pt: 1.5, px: 2, width: '100%', maxWidth: '100%' }}>
      {/* Title */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, color: colors.textPrimary }}>
          Dossiers
        </Typography>
      </Stack>

      {/* Toolbar: Search | Date | Create (only for Receptionist) */}
      <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1.5, mb: 1.5, width: '100%' }}>
        <TextField
          size="small"
          placeholder="Search name or unique ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 260 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

        <TextField
          size="small"
          type="date"
          label="Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          sx={{ width: { xs: '100%', sm: 220 } }}
          InputLabelProps={{ shrink: true }}
        />

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              whiteSpace: 'nowrap',
              backgroundColor: colors.primary,
              '&:hover': { backgroundColor: colors.primary },
            }}
          >
            Create folder
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : dossiers.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderColor: colors.borderColor }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No dossiers yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Start by creating a new folder for a patient.
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ backgroundColor: colors.primary, '&:hover': { backgroundColor: colors.primary } }}
            >
              Create folder
            </Button>
          )}
        </Paper>
      ) : filteredDossiers.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, borderColor: colors.borderColor }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} justifyContent="space-between">
            <Typography color="text.secondary">No results for your current filters.</Typography>
            <Button onClick={clearFilters}>Clear filters</Button>
          </Stack>
        </Paper>
      ) : (
        <>
          {/* Cards — CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              width: '100%',
            }}
          >
            {filteredDossiers.map((d) => {
              const id = d.uniqueID || d.id;
              const card = <FolderCard dossier={d} />;

              return canOpen ? (
                <CardActionArea
                  key={id}
                  component={RouterLink}
                  to={`/dossiers/${id}`}
                  sx={{ borderRadius: 1 }}
                >
                  {card}
                </CardActionArea>
              ) : (
                <Box key={id} sx={{ cursor: 'not-allowed', opacity: 0.95 }}>
                  {card}
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {canCreate && (
        <CreateDossierDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={() => {
            setToast({ open: true, msg: 'Folder created successfully', severity: 'success' });
            load();
          }}
        />
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}