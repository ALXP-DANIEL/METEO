"use client";

import { useEffect, useState } from "react";

/** Counts up to a number as the page enters, after the splash if it's playing. */
export default function CountUp({
  value,
  duration = 1100,
}: {
  value: number;
  duration?: number;
}) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const delay = root.classList.contains("intro-seen") ? 0 : 1650;
    const from = Math.min(0, value);
    setShown(from);
    let frame = 0;
    const timer = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - p) ** 4;
        setShown(Math.round(from + (value - from) * eased));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return <>{shown}</>;
}
