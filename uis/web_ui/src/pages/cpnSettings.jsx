// src/pages/CpnSettings.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../apis/doctor';
import AntecedentDefinitionDialog from './AntecedentDefinitionDialog';
import ConfirmDialog from '../components/layout/confirmDialog';

const TYPE_OPTIONS = ['OBSTETRICS', 'GYNECO', 'GENERAL']; // adapte selon ton domaine

export default function CpnSettings() {
  const [loading, setLoading] = useState(true);
  const [defs, setDefs] = useState([]);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listAntecedentDefinitions();
      setDefs(Array.isArray(data) ? data : []);
    } catch {
      setDefs([]);
      setToast({ open: true, message: "Impossible de charger les rubriques", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return defs
      .filter((d) => (typeFilter ? d.antecedentType === typeFilter : true))
      .filter((d) => {
        const s = `${d.code} ${d.name} ${d.description}`.toLowerCase();
        return s.includes(q.trim().toLowerCase());
      });
  }, [defs, q, typeFilter]);

  const onCreateClick = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const onEditClick = (item) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const onDeleteClick = (item) => {
    setToDelete(item);
    setConfirmOpen(true);
  };

  const handleSaved = async () => {
    setDialogOpen(false);
    setEditing(null);
    await load();
    setToast({ open: true, message: "Rubrique enregistrée", severity: 'success' });
  };

  const handleDelete = async () => {
    try {
      await api.deleteAntecedentDefinition(toDelete?.id ?? toDelete?.code);
      setToast({ open: true, message: "Rubrique supprimée", severity: 'success' });
      await load();
    } catch {
      setToast({ open: true, message: "Échec de la suppression", severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Paramètres CPN • Rubriques et champs
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick}>
          Nouvelle rubrique
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Rechercher (code, nom, description)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Stack spacing={1}>
            <Skeleton height={36} />
            <Skeleton height={36} />
            <Skeleton height={36} />
          </Stack>
        ) : filtered.length === 0 ? (
          <Typography color="text.secondary">Aucune rubrique.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Champs</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id || d.code} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{d.code}</Typography>
                  </TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>
                    <Chip label={d.antecedentType || '—'} size="small" />
                  </TableCell>
                  <TableCell>{Array.isArray(d.fields) ? d.fields.length : 0}</TableCell>
                  <TableCell sx={{ maxWidth: 380, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {d.description || '—'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => onEditClick(d)} size="small" title="Éditer">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => onDeleteClick(d)} size="small" title="Supprimer" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <AntecedentDefinitionDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSaved={handleSaved}
        initialData={editing}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmer la suppression"
        content={`Supprimer la rubrique "${toDelete?.name || toDelete?.code}" ?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}