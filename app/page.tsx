// app/page.tsx
import Script from "next/script";
import MeditationTimer from "@/components/MeditationTimer";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Just Meditation",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    description:
      "A minimal meditation timer with bell intervals and ambient sounds.",
    url: "https://just-meditation.com",
  };

  return (
    <main>
      <Script
        id="jsonld-softwareapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeditationTimer />
    </main>
  );
}
