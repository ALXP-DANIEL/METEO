![METEO](https://raw.githubusercontent.com/ALXP-DANIEL/METEO/master/metadata/picture/thumbnail.jpeg)

# METEO

Live weather for anywhere on Earth, set in a 3D sky that matches the weather outside.

**[meteo.alifdaniel.dpdns.org](https://meteo.alifdaniel.dpdns.org)**

![METEO at night in the rain](https://raw.githubusercontent.com/ALXP-DANIEL/METEO/master/metadata/picture/preview-2.jpeg)

## Features

- **3D sky.** A three.js scene behind the app renders the real weather:
  - drifting cloud banks at depth
  - rain from drizzle to downpour, slanted by the actual wind
  - sleet, hail, snow and rolling fog
  - stars and the moon at night
  - lightning that lights up the clouds
- **Light and dark.** Each has its own sky gradient for every condition, day or night.
- **Search.** Press ⌘K or `/` to search for a city (Open-Meteo geocoding). It also has recent places, one-tap geolocation and a "surprise me" tour of extreme climates.
- **Forecast.** A 24-hour temperature curve with rain chances, and a 10-day outlook on a shared temperature scale.
- **Details.** Wind compass, sunrise/sunset arc, UV, air quality (US AQI), feels-like, humidity, precipitation, visibility, pressure and moon phase, on uniform tiles.
- **Radar.** An animated RainViewer precipitation radar on a MapLibre map that follows the selected place.
- **Intro.** A splash on the first visit of each session, then a staggered entrance with a temperature count-up.
- **Sharing.** Each place gets its own Open Graph image.
- **Units.** °C or °F, remembered in a cookie so the server renders the right units.

Add `?sky=clear|cloudy|overcast|fog|drizzle|rain|downpour|sleet|snow|storm|hail` to any URL to preview a backdrop. Add `&night=1` for the night version.

## Stack

Next.js 16 (App Router, React Compiler) · React 19 · TypeScript · Tailwind CSS 4 · three.js · MapLibre GL · cmdk · Biome.

No API keys are needed:
- Weather, air quality and geocoding: [Open-Meteo](https://open-meteo.com)
- Radar: [RainViewer](https://www.rainviewer.com)
- Reverse geocoding: BigDataCloud
- Basemap: © [CARTO](https://carto.com/attributions) and © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Animated icons: [Meteocons](https://meteocons.com) by Bas Milius (MIT)

## Develop

```bash
npm install
npm run dev
```

`npm run lint` runs Biome, and `npm run typecheck` runs TypeScript.
