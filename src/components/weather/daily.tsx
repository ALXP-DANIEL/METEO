import { round, tempColor, weekday } from "@/lib/format";
import type { Day, Units } from "@/lib/weather";
import { iconFor } from "@/lib/wmo";
import Panel from "./panel";

type DailyProps = {
  days: Day[];
  units: Units;
  currentTemp: number;
};

/** Ten-day outlook with range bars on one shared temperature scale. */
export default function Daily({ days, units, currentTemp }: DailyProps) {
  const low = Math.min(...days.map((d) => d.min));
  const high = Math.max(...days.map((d) => d.max));
  const span = high - low || 1;
  const pct = (value: number) => ((value - low) / span) * 100;

  return (
    <Panel title={`${days.length}-day forecast`}>
      <ul className="flex flex-col">
        {days.map((day, i) => (
          <li
            key={day.date}
            className="grid grid-cols-[3.5rem_2.5rem_2.5rem_2.25rem_1fr_2.25rem] items-center gap-2 border-t border-border py-2 first:border-t-0 sm:gap-3"
          >
            <span className="text-sm font-medium">{weekday(day.date, i)}</span>
            <img
              src={iconFor(day.code, true)}
              alt=""
              width={40}
              height={40}
              className="size-10"
            />
            <span className="text-[11px] font-medium text-sky-600 dark:text-sky-300 tabular-nums">
              {day.precipChance >= 20 ? `${day.precipChance}%` : ""}
            </span>
            <span className="text-right text-sm text-muted-foreground/70 tabular-nums">
              {round(day.min)}°
            </span>
            <div className="relative h-1.5 rounded-full bg-muted">
              <div
                className="absolute inset-y-0 rounded-full"
                style={{
                  left: `${pct(day.min)}%`,
                  right: `${100 - pct(day.max)}%`,
                  background: `linear-gradient(90deg, ${tempColor(day.min, units)}, ${tempColor(day.max, units)})`,
                }}
              />
              {i === 0 ? (
                <div
                  className="absolute top-1/2 size-2.5 -translate-1/2 rounded-full border-2 border-card bg-foreground"
                  style={{
                    left: `${Math.min(100, Math.max(0, pct(currentTemp)))}%`,
                  }}
                />
              ) : null}
            </div>
            <span className="text-sm font-medium tabular-nums">
              {round(day.max)}°
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
