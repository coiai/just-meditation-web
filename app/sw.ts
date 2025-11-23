/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  Serwist,
  CacheFirst,
  type PrecacheEntry,
  type SerwistGlobalConfig,
  type RuntimeCaching,
} from "serwist";

// Next.js がビルド時に注入する precache manifest の型
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

// 追加したいランタイムキャッシュ（音源など）
const extraRuntimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ request }) => request.destination === "audio",
    handler: new CacheFirst({
      cacheName: "audio-cache",
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  // ✅ defaultCache を「配列として」渡すのが正解
  runtimeCaching: [...defaultCache, ...extraRuntimeCaching],
});

serwist.addEventListeners();