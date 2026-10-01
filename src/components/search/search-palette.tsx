"use client";

import {
  ClockCounterClockwiseIcon,
  CrosshairIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { placeHref } from "@/lib/format";
import {
  readRecent,
  rememberPlace,
  type SavedPlace,
  searchPlaces,
} from "./places";

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft data-[selected=true]:bg-white/10 data-[selected=true]:text-ink";

/** ⌘K city search: Open-Meteo geocoding, recent places and "use my location". */
export default function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(SavedPlace & { id: number })[]>([]);
  const [recent, setRecent] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "/" && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const id = window.setTimeout(() => {
      searchPlaces(q, controller.signal)
        .then(setResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      controller.abort();
      window.clearTimeout(id);
    };
  }, [query]);

  const go = (place: SavedPlace) => {
    rememberPlace(place);
    setOpen(false);
    setQuery("");
    startTransition(() => router.push(placeHref(place)));
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setOpen(false);
        startTransition(() =>
          router.push(
            placeHref({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            }),
          ),
        );
      },
      () => setLocating(false),
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full px-4 text-sm text-ink-soft transition-colors hover:bg-glass-strong sm:max-w-80"
      >
        <MagnifyingGlassIcon className="size-4 shrink-0" weight="bold" />
        <span className="truncate">Search a city</span>
        <kbd className="ml-auto hidden rounded-md border border-line px-1.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search for a city"
        shouldFilter={false}
        overlayClassName="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
        contentClassName="fixed inset-x-3 top-[12vh] z-50 mx-auto max-w-lg overflow-hidden rounded-3xl border border-line bg-slate-900/85 shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <MagnifyingGlassIcon
            className="size-4 text-ink-faint"
            weight="bold"
          />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="City, town or place…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-ink-faint"
          />
          {loading ? (
            <span className="size-3 animate-spin rounded-full border border-white/40 border-t-white" />
          ) : null}
        </div>
        <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
          <Command.Item
            value="__locate"
            onSelect={locate}
            className={itemClass}
          >
            <CrosshairIcon className="size-4" weight="bold" />
            {locating ? "Finding you…" : "Use my current location"}
          </Command.Item>

          {query.trim().length < 2 && recent.length ? (
            <Command.Group
              heading="Recent"
              className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1"
            >
              {recent.map((place) => (
                <Command.Item
                  key={`${place.lat},${place.lon}`}
                  value={`recent-${place.lat},${place.lon}`}
                  onSelect={() => go(place)}
                  className={itemClass}
                >
                  <ClockCounterClockwiseIcon className="size-4" />
                  <span className="text-ink">{place.name}</span>
                  <span className="truncate text-xs">{place.region}</span>
                </Command.Item>
              ))}
            </Command.Group>
          ) : null}

          {results.map((place) => (
            <Command.Item
              key={place.id}
              value={String(place.id)}
              onSelect={() => go(place)}
              className={itemClass}
            >
              <MapPinIcon className="size-4" />
              <span className="text-ink">{place.name}</span>
              <span className="truncate text-xs">{place.region}</span>
            </Command.Item>
          ))}

          {query.trim().length >= 2 && !loading && !results.length ? (
            <p className="px-3 py-6 text-center text-sm text-ink-faint">
              No places match “{query}”.
            </p>
          ) : null}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
