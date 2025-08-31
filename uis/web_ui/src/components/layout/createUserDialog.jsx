// src/components/users/CreateUserDialog.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Alert, Autocomplete, Chip, CircularProgress,
} from '@mui/material';
import * as adminApi from '../../apis/adminApi/admin';
import colors from '../../utils/colors';

export default function CreateUserDialog({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);

  const [form, setForm] = useState({
    userName: '',
    passWord: '',
    roles: [], // array of selected role objects
  });

  useEffect(() => {
    if (!open) return;
    setError('');
    setRolesLoading(true);
    adminApi
      .fetchAllRoles()
      .then(setRoles)
      .catch((e) => setError(e.message || 'Failed to load roles'))
      .finally(() => setRolesLoading(false));
  }, [open]);

  const selectedIds = useMemo(
    () =>
      (form.roles || [])
        .map((r) => r.roleID ?? r.id ?? r.roleId ?? r.userRoleID ?? null)
        .filter((v) => Number.isFinite(Number(v)))
        .map((v) => Number(v)),
    [form.roles]
  );
  console.log("Selected Ids" ,selectedIds)

  const missingIds = form.roles.length > 0 && selectedIds.length !== form.roles.length;

  const handleSubmit = async () => {
    setError('');
    if (!form.userName || !form.passWord) {
      setError('Username and password are required');
      return;
    }
    if (form.roles.length === 0) {
      setError('Please select at least one role');
      return;
    }
    if (missingIds) {
      setError('Your roles endpoint does not return role IDs. Please expose role IDs to proceed.');
      return;
    }

    try {
      setLoading(true);
      await adminApi.createUser({
        userName: form.userName,
        passWord: form.passWord,
        userRoleIds: selectedIds, // backend expects integers
      });
      console.log("user Role Ids", selectedIds)
      onCreated?.();
      onClose?.();
      setForm({ userName: '', passWord: '', roles: [] });
    } catch (e) {
      setError(e.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create user</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Username (login/email)"
            value={form.userName}
            onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Password"
            type="password"
            value={form.passWord}
            onChange={(e) => setForm((f) => ({ ...f, passWord: e.target.value }))}
            fullWidth
            required
          />

          <Autocomplete
            multiple
            options={roles}
            loading={rolesLoading}
            value={form.roles}
            onChange={(_, value) => setForm((f) => ({ ...f, roles: value }))}
            getOptionLabel={(opt) => opt.roleName || ''}
            isOptionEqualToValue={(a, b) => {
              const aid = a.roleID ?? a.id ?? a._fallbackKey;
              const bid = b.roleID ?? b.id ?? b._fallbackKey;
              return String(aid) === String(bid);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Roles"
                placeholder="Select roles"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {rolesLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.roleID ?? option._fallbackKey} label={option.roleName} />
              ))
            }
          />

          {missingIds ? (
            <Alert severity="warning">
              Roles loaded without IDs. Please update the roles endpoint to include roleID.
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ backgroundColor: colors?.primary, '&:hover': { backgroundColor: colors?.primary } }}
        >
          {loading ? 'Saving…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}