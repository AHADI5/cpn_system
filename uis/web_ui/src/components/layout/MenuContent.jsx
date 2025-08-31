// src/components/navigation/MenuContent.jsx
import React, { useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

import { useAuth } from '../../context/AuthContext';

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, to: '/settings' },
  { text: 'About', icon: <InfoRoundedIcon />, to: '/about' },
  { text: 'Feedback', icon: <HelpRoundedIcon />, to: '/feedback' },
];

export default function MenuContent() {
  const { role, loading } = useAuth();
  const location = useLocation();

  const mainListItems = useMemo(() => {
    if (loading) {
      return [{ text: 'Dossiers', icon: <FolderRoundedIcon />, to: '/dossiers' }];
    }
    if (role === 'DOCTOR') {
      return [
        { text: 'Dashboard', icon: <DashboardRoundedIcon />, to: '/doctorDashboard' },
        { text: 'Dossiers', icon: <FolderRoundedIcon />, to: '/dossiers' },
        { text: 'Consultations', icon: <EventNoteRoundedIcon />, to: '/consultations' },
      ];
    }
    if (role === 'ADMIN') {
      return [
        { text: 'Dashboard', icon: <DashboardRoundedIcon />, to: '/adminDashboard' },
        { text: 'Utilisateurs', icon: <FolderRoundedIcon />, to: '/users' },
        { text: 'Roles', icon: <EventNoteRoundedIcon />, to: '/roles' },
      ];
    }
    if (role === 'RECEPTIONIST') {
      return [
        { text: 'Dossiers', icon: <FolderRoundedIcon />, to: '/dossiers' },
        { text: 'Consultations', icon: <EventNoteRoundedIcon />, to: '/consultations' },
      ];
    }
    // Fallback (unauth/unknown)
    return [{ text: 'Dossiers', icon: <FolderRoundedIcon />, to: '/dossiers' }];
  }, [role, loading]);

  const isSelected = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      {/* Main menu */}
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={RouterLink} to={item.to} selected={isSelected(item.to)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Secondary menu (static) */}
      <List dense>
        {secondaryListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={RouterLink} to={item.to}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}