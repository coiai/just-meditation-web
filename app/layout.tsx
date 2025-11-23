// app/layout.tsx  ✅ Server Component
import type { Metadata } from "next";
import Providers from "@/components/Providers";

const siteUrl = "https://just-meditation.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Just Meditation",
    template: "%s | Just Meditation",
  },
  description:
    "A minimal meditation timer with bell intervals and ambient sounds. Breathe, listen, return.",
  applicationName: "Just Meditation",
  keywords: ["meditation", "timer", "bell", "ambient sound", "mindfulness"],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Just Meditation",
    description:
      "A minimal meditation timer with bell intervals and ambient sounds.",
    siteName: "Just Meditation",
    images: [
      { url: "/opengraph-image.png", width: 1200, height: 630, alt: "Just Meditation" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Just Meditation",
    description:
      "A minimal meditation timer with bell intervals and ambient sounds.",
    images: ["/twitter-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
