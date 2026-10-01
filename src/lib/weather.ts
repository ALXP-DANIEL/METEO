import "server-only";

export type Units = "metric" | "imperial";

export type Place = {
  name: string;
  region: string;
  lat: number;
  lon: number;
};

export type Current = {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  dewPoint: number;
  isDay: boolean;
  code: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  visibility: number;
  uv: number;
  precipitation: number;
};

export type Hour = {
  time: string;
  temperature: number;
  code: number;
  isDay: boolean;
  precipChance: number;
};

export type Day = {
  date: string;
  code: number;
  max: number;
  min: number;
  sunrise: string;
  sunset: string;
  precipSum: number;
  precipChance: number;
  uvMax: number;
  windMax: number;
};

export type Air = {
  usAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  no2: number;
};

export type Forecast = {
  place: Place;
  units: Units;
  timezone: string;
  utcOffset: number;
  current: Current;
  hourly: Hour[];
  daily: Day[];
  air: Air | null;
};

export const DEFAULT_PLACE: Place = {
  name: "Kuala Lumpur",
  region: "Malaysia",
  lat: 3.1499,
  lon: 101.6945,
};

const REVALIDATE = 600;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!response.ok)
    throw new Error(`${response.status} from ${new URL(url).host}`);
  return response.json() as Promise<T>;
}

type OpenMeteo = {
  timezone: string;
  utc_offset_seconds: number;
  current: Record<string, number> & { time: string };
  hourly: Record<string, number[]> & { time: string[] };
  daily: Record<string, number[]> & {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
};

const CURRENT = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "dew_point_2m",
  "is_day",
  "weather_code",
  "cloud_cover",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "visibility",
  "uv_index",
  "precipitation",
];
const HOURLY = [
  "temperature_2m",
  "weather_code",
  "is_day",
  "precipitation_probability",
];
const DAILY = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "precipitation_sum",
  "precipitation_probability_max",
  "uv_index_max",
  "wind_speed_10m_max",
];

export async function getForecast(
  place: Place,
  units: Units,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: CURRENT.join(","),
    hourly: HOURLY.join(","),
    daily: DAILY.join(","),
    forecast_hours: "25",
    forecast_days: "10",
    timezone: "auto",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
    precipitation_unit: units === "imperial" ? "inch" : "mm",
  });
  const airParams = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide",
  });

  const [data, air] = await Promise.all([
    getJson<OpenMeteo>(`https://api.open-meteo.com/v1/forecast?${params}`),
    getJson<{ current: Record<string, number> }>(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${airParams}`,
    ).catch(() => null),
  ]);

  const c = data.current;
  const h = data.hourly;
  const d = data.daily;
  const at = (series: number[] | undefined, i: number) => series?.[i] ?? 0;

  return {
    place,
    units,
    timezone: data.timezone,
    utcOffset: data.utc_offset_seconds,
    current: {
      time: c.time,
      temperature: c.temperature_2m ?? 0,
      feelsLike: c.apparent_temperature ?? 0,
      humidity: c.relative_humidity_2m ?? 0,
      dewPoint: c.dew_point_2m ?? 0,
      isDay: c.is_day === 1,
      code: c.weather_code ?? 0,
      cloudCover: c.cloud_cover ?? 0,
      pressure: c.pressure_msl ?? 0,
      windSpeed: c.wind_speed_10m ?? 0,
      windDirection: c.wind_direction_10m ?? 0,
      windGusts: c.wind_gusts_10m ?? 0,
      visibility: c.visibility ?? 0,
      uv: c.uv_index ?? 0,
      precipitation: c.precipitation ?? 0,
    },
    hourly: h.time.map((time, i) => ({
      time,
      temperature: at(h.temperature_2m, i),
      code: at(h.weather_code, i),
      isDay: at(h.is_day, i) === 1,
      precipChance: at(h.precipitation_probability, i),
    })),
    daily: d.time.map((date, i) => ({
      date,
      code: at(d.weather_code, i),
      max: at(d.temperature_2m_max, i),
      min: at(d.temperature_2m_min, i),
      sunrise: d.sunrise[i] ?? "",
      sunset: d.sunset[i] ?? "",
      precipSum: at(d.precipitation_sum, i),
      precipChance: at(d.precipitation_probability_max, i),
      uvMax: at(d.uv_index_max, i),
      windMax: at(d.wind_speed_10m_max, i),
    })),
    air: air
      ? {
          usAqi: air.current.us_aqi ?? 0,
          pm2_5: air.current.pm2_5 ?? 0,
          pm10: air.current.pm10 ?? 0,
          ozone: air.current.ozone ?? 0,
          no2: air.current.nitrogen_dioxide ?? 0,
        }
      : null,
  };
}

/** Name a coordinate when the visitor arrived by geolocation, not search. */
export async function reverseGeocode(lat: number, lon: number): Promise<Place> {
  try {
    const data = await getJson<{
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    }>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    const name = data.city || data.locality || data.principalSubdivision;
    return {
      name: name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      region: [data.principalSubdivision, data.countryName]
        .filter((part) => part && part !== name)
        .join(", "),
      lat,
      lon,
    };
  } catch {
    return {
      name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      region: "",
      lat,
      lon,
    };
  }
}

/** Resolve the page's search params into a place, falling back to Kuala Lumpur. */
export async function resolvePlace(params: {
  lat?: string;
  lon?: string;
  name?: string;
  region?: string;
}): Promise<Place> {
  const lat = Number(params.lat);
  const lon = Number(params.lon);
  const valid =
    params.lat && params.lon && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
  if (!valid) return DEFAULT_PLACE;
  if (params.name) {
    return { name: params.name, region: params.region ?? "", lat, lon };
  }
  return reverseGeocode(lat, lon);
}
