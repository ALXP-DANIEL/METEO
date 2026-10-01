"use client";

import { useEffect, useRef } from "react";
import type { Sky as SkyKind } from "@/lib/wmo";
import { skyGradient } from "./palette";

type SkyProps = {
  sky: SkyKind;
  isDay: boolean;
  /** 0–100, drives how many cloud puffs drift past. */
  cloudCover: number;
};

type Particle = { x: number; y: number; z: number; s: number; p: number };

/**
 * The page's backdrop: a gradient for the current sky plus a canvas that
 * renders the weather itself — rain streaks, snowfall, twinkling stars,
 * drifting cloud banks and the odd lightning flash.
 */
export default function Sky({ sky, isDay, cloudCover }: SkyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const density = coarse ? 0.55 : 1;
    const rand = (min: number, max: number) =>
      min + Math.random() * (max - min);
    const area = (width * height) / (1440 * 900);

    const rainy = sky === "rain" || sky === "storm";
    const snowy = sky === "snow";
    const starry = !isDay && (sky === "clear" || sky === "cloudy");
    const cloudy = sky !== "clear" || cloudCover > 25;

    const spawn = (count: number, make: () => Particle) =>
      Array.from({ length: Math.round(count * area * density) }, make);

    const drops = rainy
      ? spawn(sky === "storm" ? 420 : 260, () => ({
          x: rand(0, width),
          y: rand(-height, height),
          z: rand(0.4, 1),
          s: rand(14, 24),
          p: 0,
        }))
      : [];
    const flakes = snowy
      ? spawn(220, () => ({
          x: rand(0, width),
          y: rand(-height, height),
          z: rand(0.3, 1),
          s: rand(0.4, 1.1),
          p: rand(0, Math.PI * 2),
        }))
      : [];
    const stars = starry
      ? spawn(sky === "clear" ? 260 : 110, () => ({
          x: rand(0, width),
          y: rand(0, height * 0.75),
          z: rand(0.2, 1),
          s: rand(0.4, 1.4),
          p: rand(0, Math.PI * 2),
        }))
      : [];
    const puffCount = cloudy
      ? Math.round(
          (sky === "overcast" || sky === "fog" ? 14 : 4 + cloudCover / 10) *
            density,
        )
      : 0;
    const puffs = Array.from({ length: puffCount }, () => ({
      x: rand(-0.2, 1.1),
      y: rand(-0.05, sky === "fog" ? 0.95 : 0.55),
      z: rand(0.3, 1),
      s: rand(180, 420),
      p: rand(0, 1),
    }));
    const root = document.documentElement;
    const isDark = () => root.classList.contains("dark");
    const puffAlpha = isDay ? 0.1 : 0.05;

    let lightningAt = performance.now() + rand(3000, 7000);
    let frame = 0;
    let last = performance.now();
    let visible = true;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);
      const dark = isDark();

      for (const puff of puffs) {
        puff.x += (dt * 0.006 * puff.z) / (reduced ? Infinity : 1);
        if (puff.x > 1.25) puff.x = -0.3;
        const cx = puff.x * width;
        const cy = puff.y * height;
        const r = puff.s * (0.6 + puff.z * 0.6);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(
          0,
          `rgba(255,255,255,${(dark ? puffAlpha : puffAlpha * 3) * puff.z})`,
        );
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.8, r, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const star of stars) {
        const twinkle = reduced
          ? 0.7
          : 0.55 + 0.45 * Math.sin(now / 900 + star.p);
        ctx.fillStyle = dark
          ? `rgba(255,255,255,${star.z * twinkle})`
          : `rgba(70,70,140,${star.z * twinkle * 0.5})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
        ctx.fill();
      }

      if (drops.length) {
        ctx.lineCap = "round";
        for (const drop of drops) {
          if (!reduced) {
            drop.y += drop.s * 60 * dt * drop.z;
            drop.x -= drop.s * 9 * dt * drop.z;
          }
          if (drop.y > height + 20) {
            drop.y = rand(-60, -10);
            drop.x = rand(0, width + 80);
          }
          ctx.strokeStyle = dark
            ? `rgba(200,220,255,${0.12 + drop.z * 0.28})`
            : `rgba(40,70,120,${0.1 + drop.z * 0.25})`;
          ctx.lineWidth = drop.z * 1.2;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.s * 0.15, drop.y + drop.s * drop.z);
          ctx.stroke();
        }
      }

      for (const flake of flakes) {
        if (!reduced) {
          flake.y += 40 * dt * flake.z * flake.s;
          flake.p += dt;
          flake.x += Math.sin(flake.p) * 0.4 * flake.z;
        }
        if (flake.y > height + 10) {
          flake.y = -10;
          flake.x = rand(0, width);
        }
        ctx.fillStyle = `rgba(255,255,255,${0.35 + flake.z * 0.5})`;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, 1 + flake.z * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (sky === "storm" && !reduced && now > lightningAt) {
        lightningAt = now + rand(4000, 11000);
        flashRef.current?.animate(
          [
            { opacity: 0 },
            { opacity: 0.55 },
            { opacity: 0.1 },
            { opacity: 0.4 },
            { opacity: 0 },
          ],
          { duration: 700, easing: "ease-out" },
        );
      }

      if (!reduced && visible) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      cancelAnimationFrame(frame);
      if (visible && !reduced) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    const onResize = () => {
      resize();
      if (reduced) frame = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, [sky, isDay, cloudCover]);

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
      {isDay && sky === "clear" ? (
        <div className="absolute -top-40 right-[-10%] size-[46rem] rounded-full bg-[radial-gradient(circle,rgba(255,236,170,0.55),rgba(255,200,90,0.12)_40%,transparent_68%)]" />
      ) : null}
      {!isDay && sky === "clear" ? (
        <div className="absolute top-16 right-[12%] size-24 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fefce8,#e2e8f0_60%,#cbd5e1)] shadow-[0_0_80px_20px_rgba(226,232,240,0.18)]" />
      ) : null}
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div
        ref={flashRef}
        className="absolute inset-0 bg-indigo-100 opacity-0"
      />
      {/* soft vignette keeps text readable on bright skies */}
      <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(2,6,23,0.45))] dark:block" />
    </div>
  );
}
