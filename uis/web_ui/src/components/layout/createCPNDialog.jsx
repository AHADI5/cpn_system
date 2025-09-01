// src/components/CreateCpnDialog.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Divider,
  TextField,
  Paper,
  Skeleton,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { api } from '../../apis/doctor';

const FALLBACK_OBSTETRIC_BLOCKS = [
  {
    id: 2,
    code: 'PREV_PREGNENCIES',
    name: 'PREVIOUS PREGNENCIES',
    description: 'OBSTETRICS ANTECEDANT',
    antecedentType: 'OBSTETRICS ANTECEDANT',
    active: true,
    fields: [
      {
        id: 1,
        code: 'Enfant-nouveau-né',
        label: 'Nombre',
        type: 'number',
        required: true,
        displayOrder: null,
        constraints: {},
        ui: {},
      },
    ],
  },
];

function addDays(date, days) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d;
}

export default function CreateCpnDialog({ open, onClose, dossierId, onCreated }) {
  const [lmpDate, setLmpDate] = useState(''); // last amenorrhea date
  const [anteBlocks, setAnteBlocks] = useState([]);
  const [anteValues, setAnteValues] = useState({});
  const [anteLoading, setAnteLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const estimatedDueDate = useMemo(() => {
    if (!lmpDate) return null;
    const edd = addDays(lmpDate, 280); // 40 weeks
    return edd && !Number.isNaN(edd.getTime()) ? edd : null;
  }, [lmpDate]);

  const setFieldValue = (blockCode, fieldCode, value) => {
    setAnteValues((prev) => ({
      ...prev,
      [blockCode]: { ...(prev[blockCode] || {}), [fieldCode]: value },
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!lmpDate) errors.lmpDate = 'La date est requise';

    anteBlocks.forEach((b) => {
      (b.fields || []).forEach((f) => {
        if (f.required) {
          const val = anteValues[b.code]?.[f.code];
          if (val === '' || val === undefined || val === null) {
            errors[`${b.code}.${f.code}`] = 'Champ requis';
          }
        }
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadObstetricAntecedents = async () => {
    setAnteLoading(true);
    try {
      let data;
      if (typeof api.fetchAntecedentBlocks === 'function') {
        data = await api.fetchAntecedentBlocks({ dossierId, antecedentType: 'OBSTETRICS ANTECEDANT' });
      } else if (typeof api.fetchAntecedents === 'function') {
        data = await api.fetchAntecedents({ dossierId, antecedentType: 'OBSTETRICS ANTECEDANT' });
      } else {
        data = FALLBACK_OBSTETRIC_BLOCKS;
      }
      const blocks = Array.isArray(data) ? data : [];
      setAnteBlocks(blocks);

      // Initialize values structure
      const initial = {};
      blocks.forEach((b) => {
        initial[b.code] = {};
        (b.fields || []).forEach((f) => {
          initial[b.code][f.code] = '';
        });
      });
      setAnteValues(initial);
    } catch {
      setAnteBlocks(FALLBACK_OBSTETRIC_BLOCKS);
      const initial = {};
      FALLBACK_OBSTETRIC_BLOCKS.forEach((b) => {
        initial[b.code] = {};
        (b.fields || []).forEach((f) => {
          initial[b.code][f.code] = '';
        });
      });
      setAnteValues(initial);
    } finally {
      setAnteLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    // Reset form state when opening
    setLmpDate('');
    setFormErrors({});
    setCreateError('');
    setAnteBlocks([]);
    setAnteValues({});
    loadObstetricAntecedents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dossierId]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setCreateLoading(true);
    setCreateError('');
    try {
      const payload = {
        dossierId,
        lastAmenorrheaDate: lmpDate,
        antecedents: anteBlocks.map((b) => ({
          id: b.id,
          code: b.code,
          values: (b.fields || []).map((f) => ({
            fieldId: f.id,
            code: f.code,
            value: anteValues[b.code]?.[f.code] ?? null,
          })),
        })),
      };

      let created;
      if (typeof api.createCpnFiche === 'function') {
        created = await api.createCpnFiche(payload);
      } else if (typeof api.createCpn === 'function') {
        created = await api.createCpn(payload);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        created = { id: Date.now(), status: 'NOUVELLE', date: new Date().toISOString() };
      }

      onCreated?.(created);
    } catch {
      setCreateError("Échec de la création de la fiche. Veuillez réessayer.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={createLoading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Créer une fiche CPN</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Date de dernière aménorrhée"
            type="date"
            value={lmpDate}
            onChange={(e) => setLmpDate(e.target.value)}
            required
            error={Boolean(formErrors.lmpDate)}
            helperText={formErrors.lmpDate}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          {estimatedDueDate ? (
            <Typography variant="caption" color="text.secondary">
              Date d’accouchement estimée: {estimatedDueDate.toLocaleDateString()}
            </Typography>
          ) : null}

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Antécédents obstétricaux
          </Typography>

          {anteLoading ? (
            <Stack spacing={1}>
              <Skeleton height={28} />
              <Skeleton height={28} />
              <Skeleton height={28} />
            </Stack>
          ) : anteBlocks.length === 0 ? (
            <Alert severity="info">Aucun bloc d’antécédents à afficher.</Alert>
          ) : (
            anteBlocks.map((block) => (
              <Paper key={block.code || block.id} variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>{block.name || block.code}</Typography>
                {block.description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {block.description}
                  </Typography>
                ) : null}

                <Stack spacing={1.5}>
                  {(block.fields || []).map((field) => {
                    const fieldKey = `${block.code}.${field.code}`;
                    const value = anteValues[block.code]?.[field.code] ?? '';
                    const error = Boolean(formErrors[fieldKey]);

                    const typeMap = { number: 'number', text: 'text', date: 'date' };
                    const inputType = typeMap[field.type] || 'text';

                    return (
                      <TextField
                        key={field.code || field.id}
                        type={inputType}
                        label={field.label || field.code}
                        value={value}
                        onChange={(e) => setFieldValue(block.code, field.code, e.target.value)}
                        required={field.required}
                        error={error}
                        helperText={error ? formErrors[fieldKey] : ''}
                        InputLabelProps={{ shrink: inputType === 'date' ? true : undefined }}
                        inputProps={inputType === 'number' ? { min: 0, step: 1 } : undefined}
                        fullWidth
                      />
                    );
                  })}
                </Stack>
              </Paper>
            ))
          )}
          {createError ? <Alert severity="error">{createError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createLoading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createLoading}
          startIcon={createLoading ? <CircularProgress color="inherit" size={18} /> : null}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}