// src/components/TopBar.jsx
import { AppBar, Toolbar, IconButton, Typography, Box, InputBase, Avatar, alpha } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export default function TopBar({ onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={(t) => ({
        zIndex: t.zIndex.drawer + 1, // keep AppBar on top of Drawer
      })}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
          <MenuRoundedIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          CPN Desk
        </Typography>

        <Box
          sx={(t) => ({
            ml: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            maxWidth: 520,
            bgcolor: alpha(t.palette.primary.main, 0.06),
            border: '1px solid',
            borderColor: 'divider',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
          })}
        >
          <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase placeholder="Search dossiers/patients…" sx={{ flex: 1 }} />
        </Box>

        <Avatar sx={{ bgcolor: 'primary.main', color: '#fff' }}>RC</Avatar>
      </Toolbar>
    </AppBar>
  );
}