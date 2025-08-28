// src/components/AppLayout.jsx
import { useState } from 'react';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const drawerWidth = 260;

export default function AppLayout({ children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Keep the drawer open by default on desktop
  const [desktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (!isDesktop) setMobileOpen((v) => !v);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar
        onMenuClick={toggleSidebar}
        drawerWidth={drawerWidth}
        desktopOpen={isDesktop && desktopOpen}
      />

      {/* Desktop: permanent drawer under the AppBar */}
      <Sidebar
        variant="permanent"
        open={isDesktop && desktopOpen}
        onClose={() => {}}
        drawerWidth={drawerWidth}
        sx={{ display: { xs: 'none', md: 'block' } }}
      />

      {/* Mobile: temporary overlay drawer */}
      <Sidebar
        variant="temporary"
        open={!isDesktop && mobileOpen}
        onClose={() => setMobileOpen(false)}
        drawerWidth={drawerWidth}
        sx={{ display: { xs: 'block', md: 'none' } }}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Single, clear offset: shift content right by the drawer width on desktop
          ml: { md: `${drawerWidth}px` },
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          minWidth: 0,
          width: '100%',
        }}
      >
        {/* Spacer for the fixed AppBar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}