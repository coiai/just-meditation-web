// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { Serwist } from "serwist";

// Next.js build 時に注入される precache manifest
declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,

  runtimeCaching: [
    // 画像はおすすめの defaultCache（実体は CacheFirst / SWR などのセット）
    {
      matcher: ({ request }) => request.destination === "image",
      handler: defaultCache,
    },

    // MP3など音源もオフラインで鳴らしたい場合
    {
      matcher: ({ request }) => request.destination === "audio",
      handler: defaultCache,
    },

    // fonts / css / js を手厚くしたいなら追加でOK
    // { matcher: ({ request }) => request.destination === "style", handler: defaultCache },
    // { matcher: ({ request }) => request.destination === "script", handler: defaultCache },
    // { matcher: ({ request }) => request.destination === "font", handler: defaultCache },
  ],
});

serwist.addEventListeners();