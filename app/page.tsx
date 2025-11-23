// app/page.tsx
import MeditationTimer from "@/components/MeditationTimer";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-950 text-neutral-50">
      <MeditationTimer />
    </main>
  );
}
