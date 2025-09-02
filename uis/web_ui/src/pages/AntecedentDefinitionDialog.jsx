// src/components/AntecedentDefinitionDialog.jsx
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Divider,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  IconButton,
  Grid,
  MenuItem,
  Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../apis/doctor';

const FIELD_TYPES = ['BOOLEAN', 'INTEGER', 'DECIMAL', 'TEXT', 'DATE', 'ENUM', 'MULTI_ENUM'];

const DEFAULT_TYPE = 'OBSTETRICS'; // par défaut pour CPN

function move(arr, from, to) {
  const copy = arr.slice();
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
}

function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export default function AntecedentDefinitionDialog({ open, onClose, initialData, onSaved }) {
  const isEdit = Boolean(initialData?.id || initialData?.code);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [antecedentType, setAntecedentType] = useState(DEFAULT_TYPE);
  const [fields, setFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!open) return;
    setApiError('');
    setErrors({});

    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setAntecedentType(initialData.antecedentType || DEFAULT_TYPE);
      setFields(
        (initialData.fields || []).map((f, idx) => ({
          code: f.code || '',
          label: f.label || '',
          type: f.type || 'TEXT',
          required: Boolean(f.required),
          displayOrder: f.displayOrder ?? idx + 1,
          constraints: f.constraints || {},
          ui: f.ui || {},
          _uiText: JSON.stringify(f.ui || {}, null, 2),
        }))
      );
    } else {
      setCode('');
      setName('');
      setDescription('');
      setAntecedentType(DEFAULT_TYPE);
      setFields([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        code: '',
        label: '',
        type: 'TEXT',
        required: false,
        displayOrder: prev.length + 1,
        constraints: {},
        ui: {},
        _uiText: '{}',
      },
    ]);
  };

  const updateField = (index, patch) => {
    setFields((prev) => {
      const next = prev.slice();
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, displayOrder: i + 1 })));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setFields((prev) => move(prev, index, index - 1).map((f, i) => ({ ...f, displayOrder: i + 1 })));
  };
  const moveDown = (index) => {
    if (index === fields.length - 1) return;
    setFields((prev) => move(prev, index, index + 1).map((f, i) => ({ ...f, displayOrder: i + 1 })));
  };

  const validate = () => {
    const err = {};
    if (!code?.trim()) err.code = 'Code requis';
    if (!name?.trim()) err.name = 'Nom requis';

    // codes uniques
    const codes = fields.map((f) => (f.code || '').trim());
    const dup = codes.find((c, i) => c && codes.indexOf(c) !== i);
    if (dup) err.fields = `Code de champ dupliqué: "${dup}"`;

    fields.forEach((f, i) => {
      if (!f.code?.trim()) err[`field.${i}.code`] = 'Code requis';
      if (!f.label?.trim()) err[`field.${i}.label`] = 'Libellé requis';
      if (!f.type) err[`field.${i}.type`] = 'Type requis';

      // contraintes minimales
      if ((f.type === 'ENUM' || f.type === 'MULTI_ENUM')) {
        const opts = f.constraints?.options;
        if (!Array.isArray(opts) || opts.length === 0) {
          err[`field.${i}.options`] = 'Options requises pour ENUM/MULTI_ENUM';
        }
      }
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');

    const payload = {
      code: code.trim(),
      name: name.trim(),
      description: description || '',
      antecedentType: antecedentType || DEFAULT_TYPE,
      fields: fields.map((f, i) => ({
        code: f.code.trim(),
        label: f.label.trim(),
        type: f.type,
        required: Boolean(f.required),
        displayOrder: f.displayOrder ?? i + 1,
        constraints: f.constraints || {},
        ui: safeJsonParse(f._uiText, f.ui || {}),
      })),
    };

    try {
      if (isEdit) {
        await api.updateAntecedentDefinition(initialData.id ?? initialData.code, payload);
      } else {
        await api.createAntecedentDefinition(payload);
      }
      onSaved?.();
    } catch {
      setApiError("Échec de l'enregistrement. Vérifiez l'API ou les données.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldHelper = (f, i) => {
    // Rendu des contraintes selon type
    switch (f.type) {
      case 'INTEGER':
      case 'DECIMAL':
        return (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Min"
              type="number"
              value={f.constraints?.min ?? ''}
              onChange={(e) =>
                updateField(i, { constraints: { ...f.constraints, min: e.target.value === '' ? undefined : Number(e.target.value) } })
              }
            />
            <TextField
              label="Max"
              type="number"
              value={f.constraints?.max ?? ''}
              onChange={(e) =>
                updateField(i, { constraints: { ...f.constraints, max: e.target.value === '' ? undefined : Number(e.target.value) } })
              }
            />
            {f.type === 'DECIMAL' && (
              <TextField
                label="Step"
                type="number"
                value={f.constraints?.step ?? ''}
                onChange={(e) =>
                  updateField(i, { constraints: { ...f.constraints, step: e.target.value === '' ? undefined : Number(e.target.value) } })
                }
              />
            )}
          </Stack>
        );
      case 'TEXT':
        return (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Longueur max"
              type="number"
              value={f.constraints?.maxLength ?? ''}
              onChange={(e) =>
                updateField(i, { constraints: { ...f.constraints, maxLength: e.target.value === '' ? undefined : Number(e.target.value) } })
              }
            />
            <TextField
              label="Pattern (regex)"
              value={f.constraints?.pattern ?? ''}
              onChange={(e) => updateField(i, { constraints: { ...f.constraints, pattern: e.target.value || undefined } })}
            />
          </Stack>
        );
      case 'DATE':
        return (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Min date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={f.constraints?.min ?? ''}
              onChange={(e) => updateField(i, { constraints: { ...f.constraints, min: e.target.value || undefined } })}
            />
            <TextField
              label="Max date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={f.constraints?.max ?? ''}
              onChange={(e) => updateField(i, { constraints: { ...f.constraints, max: e.target.value || undefined } })}
            />
          </Stack>
        );
      case 'ENUM':
      case 'MULTI_ENUM': {
        const opts = Array.isArray(f.constraints?.options) ? f.constraints.options : [];
        const addOption = () => updateField(i, { constraints: { ...f.constraints, options: [...opts, ''] } });
        const updateOption = (idx, val) => {
          const next = opts.slice();
          next[idx] = val;
          updateField(i, { constraints: { ...f.constraints, options: next } });
        };
        const removeOption = (idx) => {
          const next = opts.filter((_, k) => k !== idx);
          updateField(i, { constraints: { ...f.constraints, options: next } });
        };
        return (
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Options</Typography>
              <Button size="small" onClick={addOption} startIcon={<AddIcon />}>Ajouter</Button>
            </Stack>
            {opts.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Ajoute au moins une option.
              </Typography>
            )}
            {opts.map((opt, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={`Option #${idx + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  error={Boolean(errors[`field.${i}.options`]) && !opt}
                  helperText={Boolean(errors[`field.${i}.options`]) && !opt ? 'Requise' : ''}
                  sx={{ flex: 1 }}
                />
                <IconButton color="error" onClick={() => removeOption(idx)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        );
      }
      default:
        return null;
    }
  };

  const fieldCard = (f, i) => (
    <Paper key={`f-${i}`} variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            label="Code"
            value={f.code}
            onChange={(e) => updateField(i, { code: e.target.value })}
            error={Boolean(errors[`field.${i}.code`])}
            helperText={errors[`field.${i}.code`] || 'Ex: NB_ENFANTS'}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Libellé"
            value={f.label}
            onChange={(e) => updateField(i, { label: e.target.value })}
            error={Boolean(errors[`field.${i}.label`])}
            helperText={errors[`field.${i}.label`] || ''}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Type"
            value={f.type}
            onChange={(e) => updateField(i, { type: e.target.value })}
            error={Boolean(errors[`field.${i}.type`])}
            helperText={errors[`field.${i}.type`] || ''}
            fullWidth
          >
            {FIELD_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(f.required)}
                onChange={(e) => updateField(i, { required: e.target.checked })}
              />
            }
            label="Requis"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Ordre d'affichage"
            type="number"
            value={f.displayOrder ?? i + 1}
            onChange={(e) => updateField(i, { displayOrder: Number(e.target.value) })}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Tooltip title="Monter"><span>
            <IconButton onClick={() => moveUp(i)} disabled={i === 0}><ArrowUpwardIcon /></IconButton>
          </span></Tooltip>
          <Tooltip title="Descendre"><span>
            <IconButton onClick={() => moveDown(i)} disabled={i === fields.length - 1}><ArrowDownwardIcon /></IconButton>
          </span></Tooltip>
          <Tooltip title="Supprimer">
            <IconButton color="error" onClick={() => removeField(i)}><DeleteIcon /></IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Contraintes</Typography>
          {fieldHelper(f, i)}
          {errors[`field.${i}.options`] && (
            <Alert severity="warning" sx={{ mt: 1 }}>{errors[`field.${i}.options`]}</Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>UI (JSON)</Typography>
          <TextField
            multiline
            minRows={3}
            value={f._uiText ?? JSON.stringify(f.ui || {}, null, 2)}
            onChange={(e) => updateField(i, { _uiText: e.target.value })}
            fullWidth
            helperText="Ex: { 'visibleIf': { 'field': 'X', 'equals': true } }"
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Éditer la rubrique' : 'Nouvelle rubrique'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {apiError ? <Alert severity="error">{apiError}</Alert> : null}

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={Boolean(errors.code)}
                helperText={errors.code || 'Ex: PREV_PREGNANCIES'}
                fullWidth
                disabled={isEdit} // code immuable en édition
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name || 'Ex: Grossesses précédentes'}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Type d’antécédent"
                value={antecedentType}
                onChange={(e) => setAntecedentType(e.target.value)}
                fullWidth
              >
                <MenuItem value="OBSTETRICS">OBSTETRICS</MenuItem>
                <MenuItem value="GYNECO">GYNECO</MenuItem>
                <MenuItem value="GENERAL">GENERAL</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>

          <Divider />

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Champs</Typography>
            <Button onClick={addField} startIcon={<AddIcon />}>Ajouter un champ</Button>
          </Stack>

          {errors.fields ? <Alert severity="warning">{errors.fields}</Alert> : null}

          <Stack spacing={1.5}>
            {fields.length === 0 ? (
              <Typography color="text.secondary">Aucun champ. Ajoute-en au moins un.</Typography>
            ) : (
              fields.map((f, i) => fieldCard(f, i))
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Annuler</Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}