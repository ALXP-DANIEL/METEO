import type { Metadata } from "next";
import { cookies } from "next/headers";
import AutoLocate from "@/components/chrome/auto-locate";
import Header from "@/components/chrome/header";
import Radar from "@/components/radar/radar";
import Sky from "@/components/sky/sky";
import Daily from "@/components/weather/daily";
import Hero from "@/components/weather/hero";
import Hourly from "@/components/weather/hourly";
import {
  AirTile,
  FeelsTile,
  HumidityTile,
  MoonTile,
  PressureTile,
  RainTile,
  SunTile,
  UvTile,
  VisibilityTile,
  WindTile,
} from "@/components/weather/tiles";
import { hourLabel, round } from "@/lib/format";
import {
  type Forecast,
  getForecast,
  resolvePlace,
  type Units,
} from "@/lib/weather";
import { condition } from "@/lib/wmo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function load(searchParams: SearchParams) {
  const raw = await searchParams;
  const pick = (key: string) =>
    typeof raw[key] === "string" ? raw[key] : undefined;
  const units: Units =
    (await cookies()).get("units")?.value === "imperial"
      ? "imperial"
      : "metric";
  const located = Boolean(pick("lat") && pick("lon"));
  const place = await resolvePlace({
    lat: pick("lat"),
    lon: pick("lon"),
    name: pick("name"),
    region: pick("region"),
  });
  return { place, units, located, forecast: await getForecast(place, units) };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { forecast } = await load(searchParams);
  const { place, current } = forecast;
  const title = `${place.name} · ${round(current.temperature)}° ${condition(current.code).label}`;
  const og = `/og?${new URLSearchParams({ lat: String(place.lat), lon: String(place.lon), name: place.name })}`;
  return {
    title,
    description: `Live weather for ${place.name}: current conditions, hourly and 10-day forecast, air quality and rain radar.`,
    openGraph: { title, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { title, images: [og] },
  };
}

function summarize(forecast: Forecast) {
  const wet = forecast.hourly.find((h) => h.precipChance >= 50);
  const label = condition(forecast.current.code).label.toLowerCase();
  if (wet) {
    return wet === forecast.hourly[0]
      ? `Wet right now — ${label}, with a ${wet.precipChance}% chance of rain this hour.`
      : `${wet.precipChance}% chance of rain around ${hourLabel(wet.time)}. ${condition(forecast.current.code).label} until then.`;
  }
  const temps = forecast.hourly.map((h) => h.temperature);
  return `${condition(forecast.current.code).label} now. Dry for the next day, between ${round(Math.min(...temps))}° and ${round(Math.max(...temps))}°.`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { forecast, units, located } = await load(searchParams);
  const { current, place } = forecast;

  return (
    <>
      <Sky
        sky={condition(current.code).sky}
        isDay={current.isDay}
        cloudCover={current.cloudCover}
        windDirection={current.windDirection}
        windSpeed={current.windSpeed}
      />
      <AutoLocate
        place={
          located
            ? {
                name: place.name,
                region: place.region,
                lat: place.lat,
                lon: place.lon,
              }
            : null
        }
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-10 sm:px-6 lg:px-8">
        <Header
          units={units}
          current={{
            name: place.name,
            region: place.region,
            lat: place.lat,
            lon: place.lon,
          }}
        />

        <main
          key={`${place.lat},${place.lon},${units}`}
          className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-6"
        >
          <div className="flex flex-col gap-4 max-lg:contents lg:sticky lg:top-6 lg:row-span-3 lg:self-start">
            <div className="animate-rise px-1 py-4 lg:py-8">
              <Hero forecast={forecast} />
            </div>
            <div className="animate-rise [animation-delay:calc(var(--intro)+180ms)] max-lg:order-3">
              <Daily
                days={forecast.daily}
                units={units}
                currentTemp={current.temperature}
              />
            </div>
          </div>

          <div className="animate-rise min-w-0 [animation-delay:calc(var(--intro)+90ms)] max-lg:order-2 lg:col-start-2">
            <Hourly hours={forecast.hourly} summary={summarize(forecast)} />
          </div>

          <div
            className="grid auto-rows-[11.5rem] grid-cols-2 gap-4 self-start max-lg:order-4 md:grid-cols-4 lg:col-start-2"
            data-stagger
          >
            <WindTile forecast={forecast} />
            <SunTile forecast={forecast} />
            <UvTile forecast={forecast} />
            <AirTile forecast={forecast} />
            <FeelsTile forecast={forecast} />
            <HumidityTile forecast={forecast} />
            <RainTile forecast={forecast} />
            <VisibilityTile forecast={forecast} />
            <PressureTile forecast={forecast} />
            <MoonTile forecast={forecast} />
          </div>

          <div className="max-lg:order-5 lg:col-start-2">
            <Radar lat={place.lat} lon={place.lon} />
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 pt-4 font-mono text-[11px] text-muted-foreground">
          <p>
            Data:{" "}
            <a
              className="underline-offset-2 hover:underline"
              href="https://open-meteo.com"
            >
              Open-Meteo
            </a>{" "}
            ·{" "}
            <a
              className="underline-offset-2 hover:underline"
              href="https://www.rainviewer.com"
            >
              RainViewer
            </a>{" "}
            ·{" "}
            <a
              className="underline-offset-2 hover:underline"
              href="https://carto.com/attributions"
            >
              © CARTO
            </a>{" "}
            ·{" "}
            <a
              className="underline-offset-2 hover:underline"
              href="https://www.openstreetmap.org/copyright"
            >
              © OpenStreetMap
            </a>{" "}
            · Icons:{" "}
            <a
              className="underline-offset-2 hover:underline"
              href="https://meteocons.com"
            >
              Meteocons
            </a>
          </p>
          <p>
            Built by{" "}
            <a
              className="text-muted-foreground underline-offset-2 hover:underline"
              href="https://alifdaniel.dpdns.org"
            >
              Alif Daniel
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
