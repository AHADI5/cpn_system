// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#00a19a' }, // teal-ish "Create" vibe (Odoo-like)
    secondary: { main: '#7b4f9e' }, // accent (Odoo purple-ish)
    background: { default: '#f7f7fb' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none', borderBottom: '1px solid #eee' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: '1px solid #eee' } } },
  },
});

export default theme;