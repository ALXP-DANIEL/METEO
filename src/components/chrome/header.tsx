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

type HeaderProps = {
  units: Units;
  current: SavedPlace;
  /** True when the place on screen came from the device location. */
  gps: boolean;
};

/** Brand, the search bar, and the tools: locate, units, surprise, theme. */
export default function Header({ units, current, gps }: HeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);
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
        setDenied(false);
        go({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        setLocating(false);
        setDenied(true);
      },
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

      {/* tools, grouped by what they act on: the place, the units, the app */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="surface flex items-center gap-0.5 rounded-2xl p-1">
          <button
            type="button"
            onClick={locate}
            aria-pressed={gps}
            aria-label={gps ? "Showing your location" : "Use my location"}
            title={
              denied
                ? "Location access is blocked"
                : gps
                  ? "Showing your location"
                  : "Use my location"
            }
            className={cn(
              iconButton,
              gps &&
                "bg-foreground text-background hover:bg-foreground hover:text-background",
              denied && !gps && "text-red-500",
            )}
          >
            <CrosshairIcon
              weight={gps ? "fill" : "bold"}
              className={cn("size-4", locating && "animate-spin")}
            />
          </button>
          <button
            type="button"
            onClick={surprise}
            aria-label="Surprise me"
            title="Surprise me"
            className={cn(iconButton, "hidden sm:grid")}
          >
            <DiceFiveIcon weight="bold" className="size-4" />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Units"
          className="surface relative flex h-11 rounded-2xl p-1"
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-1 left-1 w-9 rounded-xl bg-foreground transition-transform duration-300",
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
                units === value
                  ? "text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value === "metric" ? "°C" : "°F"}
            </button>
          ))}
        </div>

        <div className="surface flex items-center gap-0.5 rounded-2xl p-1">
          <ThemeToggle className={iconButton} />
          <a
            href="https://github.com/ALXP-DANIEL/METEO"
            target="_blank"
            rel="noreferrer"
            aria-label="Source on GitHub"
            className={cn(iconButton, "hidden md:grid")}
          >
            <GithubLogoIcon weight="bold" className="size-4" />
          </a>
        </div>
      </div>

      <SearchDialog open={open} onOpenChange={setOpen} onPick={go} />
    </header>
  );
}
