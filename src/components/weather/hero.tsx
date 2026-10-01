import DecryptText from "@/components/chrome/decrypt-text";
import { longDate, round, unitLabels } from "@/lib/format";
import type { Forecast } from "@/lib/weather";
import { condition, iconFor } from "@/lib/wmo";

export default function Hero({ forecast }: { forecast: Forecast }) {
  const { current, place, daily, units } = forecast;
  const today = daily[0];
  const u = unitLabels(units);

  return (
    <header className="flex flex-col gap-1">
      <p className="eyebrow">{longDate(current.time)}</p>
      <h1 className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
        <DecryptText text={place.name.toUpperCase()} />
      </h1>
      {place.region ? (
        <p className="font-mono text-xs text-muted-foreground">
          {place.region}
        </p>
      ) : null}

      <div className="mt-3 flex items-center">
        <p className="font-mono text-[clamp(5.5rem,20vw,8.5rem)] leading-[0.85] font-semibold tracking-tighter tabular-nums">
          <DecryptText text={`${round(current.temperature)}°`} speed={0.12} />
        </p>
        <img
          src={iconFor(current.code, current.isDay)}
          alt=""
          width={150}
          height={150}
          className="-ml-2 size-32 sm:size-36"
        />
      </div>

      <p className="mt-1 text-lg font-medium">
        {condition(current.code).label}
      </p>
      <p className="font-mono text-xs text-muted-foreground tabular-nums">
        Feels {round(current.feelsLike)}
        {u.temp}
        {today ? ` · H ${round(today.max)}° · L ${round(today.min)}°` : null}
      </p>
    </header>
  );
}
