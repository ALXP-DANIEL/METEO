"use client";

import {
  ClockCounterClockwiseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { readRecent, type SavedPlace, searchPlaces } from "./places";

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground data-[selected=true]:bg-muted data-[selected=true]:text-foreground";

type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (place: SavedPlace) => void;
};

/** City search over Open-Meteo geocoding, with recent places when empty. */
export default function SearchDialog({
  open,
  onOpenChange,
  onPick,
}: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(SavedPlace & { id: number })[]>([]);
  const [recent, setRecent] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setRecent(readRecent());
    else setQuery("");
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
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

  const typing = query.trim().length >= 2;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search for a city"
      shouldFilter={false}
      overlayClassName="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
      contentClassName="surface fixed inset-x-3 top-[12vh] z-50 mx-auto max-w-lg overflow-hidden rounded-2xl"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <MagnifyingGlassIcon
          className="size-4 text-muted-foreground"
          weight="bold"
        />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search a city…"
          className="h-14 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading ? (
          <span className="size-3 animate-spin rounded-full border border-muted-foreground/40 border-t-foreground" />
        ) : null}
      </div>
      <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
        {!typing && recent.length ? (
          <Command.Group
            heading="Recent"
            className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1"
          >
            {recent.map((place) => (
              <Command.Item
                key={`${place.lat},${place.lon}`}
                value={`recent-${place.lat},${place.lon}`}
                onSelect={() => onPick(place)}
                className={itemClass}
              >
                <ClockCounterClockwiseIcon className="size-4" />
                <span className="text-foreground">{place.name}</span>
                <span className="truncate text-xs">{place.region}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        {results.map((place) => (
          <Command.Item
            key={place.id}
            value={String(place.id)}
            onSelect={() => onPick(place)}
            className={itemClass}
          >
            <MapPinIcon className="size-4" />
            <span className="text-foreground">{place.name}</span>
            <span className="truncate text-xs">{place.region}</span>
          </Command.Item>
        ))}

        {!typing && !recent.length ? (
          <p className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">
            Type at least two letters.
          </p>
        ) : null}
        {typing && !loading && !results.length ? (
          <p className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">
            No places match “{query}”.
          </p>
        ) : null}
      </Command.List>
    </Command.Dialog>
  );
}
