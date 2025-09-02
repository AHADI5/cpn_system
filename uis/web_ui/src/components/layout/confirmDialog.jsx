// src/components/ConfirmDialog.jsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function ConfirmDialog({ open, title, content, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title || 'Confirmer'}</DialogTitle>
      <DialogContent>
        <Typography>{content || 'Êtes-vous sûr ?'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Annuler</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Supprimer</Button>
      </DialogActions>
    </Dialog>
  );
}