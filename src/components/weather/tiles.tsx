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
import type { Forecast } from "@/lib/weather";
import Panel from "./panel";

type TileProps = { forecast: Forecast };

function Big({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-3xl font-light tracking-tight tabular-nums">
      {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-auto text-xs leading-5 text-muted-foreground">
      {children}
    </p>
  );
}

export function WindTile({ forecast }: TileProps) {
  const { windSpeed, windGusts, windDirection } = forecast.current;
  const u = unitLabels(forecast.units);
  return (
    <Panel title="Wind" className="col-span-2">
      <div className="flex items-center gap-5">
        <div className="relative size-36 shrink-0 rounded-full border border-border sm:size-40">
          {["N", "E", "S", "W"].map((point, i) => (
            <span
              key={point}
              className="absolute inset-0 flex justify-center pt-1.5 text-[10px] font-semibold text-muted-foreground/70"
              style={{ rotate: `${i * 90}deg` }}
            >
              <span style={{ rotate: `${-i * 90}deg` }}>{point}</span>
            </span>
          ))}
          {Array.from({ length: 36 }, (_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: static tick marks
              key={i}
              className="absolute inset-0 flex justify-center"
              style={{ rotate: `${i * 10}deg` }}
            >
              <span
                className={i % 9 === 0 ? "h-0" : "h-1.5 w-px bg-foreground/20"}
              />
            </span>
          ))}
          {/* the arrow points where the wind blows to */}
          <div
            className="absolute inset-3 transition-[rotate] duration-1000"
            style={{ rotate: `${windDirection + 180}deg` }}
          >
            <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
              <path d="M50 4 L57 22 L50 18 L43 22 Z" fill="currentColor" />
              <line
                x1="50"
                y1="18"
                x2="50"
                y2="96"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.6"
              />
              <circle
                cx="50"
                cy="96"
                r="3"
                fill="currentColor"
                fillOpacity="0.6"
              />
            </svg>
          </div>
          <div className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-card text-center backdrop-blur">
            <span className="text-lg leading-none font-semibold tabular-nums">
              {round(windSpeed)}
              <span className="block text-[9px] font-normal text-muted-foreground">
                {u.wind}
              </span>
            </span>
          </div>
        </div>
        <dl className="grid flex-1 gap-2 text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Speed</dt>
            <dd className="tabular-nums">
              {round(windSpeed)} {u.wind}
            </dd>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Gusts</dt>
            <dd className="tabular-nums">
              {round(windGusts)} {u.wind}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">From</dt>
            <dd className="tabular-nums">
              {round(windDirection)}° {compassPoint(windDirection)}
            </dd>
          </div>
        </dl>
      </div>
    </Panel>
  );
}

export function UvTile({ forecast }: TileProps) {
  const uv = forecast.current.uv;
  const max = forecast.daily[0]?.uvMax ?? uv;
  return (
    <Panel title="UV index">
      <Big>{round(uv)}</Big>
      <p className="-mt-2 text-sm font-medium">{uvBand(uv)}</p>
      <div className="relative mt-1 h-1.5 rounded-full bg-[linear-gradient(90deg,#4ade80,#facc15,#fb923c,#ef4444,#a855f7)]">
        <span
          className="absolute top-1/2 size-3 -translate-1/2 rounded-full border-2 border-card bg-foreground"
          style={{ left: `${Math.min(100, (uv / 11) * 100)}%` }}
        />
      </div>
      <Note>
        Peaks at {round(max)} today.{max >= 6 ? " Wear sunscreen." : ""}
      </Note>
    </Panel>
  );
}

export function AirTile({ forecast }: TileProps) {
  const air = forecast.air;
  if (!air) return null;
  const band = aqiBand(air.usAqi);
  const sweep = Math.min(1, air.usAqi / 300);
  const r = 40;
  const arc = Math.PI * r;
  return (
    <Panel title="Air quality">
      <div className="relative mx-auto w-full max-w-36">
        <svg viewBox="0 0 100 56" className="w-full" aria-hidden>
          <path
            d="M10 50 A40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M10 50 A40 40 0 0 1 90 50"
            fill="none"
            stroke={band.tone}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={arc}
            strokeDashoffset={arc * (1 - sweep)}
          />
        </svg>
        <p className="absolute inset-x-0 bottom-0 text-center text-2xl font-light tabular-nums">
          {round(air.usAqi)}
        </p>
      </div>
      <p
        className="text-center text-sm font-medium"
        style={{ color: band.tone }}
      >
        {band.label}
      </p>
      <Note>
        PM2.5 {round(air.pm2_5)} · PM10 {round(air.pm10)} · O₃{" "}
        {round(air.ozone)} µg/m³
      </Note>
    </Panel>
  );
}

export function HumidityTile({ forecast }: TileProps) {
  const { humidity, dewPoint } = forecast.current;
  return (
    <Panel title="Humidity">
      <Big>{round(humidity)}%</Big>
      <div className="flex h-10 items-end gap-0.5">
        {Array.from({ length: 20 }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static bars
            key={i}
            className={
              i < humidity / 5
                ? "flex-1 rounded-sm bg-foreground/80"
                : "flex-1 rounded-sm bg-muted"
            }
            style={{ height: `${30 + i * 3.5}%` }}
          />
        ))}
      </div>
      <Note>The dew point is {round(dewPoint)}° right now.</Note>
    </Panel>
  );
}

export function FeelsTile({ forecast }: TileProps) {
  const { feelsLike, temperature, humidity, windSpeed } = forecast.current;
  const diff = feelsLike - temperature;
  const why =
    Math.abs(diff) < 1.5
      ? "Similar to the actual temperature."
      : diff > 0
        ? humidity > 60
          ? "Humidity is making it feel warmer."
          : "Sunshine is making it feel warmer."
        : windSpeed > 10
          ? "Wind is making it feel cooler."
          : "It feels cooler than it is.";
  return (
    <Panel title="Feels like">
      <Big>{round(feelsLike)}°</Big>
      <Note>{why}</Note>
    </Panel>
  );
}

export function VisibilityTile({ forecast }: TileProps) {
  const { visibility } = forecast.current;
  const imperial = forecast.units === "imperial";
  const distance = imperial ? visibility / 1609.34 : visibility / 1000;
  const shown =
    distance >= 10 ? round(distance) : Math.round(distance * 10) / 10;
  const note =
    visibility >= 10000
      ? "Perfectly clear view."
      : visibility >= 4000
        ? "Slight haze in the distance."
        : "Low visibility — take care on the road.";
  return (
    <Panel title="Visibility">
      <Big>
        {shown}{" "}
        <span className="text-lg text-muted-foreground">
          {imperial ? "mi" : "km"}
        </span>
      </Big>
      <Note>{note}</Note>
    </Panel>
  );
}

export function PressureTile({ forecast }: TileProps) {
  const { pressure } = forecast.current;
  const imperial = forecast.units === "imperial";
  // 960–1060 hPa mapped onto a 270° dial.
  const angle = -135 + Math.min(1, Math.max(0, (pressure - 960) / 100)) * 270;
  return (
    <Panel title="Pressure">
      <div className="relative mx-auto size-24">
        {Array.from({ length: 28 }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static ticks
            key={i}
            className="absolute inset-0 flex justify-center"
            style={{ rotate: `${-135 + i * 10}deg` }}
          >
            <span className="h-2 w-px bg-foreground/25" />
          </span>
        ))}
        <span
          className="absolute inset-0 flex justify-center"
          style={{ rotate: `${angle}deg` }}
        >
          <span className="h-4 w-1 rounded-full bg-foreground" />
        </span>
        <p className="absolute inset-0 grid place-items-center text-center text-lg leading-none font-light tabular-nums">
          <span>
            {imperial ? (pressure * 0.02953).toFixed(2) : round(pressure)}
            <span className="block text-[10px] text-muted-foreground">
              {imperial ? "inHg" : "hPa"}
            </span>
          </span>
        </p>
      </div>
      <Note>
        {pressure < 1005
          ? "Low pressure — unsettled."
          : pressure > 1022
            ? "High pressure — settled."
            : "Normal pressure."}
      </Note>
    </Panel>
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
  const sunX = 10 + t * 80;
  const sunY = 50 - 152 * t * (1 - t);
  const dayLength = set - rise;
  return (
    <Panel title={up ? "Sunset" : "Sunrise"} className="col-span-2">
      <div className="flex items-end justify-between gap-4">
        <Big>{clockLabel(up ? today.sunset : today.sunrise)}</Big>
        <p className="pb-1 text-xs text-muted-foreground tabular-nums">
          {Math.floor(dayLength / 60)}h {dayLength % 60}m of daylight
        </p>
      </div>
      <svg viewBox="0 0 100 56" className="mx-auto w-full max-w-72" aria-hidden>
        <defs>
          <linearGradient id="sun-arc" x1="0" x2="1">
            <stop offset="0" stopColor="#fdba74" />
            <stop offset="0.5" stopColor="#fde68a" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="0.5"
        />
        <path
          d="M10 50 Q50 -26 90 50"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1"
          strokeDasharray="1.5 2"
        />
        <path
          d="M10 50 Q50 -26 90 50"
          fill="none"
          stroke="url(#sun-arc)"
          strokeWidth="1.5"
          pathLength={1}
          strokeDasharray={`${t} 1`}
        />
        {up ? (
          <>
            <circle
              cx={sunX}
              cy={sunY}
              r="6"
              fill="#fde68a"
              fillOpacity="0.25"
            />
            <circle cx={sunX} cy={sunY} r="3" fill="#fde68a" />
          </>
        ) : null}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>↑ {clockLabel(today.sunrise)}</span>
        <span>↓ {clockLabel(today.sunset)}</span>
      </div>
    </Panel>
  );
}

export function MoonTile({ forecast }: TileProps) {
  const phase = moonPhase(new Date(`${forecast.current.time}:00Z`));
  const moon = moonInfo(phase);
  const illumination = round((1 - Math.cos(phase * 2 * Math.PI)) * 50);
  const toFull = round(((0.5 - phase + 1) % 1) * 29.53);
  return (
    <Panel title="Moon">
      <div className="flex items-center gap-2">
        <img
          src={moon.icon}
          alt=""
          width={56}
          height={56}
          className="-my-2 size-14"
        />
        <Big>{illumination}%</Big>
      </div>
      <p className="text-sm font-medium">{moon.label}</p>
      <Note>
        {toFull === 0 ? "Full moon tonight." : `Full moon in ${toFull} days.`}
      </Note>
    </Panel>
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
  return (
    <Panel title="Precipitation">
      <Big>
        {amount(today?.precipSum ?? 0)}{" "}
        <span className="text-lg text-muted-foreground">{u.precip}</span>
      </Big>
      <p className="-mt-2 text-sm font-medium">Expected today</p>
      <Note>
        {tomorrow
          ? `${amount(tomorrow.precipSum)} ${u.precip} tomorrow, ${tomorrow.precipChance}% chance.`
          : null}
      </Note>
    </Panel>
  );
}
