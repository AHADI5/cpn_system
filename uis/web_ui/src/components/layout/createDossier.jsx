// src/components/CreateDossierDialog.jsx
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Stack, Alert
} from '@mui/material';
import colors from '../../utils/colors';
import { createPatient } from '../../api';

export default function CreateDossierDialog({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'F',         // hardcoded to Female
    birthDate: '',       // YYYY-MM-DD
    address: '',
    nationality: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // gender stays 'F' regardless of any changes
    if (name === 'gender') return;
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
      nationality: '',
    });

  const handleSubmit = async () => {
    setError('');
    try {
      setLoading(true);
      // Ensure gender is always 'F'
      const payload = { ...form, gender: 'F' };
      await createPatient(payload);
      onCreated?.();
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
            {/* Row 1: Names */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First name"
                value={form.firstName}
                onChange={handleChange}
                fullWidth
                required
                autoFocus
                autoComplete="given-name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last name"
                value={form.lastName}
                onChange={handleChange}
                fullWidth
                required
                autoComplete="family-name"
              />
            </Grid>

            {/* Row 2: Gender (fixed Female) | Birth date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Gender"
                value="Female"
                fullWidth
                InputProps={{ readOnly: true }}
                helperText="Fixed to Female"
              />
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
                autoComplete="bday"
              />
            </Grid>

            {/* Row 3: Email | Phone number */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phoneNumber"
                label="Phone number"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                fullWidth
                autoComplete="tel"
              />
            </Grid>

            {/* Row 4: Address | Nationality */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Address"
                value={form.address}
                onChange={handleChange}
                fullWidth
                autoComplete="street-address"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nationality"
                label="Nationality"
                value={form.nationality}
                onChange={handleChange}
                fullWidth
                autoComplete="country-name"
              />
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