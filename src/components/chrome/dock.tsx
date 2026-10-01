"use client";

import {
  CrosshairIcon,
  DiceFiveIcon,
  MagnifyingGlassIcon,
  RadioIcon,
  ThermometerIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { type ComponentType, useEffect, useState, useTransition } from "react";
import { rememberPlace, type SavedPlace } from "@/components/search/places";
import SearchDialog from "@/components/search/search-dialog";
import { placeHref } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Units } from "@/lib/weather";
import { SURPRISES } from "./surprise";

type DockButtonProps = {
  icon: ComponentType<{
    className?: string;
    weight?: "bold" | "regular" | "fill";
  }>;
  label: string;
  onClick: () => void;
  busy?: boolean;
};

function DockButton({ icon: Icon, label, onClick, busy }: DockButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-16 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-20"
    >
      <Icon
        className={cn("size-4.5", busy && "animate-pulse")}
        weight="regular"
      />
      <span className="max-w-full truncate font-mono text-[10px] sm:text-[11px]">
        {label}
      </span>
    </button>
  );
}

/** The floating bottom dock: search, locate, units, radar and surprise. */
export default function Dock({
  units,
  current,
}: {
  units: Units;
  current: SavedPlace;
}) {
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

  const toggleUnits = () => {
    const next = units === "metric" ? "imperial" : "metric";
    // biome-ignore lint/suspicious/noDocumentCookie: one simple preference cookie
    document.cookie = `units=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <>
      <nav
        aria-label="Tools"
        className="surface fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl p-1"
        style={{ background: "var(--card)" }}
      >
        <DockButton
          icon={MagnifyingGlassIcon}
          label="Search"
          onClick={() => setOpen(true)}
        />
        <DockButton
          icon={CrosshairIcon}
          label={locating ? "Finding…" : "Locate"}
          onClick={locate}
          busy={locating}
        />
        <DockButton
          icon={ThermometerIcon}
          label={units === "metric" ? "°C" : "°F"}
          onClick={toggleUnits}
        />
        <DockButton
          icon={RadioIcon}
          label="Radar"
          onClick={() =>
            document
              .getElementById("radar")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        />
        <span className="mx-0.5 h-8 w-px bg-border" />
        <DockButton
          icon={DiceFiveIcon}
          label="Surprise"
          onClick={surprise}
          busy={pending}
        />
      </nav>
      <SearchDialog open={open} onOpenChange={setOpen} onPick={go} />
    </>
  );
}
