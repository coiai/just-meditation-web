// app/tips/page.tsx

import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Chip,
  Divider,
} from "@mui/material";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tips",
  description:
    "Short, practical meditation tips for calmer and more consistent sessions.",
  alternates: {
    canonical: "/tips",
  },
};

type Tip = {
  title: string;
  body: string;
  tags?: string[];
};

const TIPS: Tip[] = [
  {
    title: "Start small",
    body: "Begin with 3–5 minutes. Consistency matters more than length.",
    tags: ["beginner", "habit"],
  },
  {
    title: "Anchor on the breath",
    body: "When your mind wanders, gently return to the sensation of breathing.",
    tags: ["breath", "focus"],
  },
  {
    title: "No need to stop thoughts",
    body: "Thoughts are normal. Notice them, label them, and let them pass.",
    tags: ["mind", "acceptance"],
  },
  {
    title: "Relax the face and shoulders",
    body: "Softening tension makes it easier to stay present.",
    tags: ["body", "relaxation"],
  },
  {
    title: "Use the bell as a reset",
    body: "Each bell is a cue to return—no judgment, just reset.",
    tags: ["bell", "practice"],
  },
  {
    title: "Try open awareness",
    body: "Instead of focusing on one thing, notice sounds, body, and thoughts as they come.",
    tags: ["awareness"],
  },
];

export default function TipsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" fontWeight={700} letterSpacing={0.5}>
              Tips
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Small guidance for a calmer session.
            </Typography>
          </Box>

          <Divider sx={{ opacity: 0.2 }} />

          {/* Tips list */}
          <Stack spacing={2.5}>
            {TIPS.map((tip, i) => (
              <Paper
                key={i}
                elevation={6}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 3,
                  backdropFilter: "blur(6px)",
                }}
              >
                <Stack spacing={1.2}>
                  <Typography variant="h6" fontWeight={600}>
                    {tip.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {tip.body}
                  </Typography>

                  {tip.tags && (
                    <Stack direction="row" spacing={1} sx={{ pt: 0.5, flexWrap: "wrap" }}>
                      {tip.tags.map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          size="small"
                          variant="outlined"
                          sx={{ opacity: 0.8 }}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>

          {/* Footer note */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            There’s no “perfect” meditation. Just show up and breathe.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}