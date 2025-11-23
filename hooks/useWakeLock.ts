// hooks/useWakeLock.ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type WakeLockSentinelLike = {
  release: () => Promise<void>;
  released: boolean;
  addEventListener: (type: "release", listener: () => void) => void;
};

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "wakeLock" in navigator);
  }, []);

  const request = useCallback(async () => {
    if (!supported || active) return;
    try {
      // @ts-ignore
      const sentinel = (await navigator.wakeLock.request("screen")) as WakeLockSentinelLike;
      sentinelRef.current = sentinel;
      setActive(true);

      sentinel.addEventListener("release", () => {
        setActive(false);
        sentinelRef.current = null;
      });
    } catch {
      // 取得失敗（省電力モード/権限/裏に回った時など）
      setActive(false);
    }
  }, [supported, active]);

  const release = useCallback(async () => {
    try {
      await sentinelRef.current?.release();
    } finally {
      sentinelRef.current = null;
      setActive(false);
    }
  }, []);

  // タブが非表示→表示に戻った時、再取得が必要なことが多い
  useEffect(() => {
    if (!supported) return;
    const onVisibility = () => {
      if (document.visibilityState === "visible" && active) {
        request();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [supported, active, request]);

  return { supported, active, request, release };
}