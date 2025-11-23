// components/MeditationTimer.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  LinearProgress,
  Divider,
} from "@mui/material";

type AmbientOption = {
  id: string;
  label: string;
  src?: string; // undefined = 無音
};

const AMBIENTS: AmbientOption[] = [
  { id: "silence", label: "無音" },
  { id: "rain", label: "雨", src: "/sounds/rain.mp3" },
  { id: "forest", label: "森", src: "/sounds/forest.mp3" },
  { id: "waves", label: "波", src: "/sounds/waves.mp3" },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function MeditationTimer() {
  // 設定値
  const [durationMin, setDurationMin] = useState(10);
  const [bellIntervalMin, setBellIntervalMin] = useState(1);
  const [ambientId, setAmbientId] =
    useState<(typeof AMBIENTS)[number]["id"]>("silence");

  // セッション状態
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSec, setRemainingSec] = useState(durationMin * 60);

  // refs
  const startAtRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // オーディオ
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const ambientOption = useMemo(
    () => AMBIENTS.find((a) => a.id === ambientId) ?? AMBIENTS[0],
    [ambientId]
  );

  // duration変更時に残り時間も同期（停止中のみ）
  useEffect(() => {
    if (!isRunning) {
      setRemainingSec(durationMin * 60);
      pausedElapsedRef.current = 0;
      startAtRef.current = null;
    }
  }, [durationMin, isRunning]);

  // ベル Audio 初期化
  useEffect(() => {
    if (!bellAudioRef.current) {
      const a = new Audio("/sounds/bell.mp3");
      a.preload = "auto";
      bellAudioRef.current = a;
    }
  }, []);

  // 環境音の切替
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
      ambientAudioRef.current = null;
    }

    if (ambientOption.src) {
      const a = new Audio(ambientOption.src);
      a.loop = true;
      a.preload = "auto";
      ambientAudioRef.current = a;

      if (isRunning) {
        a.play().catch(() => {});
      }
    }
  }, [ambientOption.src]);

  // Start / Pause / Reset
  const handleStart = async () => {
    if (isRunning) return;

    setIsRunning(true);
    startAtRef.current = performance.now();

    if (ambientAudioRef.current) {
      try {
        await ambientAudioRef.current.play();
      } catch {}
    }
  };

  const handlePause = () => {
    if (!isRunning) return;
    setIsRunning(false);

    if (startAtRef.current != null) {
      pausedElapsedRef.current +=
        (performance.now() - startAtRef.current) / 1000;
      startAtRef.current = null;
    }

    ambientAudioRef.current?.pause();

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    startAtRef.current = null;
    pausedElapsedRef.current = 0;
    setRemainingSec(durationMin * 60);

    ambientAudioRef.current?.pause();
    if (ambientAudioRef.current) ambientAudioRef.current.currentTime = 0;

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // メインループ（raf）
  useEffect(() => {
    if (!isRunning) return;

    const totalSec = durationMin * 60;
    const bellEverySec = Math.max(1, Math.floor(bellIntervalMin * 60));

    let lastBellIndex = Math.floor(
      pausedElapsedRef.current / bellEverySec
    );

    const tick = () => {
      if (!isRunning) return;

      const now = performance.now();
      const elapsed =
        pausedElapsedRef.current +
        (startAtRef.current
          ? (now - startAtRef.current) / 1000
          : 0);

      const remain = Math.max(0, Math.ceil(totalSec - elapsed));
      setRemainingSec(remain);

      const bellIndex = Math.floor(elapsed / bellEverySec);
      if (bellIndex > lastBellIndex && elapsed < totalSec) {
        lastBellIndex = bellIndex;
        const bell = bellAudioRef.current;
        if (bell) {
          bell.currentTime = 0;
          bell.play().catch(() => {});
        }
      }

      if (elapsed >= totalSec) {
        const bell = bellAudioRef.current;
        if (bell) {
          bell.currentTime = 0;
          bell.play().catch(() => {});
        }

        setIsRunning(false);
        pausedElapsedRef.current = 0;
        startAtRef.current = null;
        ambientAudioRef.current?.pause();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning, durationMin, bellIntervalMin]);

  const progress =
    1 - remainingSec / Math.max(1, durationMin * 60);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 640,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600} letterSpacing={0.5}>
            Just Meditation
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Session
          </Typography>
        </Stack>

        {/* Timer */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          sx={{ mt: 3 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.08em",
            }}
          >
            {formatTime(remainingSec)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ pb: 1 }}>
            残り時間
          </Typography>
        </Stack>

        {/* Progress */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress * 100}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 3, opacity: 0.2 }} />

        {/* Settings */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
        >
          {/* Duration */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              総時間（分）
            </Typography>
            <Slider
              value={durationMin}
              onChange={(_, v) => setDurationMin(v as number)}
              min={1}
              max={180}
              step={1}
              disabled={isRunning}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
            <Typography variant="body2" sx={{ mt: -0.5 }}>
              {durationMin} min
            </Typography>
          </Box>

          {/* Bell interval */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              鐘の間隔（分）
            </Typography>
            <Slider
              value={bellIntervalMin}
              onChange={(_, v) => setBellIntervalMin(v as number)}
              min={0}
              max={60}
              step={1}
              disabled={isRunning}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
            <Typography variant="body2" sx={{ mt: -0.5 }}>
              {bellIntervalMin} min
            </Typography>
          </Box>

          {/* Ambient */}
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth size="small" disabled={isRunning}>
              <InputLabel id="ambient-label">環境音</InputLabel>
              <Select
                labelId="ambient-label"
                value={ambientId}
                label="環境音"
                onChange={(e) =>
                  setAmbientId(e.target.value as any)
                }
              >
                {AMBIENTS.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {/* Controls */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
          {!isRunning ? (
            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={handleStart}
              sx={{ py: 1.4, borderRadius: 3 }}
            >
              Start
            </Button>
          ) : (
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="secondary"
              onClick={handlePause}
              sx={{ py: 1.4, borderRadius: 3 }}
            >
              Pause
            </Button>
          )}

          <Button
            size="large"
            variant="outlined"
            onClick={handleReset}
            sx={{ px: 3.5, borderRadius: 3 }}
          >
            Reset
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          ※ iOS/Safari は自動再生制限があるため、Start後に音が鳴らない場合は
          Pause→Startで再試行してください。
        </Typography>
      </Paper>
    </Box>
  );
}