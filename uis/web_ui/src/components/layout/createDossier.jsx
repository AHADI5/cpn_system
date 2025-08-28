// src/components/CreateDossierDialog.jsx
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, Stack, Alert
} from '@mui/material';
import colors from '../../utils/colors'; // adjust path if needed
import { createPatient } from '../../api'; // adjust path if your api file is elsewhere

export default function CreateDossierDialog({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'F',
    birthDate: '',       // YYYY-MM-DD
    address: '',
    maritalStatus: '',
    nationality: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const reset = () =>
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: 'F',
      birthDate: '',
      address: '',
      maritalStatus: '',
      nationality: '',
    });

  const handleSubmit = async () => {
    setError('');
    try {
      setLoading(true);
      // Send exactly what your backend expects
      await createPatient({ ...form });
      onCreated?.(); // e.g., refresh list
      onClose?.();
      reset();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to create patient/dossier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create folder (dossier)</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="firstName" label="First name" value={form.firstName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="lastName" label="Last name" value={form.lastName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phoneNumber" label="Phone number" value={form.phoneNumber} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select name="gender" label="Gender" value={form.gender} onChange={handleChange} fullWidth>
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="O">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="birthDate"
                label="Birth date"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={form.address}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select name="maritalStatus" label="Marital status" value={form.maritalStatus} onChange={handleChange} fullWidth>
                <MenuItem value="">Unknown</MenuItem>
                <MenuItem value="SINGLE">Single</MenuItem>
                <MenuItem value="MARRIED">Married</MenuItem>
                <MenuItem value="DIVORCED">Divorced</MenuItem>
                <MenuItem value="WIDOWED">Widowed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="nationality" label="Nationality" value={form.nationality} onChange={handleChange} fullWidth />
            </Grid>
          </Grid>
          <Stack spacing={0.5} sx={{ color: 'text.secondary', fontSize: 12 }}>
            <span>- Creating a patient will automatically create a dossier.</span>
            <span>- You can edit details later.</span>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: colors.primary, '&:hover': { backgroundColor: colors.primary } }}
        >
          {loading ? 'Saving…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}