// components/Providers.tsx
"use client";

import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import HamburgerMenu from "@/components/HamburgerMenu";
import Footer from "@/components/Footer";

const theme = createTheme({
  palette: { mode: "dark" },
  shape: { borderRadius: 16 },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HamburgerMenu />
      {children}
      <Footer />
    </ThemeProvider>
  );
}