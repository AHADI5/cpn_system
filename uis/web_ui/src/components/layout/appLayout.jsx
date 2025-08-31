import React from 'react';
import { Outlet } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './topBar';
import Header from './Header';
import SideMenu from './sideBar';
import AppTheme from '../../theme/AppTheme';


export default function Dashboard({ disableCustomTheme }) {
  return (
    <AppTheme disableCustomTheme={disableCustomTheme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <SideMenu />
        {/* Top Navbar */}
        <AppNavbar />
        {/* Main content (dynamic via React Router) */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              mx: 1,
              pb: 2,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            {/* Dynamic content goes here */}
            <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
