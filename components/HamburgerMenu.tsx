// components/HamburgerMenu.tsx
"use client";

import * as React from "react";
import InstallPWAButton from "./InstallPWAButton";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import TimerIcon from "@mui/icons-material/Timer";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";

const navItems = [
  { label: "Timer", href: "/", icon: <TimerIcon /> },
  { label: "Tips", href: "/tips", icon: <TipsAndUpdatesIcon /> },
];

export default function HamburgerMenu() {
  const [open, setOpen] = React.useState(false);

  const toggle = (next: boolean) => () => setOpen(next);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            edge="start"
            onClick={toggle(true)}
            aria-label="open menu"
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="subtitle1" fontWeight={600} letterSpacing={0.6}>
            Just Meditation
          </Typography>
          <InstallPWAButton />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggle(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRight: "1px solid rgba(255,255,255,0.06)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Menu
          </Typography>
        </Box>

        <Divider sx={{ opacity: 0.15 }} />

        <List sx={{ px: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={toggle(false)}
            >
              <ListItemButton
                sx={{

                  borderRadius: 2,
                  my: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Link>
          ))}
        </List>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Breathe. Listen. Return.
          </Typography>
        </Box>
      </Drawer>

      {/* AppBarの高さ分だけ下げるスペーサー */}
      <Toolbar />
    </>
  );
}
