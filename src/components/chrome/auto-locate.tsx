"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  readRecent,
  rememberPlace,
  type SavedPlace,
} from "@/components/search/places";
import { placeHref } from "@/lib/format";

type AutoLocateProps = {
  /** The place on screen, or null when the visitor arrived with no location. */
  place: SavedPlace | null;
};

/**
 * Bare visits resume the last place viewed, or ask for the visitor's location
 * on the very first one. Every place viewed is added to recents.
 */
export default function AutoLocate({ place }: AutoLocateProps) {
  const router = useRouter();

  useEffect(() => {
    if (place) {
      rememberPlace(place);
      return;
    }
    const last = readRecent()[0];
    if (last) {
      router.replace(placeHref(last));
      return;
    }
    navigator.geolocation?.getCurrentPosition(
      (position) =>
        router.replace(
          placeHref({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }),
        ),
      () => {},
      { timeout: 10000, maximumAge: 600000 },
    );
  }, [place, router]);

  return null;
}
