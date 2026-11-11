"use client";

import confetti from "canvas-confetti";

export function fireFintechCelebration() {
  if (typeof window === "undefined") return;

  // Gold, Emerald, Indigo and Cyan particles
  const colors = ["#10B981", "#FFC439", "#6366F1", "#38BDF8", "#FFFFFF"];

  // Burst 1
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors,
    ticks: 200,
    gravity: 1.2,
    scalar: 0.9,
  });

  // Burst 2 (delayed side cannons)
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
      colors,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
      colors,
    });
  }, 150);
}
