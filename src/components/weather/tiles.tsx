import {
  CloudRainIcon,
  DropIcon,
  EyeIcon,
  GaugeIcon,
  LeafIcon,
  MoonStarsIcon,
  SunHorizonIcon,
  SunIcon,
  ThermometerIcon,
  WindIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType, ReactNode } from "react";
import {
  aqiBand,
  clockLabel,
  compassPoint,
  minutesOf,
  moonInfo,
  moonPhase,
  round,
  unitLabels,
  uvBand,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Forecast } from "@/lib/weather";

type TileProps = { forecast: Forecast };

type TileShellProps = {
  icon: ComponentType<{ className?: string; weight?: "bold" }>;
  title: string;
  /** The headline number or word. */
  value: ReactNode;
  /** Small text right under the value. */
  caption?: ReactNode;
  /** A fixed-height visual band (bar, gauge, dots). */
  visual?: ReactNode;
  note?: ReactNode;
  wide?: boolean;
  children?: ReactNode;
};

/**
 * Every detail widget shares this anatomy and the grid's fixed row height:
 * label, value, caption, a 2.5rem visual band, then a one-line note.
 */
function Tile({
  icon: TileIcon,
  title,
  value,
  caption,
  visual,
  note,
  wide,
  children,
}: TileShellProps) {
  return (
    <section
      className={cn(
        "surface flex h-full min-w-0 flex-col gap-1 rounded-2xl p-4",
        wide && "col-span-2",
      )}
    >
      <h2 className="eyebrow flex items-center gap-1.5">
        <TileIcon className="size-3.5" weight="bold" />
        {title}
      </h2>
      {children ?? (
        <>
          <p className="mt-1 text-3xl leading-none font-light tracking-tight tabular-nums">
            {value}
          </p>
          <p className="h-5 truncate text-sm font-medium">{caption}</p>
          <div className="mt-auto flex h-10 items-end">{visual}</div>
        </>
      )}
      <p className="truncate text-xs text-muted-foreground">{note}</p>
    </section>
  );
}

function Unit({ children }: { children: ReactNode }) {
  return (
    <span className="ml-0.5 text-base text-muted-foreground">{children}</span>
  );
}

/** Marker on a coloured scale; shared by UV and humidity-style bars. */
function Scale({ at, gradient }: { at: number; gradient: string }) {
  return (
    <div
      className="relative mb-1 h-1.5 w-full rounded-full"
      style={{ background: gradient }}
    >
      <span
        className="absolute top-1/2 size-3 -translate-1/2 rounded-full border-2 border-card bg-foreground"
        style={{ left: `${Math.min(100, Math.max(0, at * 100))}%` }}
      />
    </div>
  );
}

/** Half-ring gauge; shared by air quality and pressure. */
function Arc({ at, color = "currentColor" }: { at: number; color?: string }) {
  const arc = Math.PI * 40;
  return (
    <svg viewBox="0 0 100 52" className="h-10 w-auto" aria-hidden>
      <path
        d="M10 50 A40 40 0 0 1 90 50"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M10 50 A40 40 0 0 1 90 50"
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={arc}
        strokeDashoffset={arc * (1 - Math.min(1, Math.max(0.02, at)))}
      />
    </svg>
  );
}

export function WindTile({ forecast }: TileProps) {
  const { windSpeed, windGusts, windDirection } = forecast.current;
  const u = unitLabels(forecast.units);
  const rows = [
    ["Speed", `${round(windSpeed)} ${u.wind}`],
    ["Gusts", `${round(windGusts)} ${u.wind}`],
    ["From", `${round(windDirection)}° ${compassPoint(windDirection)}`],
  ];
  return (
    <Tile
      icon={WindIcon}
      title="Wind"
      value={null}
      wide
      note={`Blowing from the ${compassPoint(windDirection)}.`}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="relative size-28 shrink-0 rounded-full border border-border">
          {["N", "E", "S", "W"].map((point, i) => (
            <span
              key={point}
              className="absolute inset-0 flex justify-center pt-1 font-mono text-[9px] text-muted-foreground"
              style={{ rotate: `${i * 90}deg` }}
            >
              <span style={{ rotate: `${-i * 90}deg` }}>{point}</span>
            </span>
          ))}
          <div
            className="absolute inset-2"
            style={{ rotate: `${windDirection + 180}deg` }}
          >
            <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
              <path d="M50 2 L58 20 L50 16 L42 20 Z" fill="currentColor" />
              <line
                x1="50"
                y1="16"
                x2="50"
                y2="96"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            </svg>
          </div>
          <div className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-card text-center shadow-sm">
            <span className="text-base leading-none font-semibold tabular-nums">
              {round(windSpeed)}
              <span className="block font-mono text-[8px] font-normal text-muted-foreground">
                {u.wind}
              </span>
            </span>
          </div>
        </div>
        <dl className="grid min-w-0 flex-1 text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-2 border-b border-border py-1.5 last:border-b-0"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="truncate tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Tile>
  );
}

export function SunTile({ forecast }: TileProps) {
  const today = forecast.daily[0];
  if (!today?.sunrise) return null;
  const rise = minutesOf(today.sunrise);
  const set = minutesOf(today.sunset);
  const now = minutesOf(forecast.current.time);
  const t = Math.min(1, Math.max(0, (now - rise) / (set - rise)));
  const up = now >= rise && now <= set;
  const dayLength = set - rise;
  return (
    <Tile
      icon={SunHorizonIcon}
      title={up ? "Sunset" : "Sunrise"}
      value={null}
      wide
      note={`${Math.floor(dayLength / 60)}h ${dayLength % 60}m of daylight · ↑ ${clockLabel(today.sunrise)} ↓ ${clockLabel(today.sunset)}`}
    >
      <div className="flex flex-1 items-center gap-4">
        <p className="text-3xl leading-none font-light tabular-nums">
          {clockLabel(up ? today.sunset : today.sunrise)}
        </p>
        <svg viewBox="0 0 100 50" className="h-24 min-w-0 flex-1" aria-hidden>
          <defs>
            <linearGradient id="sun-arc" x1="0" x2="1">
              <stop offset="0" stopColor="#fdba74" />
              <stop offset="0.5" stopColor="#fde68a" />
              <stop offset="1" stopColor="#fb7185" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="46"
            x2="100"
            y2="46"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="0.5"
          />
          <path
            d="M8 46 Q50 -30 92 46"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1"
            strokeDasharray="1.5 2"
          />
          <path
            d="M8 46 Q50 -30 92 46"
            fill="none"
            stroke="url(#sun-arc)"
            strokeWidth="1.8"
            pathLength={1}
            strokeDasharray={`${t} 1`}
          />
          {up ? (
            <>
              <circle
                cx={8 + t * 84}
                cy={46 - 152 * t * (1 - t)}
                r="6"
                fill="#fde68a"
                fillOpacity="0.3"
              />
              <circle
                cx={8 + t * 84}
                cy={46 - 152 * t * (1 - t)}
                r="3"
                fill="#fbbf24"
              />
            </>
          ) : null}
        </svg>
      </div>
    </Tile>
  );
}

export function UvTile({ forecast }: TileProps) {
  const uv = forecast.current.uv;
  const max = forecast.daily[0]?.uvMax ?? uv;
  return (
    <Tile
      icon={SunIcon}
      title="UV index"
      value={round(uv)}
      caption={uvBand(uv)}
      visual={
        <Scale
          at={uv / 11}
          gradient="linear-gradient(90deg,#4ade80,#facc15,#fb923c,#ef4444,#a855f7)"
        />
      }
      note={`Peaks at ${round(max)} today${max >= 6 ? " · wear sunscreen" : ""}`}
    />
  );
}

export function AirTile({ forecast }: TileProps) {
  const air = forecast.air;
  if (!air) return null;
  const band = aqiBand(air.usAqi);
  return (
    <Tile
      icon={LeafIcon}
      title="Air quality"
      value={round(air.usAqi)}
      caption={<span style={{ color: band.tone }}>{band.label}</span>}
      visual={<Arc at={air.usAqi / 300} color={band.tone} />}
      note={`PM2.5 ${round(air.pm2_5)} · PM10 ${round(air.pm10)} µg/m³`}
    />
  );
}

export function FeelsTile({ forecast }: TileProps) {
  const { feelsLike, temperature, humidity, windSpeed } = forecast.current;
  const diff = feelsLike - temperature;
  const why =
    Math.abs(diff) < 1.5
      ? "Close to the actual temperature"
      : diff > 0
        ? humidity > 60
          ? "Humidity makes it feel warmer"
          : "Sun makes it feel warmer"
        : windSpeed > 10
          ? "Wind makes it feel cooler"
          : "Feels cooler than it is";
  const span = 8;
  return (
    <Tile
      icon={ThermometerIcon}
      title="Feels like"
      value={`${round(feelsLike)}°`}
      caption={
        Math.abs(diff) < 1.5
          ? "Same as actual"
          : `${diff > 0 ? "+" : ""}${round(diff)}° vs actual`
      }
      visual={
        <Scale
          at={0.5 + Math.max(-span, Math.min(span, diff)) / (2 * span)}
          gradient="linear-gradient(90deg,#60a5fa,color-mix(in oklab,currentColor 20%,transparent),#fb923c)"
        />
      }
      note={why}
    />
  );
}

export function HumidityTile({ forecast }: TileProps) {
  const { humidity, dewPoint } = forecast.current;
  return (
    <Tile
      icon={DropIcon}
      title="Humidity"
      value={
        <>
          {round(humidity)}
          <Unit>%</Unit>
        </>
      }
      caption={humidity > 75 ? "Muggy" : humidity < 30 ? "Dry" : "Comfortable"}
      visual={
        <div className="flex h-full w-full items-end gap-0.5">
          {Array.from({ length: 20 }, (_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: static bars
              key={i}
              className={cn(
                "flex-1 rounded-sm",
                i < humidity / 5 ? "bg-foreground/80" : "bg-foreground/10",
              )}
              style={{ height: `${25 + i * 3.75}%` }}
            />
          ))}
        </div>
      }
      note={`Dew point ${round(dewPoint)}°`}
    />
  );
}

export function RainTile({ forecast }: TileProps) {
  const today = forecast.daily[0];
  const tomorrow = forecast.daily[1];
  const u = unitLabels(forecast.units);
  const amount = (value: number) =>
    forecast.units === "imperial"
      ? value.toFixed(2)
      : String(Math.round(value * 10) / 10);
  const hours = forecast.hourly.slice(0, 12);
  return (
    <Tile
      icon={CloudRainIcon}
      title="Precipitation"
      value={
        <>
          {amount(today?.precipSum ?? 0)}
          <Unit>{u.precip}</Unit>
        </>
      }
      caption="Expected today"
      visual={
        <div className="flex h-full w-full items-end gap-0.5">
          {hours.map((hour) => (
            <span
              key={hour.time}
              className="flex-1 rounded-sm bg-sky-500/80 dark:bg-sky-300/80"
              style={{
                height: `${Math.max(6, hour.precipChance)}%`,
                opacity: hour.precipChance < 10 ? 0.25 : 1,
              }}
            />
          ))}
        </div>
      }
      note={
        tomorrow
          ? `Tomorrow ${amount(tomorrow.precipSum)} ${u.precip} · ${tomorrow.precipChance}%`
          : null
      }
    />
  );
}

export function VisibilityTile({ forecast }: TileProps) {
  const { visibility } = forecast.current;
  const imperial = forecast.units === "imperial";
  const distance = imperial ? visibility / 1609.34 : visibility / 1000;
  const shown =
    distance >= 10 ? round(distance) : Math.round(distance * 10) / 10;
  return (
    <Tile
      icon={EyeIcon}
      title="Visibility"
      value={
        <>
          {shown}
          <Unit>{imperial ? "mi" : "km"}</Unit>
        </>
      }
      caption={
        visibility >= 10000 ? "Clear" : visibility >= 4000 ? "Hazy" : "Poor"
      }
      visual={
        <Scale
          at={Math.min(1, visibility / 20000)}
          gradient="linear-gradient(90deg,color-mix(in oklab,currentColor 15%,transparent),currentColor)"
        />
      }
      note={
        visibility >= 10000 ? "Perfectly clear view" : "Haze in the distance"
      }
    />
  );
}

export function PressureTile({ forecast }: TileProps) {
  const { pressure } = forecast.current;
  const imperial = forecast.units === "imperial";
  return (
    <Tile
      icon={GaugeIcon}
      title="Pressure"
      value={
        <>
          {imperial ? (pressure * 0.02953).toFixed(2) : round(pressure)}
          <Unit>{imperial ? "inHg" : "hPa"}</Unit>
        </>
      }
      caption={pressure < 1005 ? "Low" : pressure > 1022 ? "High" : "Normal"}
      visual={<Arc at={(pressure - 960) / 100} />}
      note={
        pressure < 1005
          ? "Unsettled weather likely"
          : pressure > 1022
            ? "Settled weather likely"
            : "Steady conditions"
      }
    />
  );
}

export function MoonTile({ forecast }: TileProps) {
  const phase = moonPhase(new Date(`${forecast.current.time}:00Z`));
  const moon = moonInfo(phase);
  const illumination = round((1 - Math.cos(phase * 2 * Math.PI)) * 50);
  const toFull = round(((0.5 - phase + 1) % 1) * 29.53);
  return (
    <Tile
      icon={MoonStarsIcon}
      title="Moon"
      value={
        <>
          {illumination}
          <Unit>%</Unit>
        </>
      }
      caption={moon.label}
      visual={
        <img
          src={moon.icon}
          alt=""
          width={48}
          height={48}
          className="-mb-1 -ml-1 size-12"
        />
      }
      note={toFull === 0 ? "Full moon tonight" : `Full moon in ${toFull} days`}
    />
  );
}
