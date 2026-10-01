/**
 * WMO weather interpretation codes (as used by Open-Meteo) mapped to a label,
 * an animated Meteocons icon and the "sky" the backdrop should paint.
 */
export type Sky =
  | "clear"
  | "cloudy"
  | "overcast"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

type Condition = {
  label: string;
  day: string;
  night: string;
  sky: Sky;
};

const CONDITIONS: Record<number, Condition> = {
  0: {
    label: "Clear sky",
    day: "clear-day",
    night: "clear-night",
    sky: "clear",
  },
  1: {
    label: "Mostly clear",
    day: "partly-cloudy-day",
    night: "partly-cloudy-night",
    sky: "clear",
  },
  2: {
    label: "Partly cloudy",
    day: "partly-cloudy-day",
    night: "partly-cloudy-night",
    sky: "cloudy",
  },
  3: {
    label: "Overcast",
    day: "overcast-day",
    night: "overcast-night",
    sky: "overcast",
  },
  45: { label: "Fog", day: "fog-day", night: "fog-night", sky: "fog" },
  48: { label: "Rime fog", day: "fog-day", night: "fog-night", sky: "fog" },
  51: {
    label: "Light drizzle",
    day: "partly-cloudy-day-drizzle",
    night: "partly-cloudy-night-drizzle",
    sky: "rain",
  },
  53: { label: "Drizzle", day: "drizzle", night: "drizzle", sky: "rain" },
  55: { label: "Heavy drizzle", day: "drizzle", night: "drizzle", sky: "rain" },
  56: { label: "Freezing drizzle", day: "sleet", night: "sleet", sky: "rain" },
  57: { label: "Freezing drizzle", day: "sleet", night: "sleet", sky: "rain" },
  61: {
    label: "Light rain",
    day: "partly-cloudy-day-rain",
    night: "partly-cloudy-night-rain",
    sky: "rain",
  },
  63: { label: "Rain", day: "rain", night: "rain", sky: "rain" },
  65: { label: "Heavy rain", day: "rain", night: "rain", sky: "rain" },
  66: { label: "Freezing rain", day: "sleet", night: "sleet", sky: "rain" },
  67: { label: "Freezing rain", day: "sleet", night: "sleet", sky: "rain" },
  71: {
    label: "Light snow",
    day: "partly-cloudy-day-snow",
    night: "partly-cloudy-night-snow",
    sky: "snow",
  },
  73: { label: "Snow", day: "snow", night: "snow", sky: "snow" },
  75: { label: "Heavy snow", day: "snow", night: "snow", sky: "snow" },
  77: { label: "Snow grains", day: "snow", night: "snow", sky: "snow" },
  80: {
    label: "Rain showers",
    day: "partly-cloudy-day-rain",
    night: "partly-cloudy-night-rain",
    sky: "rain",
  },
  81: { label: "Rain showers", day: "rain", night: "rain", sky: "rain" },
  82: { label: "Violent showers", day: "rain", night: "rain", sky: "storm" },
  85: {
    label: "Snow showers",
    day: "partly-cloudy-day-snow",
    night: "partly-cloudy-night-snow",
    sky: "snow",
  },
  86: { label: "Snow showers", day: "snow", night: "snow", sky: "snow" },
  95: {
    label: "Thunderstorm",
    day: "thunderstorms-day-rain",
    night: "thunderstorms-night-rain",
    sky: "storm",
  },
  96: {
    label: "Storm with hail",
    day: "thunderstorms-day-rain",
    night: "thunderstorms-night-rain",
    sky: "storm",
  },
  99: {
    label: "Storm with hail",
    day: "thunderstorms-rain",
    night: "thunderstorms-rain",
    sky: "storm",
  },
};

const UNKNOWN: Condition = {
  label: "Unknown",
  day: "not-available",
  night: "not-available",
  sky: "cloudy",
};

export function condition(code: number) {
  return CONDITIONS[code] ?? UNKNOWN;
}

export function iconFor(code: number, isDay: boolean) {
  const c = condition(code);
  return `/icons/wx/${isDay ? c.day : c.night}.svg`;
}
