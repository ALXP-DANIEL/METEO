import type { Units } from "./weather";

/** Open-Meteo returns local wall-clock ISO strings ("2026-10-01T14:00"). */
export function hourOf(iso: string) {
  return Number(iso.slice(11, 13));
}

export function minutesOf(iso: string) {
  return hourOf(iso) * 60 + Number(iso.slice(14, 16));
}

export function clockLabel(iso: string) {
  return iso.slice(11, 16);
}

export function hourLabel(iso: string) {
  const hour = hourOf(iso);
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

const WEEKDAY = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "UTC",
});
const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function weekday(date: string, index: number) {
  if (index === 0) return "Today";
  return WEEKDAY.format(new Date(`${date}T00:00:00Z`));
}

export function longDate(iso: string) {
  return LONG_DATE.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

export const unitLabels = (units: Units) =>
  units === "imperial"
    ? { temp: "°F", wind: "mph", precip: "in", distance: "mi" }
    : { temp: "°C", wind: "km/h", precip: "mm", distance: "km" };

export function round(value: number) {
  const r = Math.round(value);
  return Object.is(r, -0) ? 0 : r;
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export function compassPoint(degrees: number) {
  return COMPASS[Math.round(degrees / 45) % 8] ?? "N";
}

export function aqiBand(aqi: number) {
  if (aqi <= 50) return { label: "Good", tone: "#4ade80" };
  if (aqi <= 100) return { label: "Moderate", tone: "#facc15" };
  if (aqi <= 150) return { label: "Unhealthy for some", tone: "#fb923c" };
  if (aqi <= 200) return { label: "Unhealthy", tone: "#f87171" };
  if (aqi <= 300) return { label: "Very unhealthy", tone: "#c084fc" };
  return { label: "Hazardous", tone: "#be123c" };
}

export function uvBand(uv: number) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

/** Temperature to a hue for range bars: deep blue when freezing, red when hot. */
export function tempColor(value: number, units: Units) {
  const c = units === "imperial" ? ((value - 32) * 5) / 9 : value;
  const stops: [number, string][] = [
    [-10, "#818cf8"],
    [0, "#60a5fa"],
    [10, "#22d3ee"],
    [18, "#4ade80"],
    [24, "#facc15"],
    [30, "#fb923c"],
    [36, "#f43f5e"],
  ];
  for (const [limit, color] of stops) if (c <= limit) return color;
  return "#e11d48";
}

/** Moon phase 0..1 (0 new, 0.5 full) from a known new moon. */
export function moonPhase(date: Date) {
  const synodic = 29.530588853;
  const knownNew = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const days = date.getTime() / 86400000 - knownNew;
  return (((days % synodic) + synodic) % synodic) / synodic;
}

export function moonInfo(phase: number) {
  const names: [number, string, string][] = [
    [0.03, "New moon", "moon-new"],
    [0.22, "Waxing crescent", "moon-waxing-crescent"],
    [0.28, "First quarter", "moon-first-quarter"],
    [0.47, "Waxing gibbous", "moon-waxing-gibbous"],
    [0.53, "Full moon", "moon-full"],
    [0.72, "Waning gibbous", "moon-waning-gibbous"],
    [0.78, "Last quarter", "moon-last-quarter"],
    [0.97, "Waning crescent", "moon-waning-crescent"],
    [1, "New moon", "moon-new"],
  ];
  const [, label, icon] = names.find(([limit]) => phase <= limit) ?? names[0]!;
  return { label, icon: `/icons/wx/${icon}.svg` };
}

export function placeHref(place: {
  lat: number;
  lon: number;
  name?: string;
  region?: string;
}) {
  const params = new URLSearchParams({
    lat: place.lat.toFixed(4),
    lon: place.lon.toFixed(4),
  });
  if (place.name) params.set("name", place.name);
  if (place.region) params.set("region", place.region);
  return `/?${params}`;
}
