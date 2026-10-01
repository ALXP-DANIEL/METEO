![METEO](https://raw.githubusercontent.com/ALXP-DANIEL/METEO/master/public/preview.png)

# METEO

Live weather for anywhere on Earth, with a sky that looks like the weather outside.

**[meteo.alifdaniel.dpdns.org](https://meteo.alifdaniel.dpdns.org)**

## Features

- **Living sky:** a canvas backdrop that rains, snows, twinkles or flashes with lightning to match current conditions, day or night.
- **Search:** ⌘K / `/` city search (Open-Meteo geocoding), recent places, and "use my location".
- **Forecast:** current conditions, a 24-hour temperature curve with rain chances, and a 10-day outlook on a shared temperature scale.
- **Details:** wind compass, sunrise/sunset arc, UV, air quality (US AQI), feels-like, humidity, precipitation, visibility, pressure and moon phase.
- **Radar:** animated RainViewer precipitation radar on a MapLibre map, loaded only when scrolled into view.
- **Units:** °C or °F, remembered in a cookie so the server renders the right units.
- **Sharing:** every place gets its own Open Graph image.

## Stack

Next.js 16 (App Router, React Compiler) · React 19 · TypeScript · Tailwind CSS 4 · MapLibre GL · cmdk · Biome.

No API keys are needed. Weather, air quality and geocoding come from [Open-Meteo](https://open-meteo.com), radar from [RainViewer](https://www.rainviewer.com), reverse geocoding from BigDataCloud, the basemap from CARTO, and the animated icons from [Meteocons](https://meteocons.com) by Bas Milius (MIT).

## Develop

```bash
npm install
npm run dev
```

`npm run lint` runs Biome, and `npm run typecheck` runs TypeScript.
