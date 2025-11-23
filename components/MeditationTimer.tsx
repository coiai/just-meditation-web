// components/MeditationTimer.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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
  const [ambientId, setAmbientId] = useState<AMBIENTS[number]["id"]>("silence");

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

  // ベル＆環境音の Audio 初期化（client only）
  useEffect(() => {
    if (!bellAudioRef.current) {
      const a = new Audio("/sounds/bell.mp3");
      a.preload = "auto";
      bellAudioRef.current = a;
    }
  }, []);

  // 環境音の切替
  useEffect(() => {
    // 既存停止
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

      // 実行中なら即再生（※自動再生制限があるので失敗は黙ってOK）
      if (isRunning) {
        a.play().catch(() => {});
      }
    }
  }, [ambientOption.src]); // ambientId change

  // Start / Pause / Reset
  const handleStart = async () => {
    if (isRunning) return;

    setIsRunning(true);
    startAtRef.current = performance.now();

    // 環境音再生（ユーザー操作内なので通りやすい）
    if (ambientAudioRef.current) {
      try {
        await ambientAudioRef.current.play();
      } catch {
        // iOSなどで失敗しても無視
      }
    }
  };

  const handlePause = () => {
    if (!isRunning) return;

    setIsRunning(false);

    // 経過時間を保存
    if (startAtRef.current != null) {
      pausedElapsedRef.current += (performance.now() - startAtRef.current) / 1000;
      startAtRef.current = null;
    }

    // 環境音停止
    ambientAudioRef.current?.pause();

    // raf停止
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

    let lastBellIndex = Math.floor(pausedElapsedRef.current / bellEverySec);

    const tick = () => {
      if (!isRunning) return;

      const now = performance.now();
      const elapsed =
        pausedElapsedRef.current +
        (startAtRef.current ? (now - startAtRef.current) / 1000 : 0);

      const remain = Math.max(0, Math.ceil(totalSec - elapsed));
      setRemainingSec(remain);

      // ベル判定：intervalごとに1回
      const bellIndex = Math.floor(elapsed / bellEverySec);
      if (bellIndex > lastBellIndex && elapsed < totalSec) {
        lastBellIndex = bellIndex;
        // 鐘を鳴らす
        const bell = bellAudioRef.current;
        if (bell) {
          bell.currentTime = 0;
          bell.play().catch(() => {});
        }
      }

      // 終了
      if (elapsed >= totalSec) {
        // 最後にもベル鳴らしたいならここで鳴らす
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
    <div className="w-full max-w-xl bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">Just Meditation</h1>

      {/* Timer display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-5xl font-mono tracking-wider">
          {formatTime(remainingSec)}
        </div>
        <div className="text-sm text-neutral-400">
          残り時間
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-neutral-100 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-neutral-300">総時間（分）</span>
          <input
            type="number"
            min={1}
            max={180}
            value={durationMin}
            disabled={isRunning}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-neutral-300">鐘の間隔（分）</span>
          <input
            type="number"
            min={0.25}
            step={0.25}
            max={60}
            value={bellIntervalMin}
            disabled={isRunning}
            onChange={(e) => setBellIntervalMin(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-neutral-300">環境音</span>
          <select
            value={ambientId}
            disabled={isRunning}
            onChange={(e) => setAmbientId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800"
          >
            {AMBIENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 py-3 rounded-xl bg-white text-black font-medium hover:bg-neutral-200 transition"
          >
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 py-3 rounded-xl bg-neutral-200 text-black font-medium hover:bg-neutral-300 transition"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-neutral-400 mt-4">
        ※ iOS/Safari は自動再生制限があるため、Start後に音が鳴らない場合は一度Pause→Startで再試行してください。
      </p>
    </div>
  );
}