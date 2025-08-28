// src/components/Sidebar.jsx
import { Drawer, Toolbar, Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import GroupsIcon from '@mui/icons-material/Groups';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useNavigate, useLocation } from 'react-router-dom';

const items = [
  { text: 'Dossiers', icon: <FolderOpenIcon />, to: '/dossiers' },
  { text: 'Patients', icon: <GroupsIcon />, to: '/patients', disabled: true },
  { text: 'Appointments', icon: <EventNoteIcon />, to: '/appointments', disabled: true },
];

export default function Sidebar({ variant, open, onClose, drawerWidth, sx }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
        ...sx,
      }}
    >
      {/* Offset equals AppBar height */}
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {items.map((it) => (
            <ListItemButton
              key={it.text}
              selected={pathname.startsWith(it.to)}
              onClick={() => !it.disabled && navigate(it.to)}
              disabled={it.disabled}
            >
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}