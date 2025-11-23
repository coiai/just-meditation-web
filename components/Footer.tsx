// components/Footer.tsx
"use client";

import Link from "next/link";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        textAlign: "center",
        opacity: 0.7,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        created by{" "}
        <Link
          href="https://coiai.net"
          target="_blank"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 600,
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            paddingBottom: 2,
          }}
        >
          coiai
        </Link>
      </Typography>
    </Box>
  );
}