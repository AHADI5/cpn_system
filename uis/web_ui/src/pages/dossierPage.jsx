// src/pages/DossiersPage.jsx
import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import Avatar from '@mui/material/Avatar';

import colors from '../utils/colors';
import { api } from '../api'; // ensure this points to your api helper
import CreateDossierDialog from '../components/layout/createDossier'; // adjust path if needed

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
    color += (`00${value.toString(16)}`).slice(-2); // fixed: use template string
  }
  return color;
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
        pt: 3, // space for the top strip
        height: '100%',
        borderColor: colors.borderColor,
        transition: (t) => t.transitions.create('box-shadow'),
        '&:hover': { boxShadow: 4 },
        // Folder top strip
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
        // Folder tab
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {fullName || 'Unnamed patient'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dossier?.uniqueID ? `Folder ${dossier.uniqueID}` : (dossier?.id ? `Folder #${dossier.id}` : 'Folder')}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small">
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {patient.gender ? <Chip size="small" label={patient.gender} /> : null}
        {patient.phoneNumber ? (
          <Chip size="small" label={patient.phoneNumber} variant="outlined" />
        ) : null}
      </Stack>
    </Paper>
  );
}

export default function DossiersPage() {
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

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

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: colors.textPrimary }}>
          Dossiers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ px: 2.5, backgroundColor: colors.primary, '&:hover': { backgroundColor: colors.primary } }}
        >
          Create
        </Button>
      </Stack>

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
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ backgroundColor: colors.primary, '&:hover': { backgroundColor: colors.primary } }}
          >
            Create folder
          </Button>
        </Paper>
      ) : (
        // inside DossiersPage return:
      <Grid container spacing={2} justifyContent="flex-start" alignItems="stretch">
        {dossiers.map((d) => (
          <Grid item key={d.uniqueID || d.id} xs={12} sm={6} md={4} lg={3}>
            <FolderCard dossier={d} />
          </Grid>
        ))}
      </Grid>
      )}

      <CreateDossierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          setToast({ open: true, msg: 'Folder created successfully', severity: 'success' });
          load();
        }}
      />

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