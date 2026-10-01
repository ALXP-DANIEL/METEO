import { longDate, round, unitLabels } from "@/lib/format";
import type { Forecast } from "@/lib/weather";
import { condition, iconFor } from "@/lib/wmo";

export default function Hero({ forecast }: { forecast: Forecast }) {
  const { current, place, daily, units } = forecast;
  const today = daily[0];
  const u = unitLabels(units);

  return (
    <header className="flex flex-col gap-2">
      <p className="eyebrow">{longDate(current.time)}</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {place.name}
      </h1>
      {place.region ? (
        <p className="-mt-1 text-sm text-ink-soft">{place.region}</p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <p className="text-[clamp(6rem,22vw,10rem)] leading-[0.8] font-extralight tracking-tighter tabular-nums">
          {round(current.temperature)}
          <span className="align-top text-[0.4em] font-light text-ink-soft">
            °
          </span>
        </p>
        <img
          src={iconFor(current.code, current.isDay)}
          alt=""
          width={160}
          height={160}
          className="-ml-4 size-32 drop-shadow-2xl sm:size-40"
        />
      </div>

      <p className="text-xl font-medium">{condition(current.code).label}</p>
      <p className="text-sm text-ink-soft tabular-nums">
        Feels like {round(current.feelsLike)}
        {u.temp}
        {today ? (
          <>
            {" · "}H {round(today.max)}° L {round(today.min)}°
          </>
        ) : null}
      </p>
    </header>
  );
}
