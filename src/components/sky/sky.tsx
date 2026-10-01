"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type { Sky as SkyKind } from "@/lib/wmo";
import { skyGradient } from "./palette";

const WeatherScene = dynamic(() => import("./weather-scene"), { ssr: false });

type SkyProps = {
  sky: SkyKind;
  isDay: boolean;
  cloudCover: number;
  windDirection: number;
  windSpeed: number;
  code: number;
};

/**
 * The backdrop: a CSS sky gradient for the current weather (instant, and the
 * fallback without WebGL), with the 3D weather scene streamed in on top.
 */
export default function Sky({
  sky,
  isDay,
  cloudCover,
  windDirection,
  windSpeed,
  code,
}: SkyProps) {
  const flashRef = useRef<HTMLDivElement>(null);
  const flash = () =>
    flashRef.current?.animate(
      [
        { opacity: 0 },
        { opacity: 0.35 },
        { opacity: 0.05 },
        { opacity: 0.25 },
        { opacity: 0 },
      ],
      { duration: 650, easing: "ease-out" },
    );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 dark:hidden"
        style={{ background: skyGradient(sky, isDay, "light") }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ background: skyGradient(sky, isDay, "dark") }}
      />
      <div className="sky-scene absolute inset-0">
        <WeatherScene
          sky={sky}
          isDay={isDay}
          cloudCover={cloudCover}
          windDirection={windDirection}
          windSpeed={windSpeed}
          code={code}
          onFlash={flash}
        />
      </div>
      <div
        ref={flashRef}
        className="absolute inset-0 bg-indigo-100 opacity-0"
      />
      <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(2,6,23,0.4))] dark:block" />
    </div>
  );
}
