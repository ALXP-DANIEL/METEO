"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { Units } from "@/lib/weather";

/** °C / °F switch. Stored in a cookie so the server renders the right units. */
export default function UnitToggle({ units }: { units: Units }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const set = (next: Units) => {
    if (next === units) return;
    // biome-ignore lint/suspicious/noDocumentCookie: one simple preference cookie
    document.cookie = `units=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div
      role="radiogroup"
      aria-label="Temperature units"
      className={cn(
        "glass relative flex h-10 shrink-0 rounded-full p-1",
        pending && "opacity-70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-1 w-9 rounded-full bg-white transition-transform duration-300",
          units === "imperial" && "translate-x-9",
        )}
      />
      {(["metric", "imperial"] as const).map((value) => (
        // biome-ignore lint/a11y/useSemanticElements: styled segmented control
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={units === value}
          onClick={() => set(value)}
          className={cn(
            "relative w-9 rounded-full text-xs font-semibold transition-colors",
            units === value ? "text-slate-900" : "text-ink-soft hover:text-ink",
          )}
        >
          {value === "metric" ? "°C" : "°F"}
        </button>
      ))}
    </div>
  );
}
