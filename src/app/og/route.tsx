import { ImageResponse } from "next/og";
import { round } from "@/lib/format";
import { DEFAULT_PLACE, getForecast } from "@/lib/weather";
import { condition, iconFor } from "@/lib/wmo";

/** Share card in the app's monochrome style: place, temperature, sky. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat") ?? DEFAULT_PLACE.lat);
  const lon = Number(url.searchParams.get("lon") ?? DEFAULT_PLACE.lon);
  const name = url.searchParams.get("name") ?? DEFAULT_PLACE.name;
  const forecast = await getForecast({ name, region: "", lat, lon }, "metric");
  const { current, daily } = forecast;
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
        color: "#0a0a0a",
        background: "#fafafa",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}
      >
        <div
          style={{
            display: "flex",
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "#0a0a0a",
          }}
        />
        METEO
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: -1 }}>
            {name.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 220,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -10,
            }}
          >
            {`${round(current.temperature)}°`}
          </div>
        </div>
        <img src={icon} width={300} height={300} alt="" />
      </div>
      <div style={{ display: "flex", fontSize: 32, color: "#737373" }}>
        {`${condition(current.code).label} · H ${round(daily[0]?.max ?? 0)}° · L ${round(daily[0]?.min ?? 0)}°`}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
