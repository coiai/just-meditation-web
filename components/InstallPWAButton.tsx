// components/InstallPWAButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // すでにインストール済みか判定（主にChrome系）
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari 用
        (navigator as any).standalone === true;
      setIsInstalled(standalone);
    };

    checkInstalled();

    const onBeforeInstallPrompt = (e: Event) => {
      // デフォルトのミニバーを出さない
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch {
      // 失敗しても無視
    }
  };

  // インストール可能になるまでボタンは出さない
  if (isInstalled || !deferredPrompt) return null;

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={handleInstall}
      sx={{ borderRadius: 999, px: 2 }}
    >
      Install App
    </Button>
  );
}