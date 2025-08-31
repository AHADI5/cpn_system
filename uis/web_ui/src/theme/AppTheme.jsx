// AppTheme.jsx
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { colorSchemes, typography, shadows, shape } from './ThemePrimitives';

// Create the theme once (no Hooks inside a Hook callback)
const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
    cssVarPrefix: 'template',
  },
  colorSchemes,
  typography,
  shadows,
  shape,
  components: {},
});

export default function AppTheme({ children, disableCustomTheme }) {
  if (disableCustomTheme) return <>{children}</>;

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}