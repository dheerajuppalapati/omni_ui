import { ReactNode } from 'react';
// @mui
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export default function ThemeLocalization({ children }: Props) {
  const defaultTheme = useTheme();

  const theme = createTheme(defaultTheme);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
