import { hourLabel, round } from "@/lib/format";
import type { Hour } from "@/lib/weather";
import { iconFor } from "@/lib/wmo";
import Panel from "./panel";

const COL = 64;
const CURVE_H = 56;
const TOP = 22;

/** Next 24 hours: icons, a smooth temperature line and rain chances. */
export default function Hourly({
  hours,
  summary,
}: {
  hours: Hour[];
  summary: string;
}) {
  const temps = hours.map((h) => h.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;
  const width = hours.length * COL;
  const points = hours.map((h, i) => ({
    x: i * COL + COL / 2,
    y: TOP + (1 - (h.temperature - min) / span) * (CURVE_H - 12),
  }));

  // Catmull-Rom to cubic Bézier for a smooth curve through every point.
  let path = "";
  points.forEach((p, i) => {
    if (i === 0) {
      path = `M ${p.x} ${p.y}`;
      return;
    }
    const p0 = points[i - 2] ?? points[i - 1]!;
    const p1 = points[i - 1]!;
    const p3 = points[i + 1] ?? p;
    const c1x = p1.x + (p.x - p0.x) / 6;
    const c1y = p1.y + (p.y - p0.y) / 6;
    const c2x = p.x - (p3.x - p1.x) / 6;
    const c2y = p.y - (p3.y - p1.y) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p.x} ${p.y}`;
  });
  const area = `${path} L ${width - COL / 2} ${TOP + CURVE_H} L ${COL / 2} ${TOP + CURVE_H} Z`;

  return (
    <Panel title="Next 24 hours" className="gap-2">
      <p className="text-sm text-ink-soft">{summary}</p>
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
        <div className="relative" style={{ width }}>
          <div className="flex">
            {hours.map((hour, i) => (
              <div
                key={hour.time}
                className="flex shrink-0 flex-col items-center gap-1 text-center"
                style={{ width: COL }}
              >
                <span className="text-xs text-ink-soft">
                  {i === 0 ? "Now" : hourLabel(hour.time)}
                </span>
                <img
                  src={iconFor(hour.code, hour.isDay)}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11"
                />
                <span className="h-4 text-[11px] font-medium text-sky-200 tabular-nums">
                  {hour.precipChance >= 20 ? `${hour.precipChance}%` : ""}
                </span>
              </div>
            ))}
          </div>
          <svg
            width={width}
            height={TOP + CURVE_H}
            className="block overflow-visible"
            aria-hidden
          >
            <defs>
              <linearGradient id="hourly-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="white" stopOpacity="0.22" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#hourly-fill)" />
            <path
              d={path}
              fill="none"
              stroke="white"
              strokeOpacity="0.85"
              strokeWidth="2"
            />
            {points.map((p, i) => (
              <g key={hours[i]!.time}>
                <circle cx={p.x} cy={p.y} r={i === 0 ? 4 : 2.5} fill="white" />
                <text
                  x={p.x}
                  y={p.y - 9}
                  textAnchor="middle"
                  className="fill-white text-[13px] font-semibold tabular-nums"
                >
                  {round(hours[i]!.temperature)}°
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </Panel>
  );
}
