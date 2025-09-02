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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { api } from '../../apis/doctor';

function addDays(date, days) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d;
}

function toUpperType(t) {
  return String(t || '').toUpperCase();
}
function castValueByType(val, type) {
  const T = toUpperType(type);
  if (val === '' || val === undefined || val === null) return undefined;
  switch (T) {
    case 'BOOLEAN': return Boolean(val);
    case 'INTEGER': {
      const n = Number(val);
      return Number.isFinite(n) ? Math.trunc(n) : undefined;
    }
    case 'DECIMAL': {
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    }
    case 'DATE': return String(val); // yyyy-mm-dd
    case 'ENUM': return String(val);
    case 'MULTI_ENUM': return Array.isArray(val) ? val : [val].filter(Boolean);
    case 'TEXT':
    default: return String(val);
  }
}
function isMissingRequired(val, type) {
  const T = toUpperType(type);
  if (T === 'BOOLEAN') return val === undefined || val === null; // false is valid
  if (T === 'MULTI_ENUM') return !Array.isArray(val) || val.length === 0;
  return val === '' || val === undefined || val === null;
}
function sortByDisplayOrder(fields = []) {
  return [...fields].sort((a, b) => {
    const ao = a.displayOrder ?? 0;
    const bo = b.displayOrder ?? 0;
    if (ao === bo) return 0;
    return ao < bo ? -1 : 1;
  });
}

export default function CreateCpnDialog({
  open,
  onClose,
  dossierId,   // optional (legacy)
  patientID,   // REQUIRED for real endpoint
  patient,     // optional: for display
  onCreated,
}) {
  const [lmpDate, setLmpDate] = useState(''); // yyyy-mm-dd
  const [blocks, setBlocks] = useState([]);
  const [values, setValues] = useState({}); // { [antecedentId]: { [fieldCode]: any } }
  const [loadingDefs, setLoadingDefs] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const estimatedDueDate = useMemo(() => {
    if (!lmpDate) return null;
    const edd = addDays(lmpDate, 280);
    return edd && !Number.isNaN(edd.getTime()) ? edd : null;
  }, [lmpDate]);

  const setFieldValue = (antecedentId, fieldCode, value) => {
    setValues((prev) => ({
      ...prev,
      [antecedentId]: { ...(prev[antecedentId] || {}), [fieldCode]: value },
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!patientID) errors.patientID = 'Patient requis';
    if (!lmpDate) errors.lmpDate = 'La date est requise';

    blocks.forEach((b) => {
      const fieldVals = values[b.id] || {};
      sortByDisplayOrder(b.fields || []).forEach((f) => {
        if (f.required) {
          const val = fieldVals[f.code];
          if (isMissingRequired(val, f.type)) {
            errors[`${b.id}.${f.code}`] = 'Champ requis';
          }
        }
        if ((f.type === 'INTEGER' || f.type === 'DECIMAL') && fieldVals[f.code] !== undefined && fieldVals[f.code] !== '') {
          const n = Number(fieldVals[f.code]);
          if (Number.isFinite(n)) {
            const { min, max } = f.constraints || {};
            if (min !== undefined && n < min) errors[`${b.id}.${f.code}`] = `Min ${min}`;
            if (max !== undefined && n > max) errors[`${b.id}.${f.code}`] = `Max ${max}`;
          }
        }
        if (f.type === 'TEXT' && typeof fieldVals[f.code] === 'string' && f.constraints?.maxLength) {
          if (fieldVals[f.code].length > f.constraints.maxLength) {
            errors[`${b.id}.${f.code}`] = `Max ${f.constraints.maxLength} caractères`;
          }
        }
        if (f.type === 'DATE' && fieldVals[f.code]) {
          const { min, max } = f.constraints || {};
          if (min && fieldVals[f.code] < min) errors[`${b.id}.${f.code}`] = `Date min ${min}`;
          if (max && fieldVals[f.code] > max) errors[`${b.id}.${f.code}`] = `Date max ${max}`;
        }
        if ((f.type === 'ENUM' || f.type === 'MULTI_ENUM') && f.required) {
          const opts = f.constraints?.options;
          if (!Array.isArray(opts) || opts.length === 0) {
            errors[`${b.id}.${f.code}`] = 'Options manquantes';
          }
        }
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadDefinitions = async () => {
    setLoadingDefs(true);
    try {
      let defs = [];
      if (typeof api.listAntecedentDefinitions === 'function') {
        defs = await api.listAntecedentDefinitions();
      } else if (typeof api.fetchAntecedentBlocks === 'function') {
        defs = await api.fetchAntecedentBlocks({ antecedentType: 'OBSTETRICS' });
      } else if (typeof api.fetchAntecedents === 'function') {
        defs = await api.fetchAntecedents({ antecedentType: 'OBSTETRICS' });
      }
      const items = Array.isArray(defs) ? defs : [];
      setBlocks(items);

      // Initialize values
      const initial = {};
      items.forEach((b) => {
        initial[b.id] = {};
        sortByDisplayOrder(b.fields || []).forEach((f) => {
          initial[b.id][f.code] = toUpperType(f.type) === 'MULTI_ENUM' ? [] : '';
        });
      });
      setValues(initial);
    } catch (e) {
      setBlocks([]);
    } finally {
      setLoadingDefs(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setLmpDate('');
    setFormErrors({});
    setCreateError('');
    setBlocks([]);
    setValues({});
    loadDefinitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patientID]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setCreateLoading(true);
    setCreateError('');

    try {
      const antecedentRequest = blocks.map((b) => {
        const v = values[b.id] || {};
        const typed = {};
        sortByDisplayOrder(b.fields || []).forEach((f) => {
          const raw = v[f.code];
          const val = castValueByType(raw, f.type);
          if (val !== undefined && !(Array.isArray(val) && val.length === 0)) {
            typed[f.code] = val;
          }
        });
        return { antecedentId: b.id, values: typed };
      });

      const payload = {
        patientID: Number(patientID),
        lastDYSmeNoRRheaDate: lmpDate,
        antecedentRequest,
      };

      let created;
      if (typeof api.submitPatientAntecedents === 'function') {
        created = await api.submitPatientAntecedents(patientID, payload);
      } else if (typeof api.createCpnFiche === 'function') {
        // Dev fallback
        created = await api.createCpnFiche({
          dossierId,
          lastAmenorrheaDate: lmpDate,
          antecedents: blocks.map((b) => ({
            id: b.id,
            code: b.code,
            values: sortByDisplayOrder(b.fields || []).map((f) => ({
              fieldId: f.id,
              code: f.code,
              value: values[b.id]?.[f.code] ?? null,
            })),
          })),
        });
      } else {
        await new Promise((r) => setTimeout(r, 600));
        created = { id: Date.now(), status: 'NOUVELLE', date: new Date().toISOString() };
      }

      onCreated?.(created);
    } catch (e) {
      setCreateError("Échec de l'enregistrement. Vérifiez les champs requis et l'API.");
    } finally {
      setCreateLoading(false);
    }
  };

  const renderField = (block, field) => {
    const bId = block.id;
    const T = toUpperType(field.type);
    const fieldKey = `${bId}.${field.code}`;
    const v = values[bId]?.[field.code];
    const err = Boolean(formErrors[fieldKey]);
    const helper = err ? formErrors[fieldKey] : '';

    const c = field.constraints || {};
    const options = Array.isArray(c.options) ? c.options : [];

    switch (T) {
      case 'BOOLEAN':
        return (
          <FormControlLabel
            key={field.code || field.id}
            control={<Switch checked={Boolean(v)} onChange={(e) => setFieldValue(bId, field.code, e.target.checked)} />}
            label={field.label || field.code}
          />
        );

      case 'INTEGER':
      case 'DECIMAL': {
        const step = T === 'DECIMAL' ? (c.step ?? 0.1) : 1;
        return (
          <TextField
            key={field.code || field.id}
            type="number"
            label={field.label || field.code}
            value={v ?? ''}
            onChange={(e) => setFieldValue(bId, field.code, e.target.value === '' ? '' : e.target.value)}
            required={field.required}
            error={err}
            helperText={helper}
            inputProps={{ step, ...(c.min !== undefined ? { min: c.min } : {}), ...(c.max !== undefined ? { max: c.max } : {}) }}
            fullWidth
          />
        );
      }

      case 'DATE':
        return (
          <TextField
            key={field.code || field.id}
            type="date"
            label={field.label || field.code}
            value={v ?? ''}
            onChange={(e) => setFieldValue(bId, field.code, e.target.value)}
            required={field.required}
            error={err}
            helperText={helper}
            InputLabelProps={{ shrink: true }}
            inputProps={{ ...(c.min ? { min: c.min } : {}), ...(c.max ? { max: c.max } : {}) }}
            fullWidth
          />
        );

      case 'ENUM':
        return (
          <FormControl key={field.code || field.id} fullWidth error={err} required={field.required}>
            <InputLabel>{field.label || field.code}</InputLabel>
            <Select label={field.label || field.code} value={v ?? ''} onChange={(e) => setFieldValue(bId, field.code, e.target.value)}>
              {options.map((opt) => (
                <MenuItem key={String(opt)} value={String(opt)}>{String(opt)}</MenuItem>
              ))}
            </Select>
            {helper ? <Typography variant="caption" color="error">{helper}</Typography> : null}
          </FormControl>
        );

      case 'MULTI_ENUM':
        return (
          <FormControl key={field.code || field.id} fullWidth error={err} required={field.required}>
            <InputLabel>{field.label || field.code}</InputLabel>
            <Select
              multiple
              value={Array.isArray(v) ? v : []}
              onChange={(e) => setFieldValue(
                bId,
                field.code,
                typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
              )}
              input={<OutlinedInput label={field.label || field.code} />}
              renderValue={(selected) => (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                  {(selected || []).map((val) => <Chip key={val} label={val} size="small" />)}
                </Stack>
              )}
            >
              {options.map((opt) => (
                <MenuItem key={String(opt)} value={String(opt)}>{String(opt)}</MenuItem>
              ))}
            </Select>
            {helper ? <Typography variant="caption" color="error">{helper}</Typography> : null}
          </FormControl>
        );

      case 'TEXT':
      default:
        return (
          <TextField
            key={field.code || field.id}
            label={field.label || field.code}
            value={v ?? ''}
            onChange={(e) => setFieldValue(bId, field.code, e.target.value)}
            required={field.required}
            error={err}
            helperText={helper}
            inputProps={{ ...(c.maxLength ? { maxLength: c.maxLength } : {}) }}
            fullWidth
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={createLoading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Créer une fiche CPN</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {!patient.patientId ? <Alert severity="warning">Patient non défini. Veuillez passer patientID au dialogue. </Alert> : null}

          {patient ? (
            <Typography variant="body2" color="text.secondary">
              Patient: {[patient.firstName, patient.lastName].filter(Boolean).join(' ')}
            </Typography>
          ) : null}

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
            Antécédents (rubriques)
          </Typography>

          {loadingDefs ? (
            <Stack spacing={1}>
              <Skeleton height={28} /><Skeleton height={28} /><Skeleton height={28} />
            </Stack>
          ) : blocks.length === 0 ? (
            <Alert severity="info">Aucune rubrique à afficher.</Alert>
          ) : (
            blocks.map((block) => (
              <Paper key={block.id || block.code} variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>{block.name || block.code}</Typography>
                {block.description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {block.description}
                  </Typography>
                ) : null}

                <Stack spacing={1.5}>
                  {sortByDisplayOrder(block.fields || []).map((field) => renderField(block, field))}
                </Stack>
              </Paper>
            ))
          )}

          {createError ? <Alert severity="error">{createError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createLoading}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createLoading || !patientID}
          startIcon={createLoading ? <CircularProgress color="inherit" size={18} /> : null}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}