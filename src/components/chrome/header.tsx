"use client";

import {
  CrosshairIcon,
  DiceFiveIcon,
  GithubLogoIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { rememberPlace, type SavedPlace } from "@/components/search/places";
import SearchDialog from "@/components/search/search-dialog";
import { placeHref } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Units } from "@/lib/weather";
import Mark from "./mark";
import { SURPRISES } from "./surprise";
import { ThemeToggle } from "./theme";

const iconButton =
  "grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

type HeaderProps = { units: Units; current: SavedPlace };

/** Brand, the search bar, and the tools: locate, units, surprise, theme. */
export default function Header({ units, current }: HeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (
        event.key === "/" &&
        !(event.target instanceof HTMLInputElement)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (place: SavedPlace | { lat: number; lon: number }) => {
    if ("name" in place) rememberPlace(place);
    setOpen(false);
    startTransition(() => router.push(placeHref(place)));
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        go({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => setLocating(false),
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  const surprise = () => {
    const options = SURPRISES.filter((p) => p.name !== current.name);
    const pick = options[Math.floor(Math.random() * options.length)];
    if (pick) go(pick);
  };

  const setUnits = (next: Units) => {
    if (next === units) return;
    // biome-ignore lint/suspicious/noDocumentCookie: one simple preference cookie
    document.cookie = `units=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <header className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/"
        aria-label="METEO home"
        className="surface flex shrink-0 items-center gap-3 rounded-2xl p-1.5 sm:pr-4"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-foreground text-background">
          <Mark className="size-6" />
        </span>
        <span className="hidden flex-col sm:flex">
          <span className="font-mono text-sm leading-tight font-semibold">
            METEO
          </span>
          <span className="font-mono text-[11px] leading-tight text-muted-foreground">
            Live weather, anywhere
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="surface flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl px-4 text-sm text-muted-foreground transition-colors hover:text-foreground md:max-w-md"
      >
        <MagnifyingGlassIcon
          weight="bold"
          className={cn("size-4 shrink-0", pending && "animate-pulse")}
        />
        <span className="truncate">
          Search<span className="hidden sm:inline"> a city</span>
        </span>
        <kbd className="ml-auto hidden rounded-md border border-border px-1.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="surface ml-auto flex shrink-0 items-center gap-0.5 rounded-2xl p-1">
        <button
          type="button"
          onClick={locate}
          aria-label="Use my location"
          title="Use my location"
          className={iconButton}
        >
          <CrosshairIcon
            weight="bold"
            className={cn("size-4", locating && "animate-pulse")}
          />
        </button>
        <div
          role="radiogroup"
          aria-label="Units"
          className="relative mx-0.5 hidden h-9 rounded-xl bg-muted p-0.5 sm:flex"
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-0.5 left-0.5 w-9 rounded-[10px] bg-card shadow-sm transition-transform duration-300",
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
              onClick={() => setUnits(value)}
              className={cn(
                "relative w-9 font-mono text-xs transition-colors",
                units === value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {value === "metric" ? "°C" : "°F"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setUnits(units === "metric" ? "imperial" : "metric")}
          aria-label="Switch units"
          className={cn(iconButton, "font-mono text-xs sm:hidden")}
        >
          {units === "metric" ? "°C" : "°F"}
        </button>
        <button
          type="button"
          onClick={surprise}
          aria-label="Surprise me"
          title="Surprise me"
          className={iconButton}
        >
          <DiceFiveIcon weight="bold" className="size-4" />
        </button>
        <ThemeToggle className={iconButton} />
        <a
          href="https://github.com/ALXP-DANIEL/METEO"
          target="_blank"
          rel="noreferrer"
          aria-label="Source on GitHub"
          className={cn(iconButton, "hidden sm:grid")}
        >
          <GithubLogoIcon weight="bold" className="size-4" />
        </a>
      </div>

      <SearchDialog open={open} onOpenChange={setOpen} onPick={go} />
    </header>
  );
}
