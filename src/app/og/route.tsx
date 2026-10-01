import { ImageResponse } from "next/og";
import { skyGradient } from "@/components/sky/palette";
import { round } from "@/lib/format";
import { DEFAULT_PLACE, getForecast } from "@/lib/weather";
import { condition, iconFor } from "@/lib/wmo";

/** Share card: the place, its temperature and sky, painted like the app. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat") ?? DEFAULT_PLACE.lat);
  const lon = Number(url.searchParams.get("lon") ?? DEFAULT_PLACE.lon);
  const name = url.searchParams.get("name") ?? DEFAULT_PLACE.name;
  const forecast = await getForecast({ name, region: "", lat, lon }, "metric");
  const { current, daily } = forecast;
  const c = condition(current.code);
  const icon = `${url.origin}${iconFor(current.code, current.isDay)}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "white",
        backgroundImage: skyGradient(c.sky, current.isDay),
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          letterSpacing: 10,
          opacity: 0.7,
        }}
      >
        METEO
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 600 }}>{name}</div>
          <div
            style={{
              fontSize: 220,
              fontWeight: 200,
              lineHeight: 1,
              letterSpacing: -8,
            }}
          >
            {`${round(current.temperature)}°`}
          </div>
        </div>
        <img src={icon} width={300} height={300} alt="" />
      </div>
      <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>
        {`${c.label} · H ${round(daily[0]?.max ?? 0)}° L ${round(daily[0]?.min ?? 0)}°`}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
