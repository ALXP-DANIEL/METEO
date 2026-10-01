"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$";

type DecryptTextProps = {
  text: string;
  className?: string;
  /** Seconds per character before it locks in. */
  speed?: number;
};

/**
 * METEO's signature since v1: text scrambles through random glyphs and
 * resolves left to right. Plays on mount and again on hover.
 */
export default function DecryptText({
  text,
  className,
  speed = 0.045,
}: DecryptTextProps) {
  const [shown, setShown] = useState(text);
  const frame = useRef(0);

  const play = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const tick = (now: number) => {
      const locked = (now - start) / 1000 / speed;
      setShown(
        [...text]
          .map((char, i) =>
            i < locked || char === " " || char === "°"
              ? char
              : (GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? char),
          )
          .join(""),
      );
      if (locked < text.length) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: replay only when the text changes
  useEffect(() => {
    play();
    return () => cancelAnimationFrame(frame.current);
  }, [text]);

  return (
    <span className={className} onPointerEnter={play}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}
