export type SavedPlace = {
  name: string;
  region: string;
  lat: number;
  lon: number;
};

const KEY = "meteo:recent";

export function readRecent(): SavedPlace[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function rememberPlace(place: SavedPlace) {
  try {
    const rest = readRecent().filter(
      (p) =>
        Math.abs(p.lat - place.lat) > 0.01 ||
        Math.abs(p.lon - place.lon) > 0.01,
    );
    localStorage.setItem(KEY, JSON.stringify([place, ...rest].slice(0, 6)));
  } catch {
    /* storage unavailable — recents are a convenience only */
  }
}

type GeoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export async function searchPlaces(
  query: string,
  signal: AbortSignal,
): Promise<(SavedPlace & { id: number })[]> {
  const params = new URLSearchParams({
    name: query,
    count: "8",
    language: "en",
  });
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    { signal },
  );
  const data = (await response.json()) as { results?: GeoResult[] };
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    region: [r.admin1, r.country]
      .filter((part) => part && part !== r.name)
      .join(", "),
    lat: r.latitude,
    lon: r.longitude,
  }));
}
