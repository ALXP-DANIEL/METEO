"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { Layer, Map as MapView, Marker, Source } from "@vis.gl/react-maplibre";
import { setWorkerUrl } from "maplibre-gl";
import { useEffect, useState } from "react";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

type Frame = { time: number; path: string };

const STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

/** Follows the html.dark class so the basemap matches the theme toggle. */
function useDarkClass() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

/** Live precipitation radar from RainViewer over a theme-matched basemap, animated. */
export default function RadarMap({ lat, lon }: { lat: number; lon: number }) {
  const dark = useDarkClass();
  const [host, setHost] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api.rainviewer.com/public/weather-maps.json", {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(
        (data: {
          host: string;
          radar: { past: Frame[]; nowcast?: Frame[] };
        }) => {
          const all = [...data.radar.past, ...(data.radar.nowcast ?? [])];
          setHost(data.host);
          setFrames(all);
          setIndex(data.radar.past.length - 1);
        },
      )
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % frames.length),
      700,
    );
    return () => window.clearInterval(id);
  }, [playing, frames.length]);

  const frame = frames[index];
  const time = frame
    ? new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(frame.time * 1000)
    : "--:--";

  return (
    <div className="relative h-full">
      <MapView
        initialViewState={{ latitude: lat, longitude: lon, zoom: 6 }}
        mapStyle={dark ? STYLES.dark : STYLES.light}
        maxZoom={10}
        attributionControl={{ compact: true }}
        cooperativeGestures
        style={{ width: "100%", height: "100%" }}
      >
        {/* every frame is mounted so playback only toggles opacity — no flicker */}
        {host
          ? frames.map((f, i) => (
              <Source
                key={f.path}
                id={`radar-${f.time}`}
                type="raster"
                tiles={[`${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`]}
                tileSize={256}
                maxzoom={7}
                attribution='<a href="https://www.rainviewer.com" target="_blank">RainViewer</a>'
              >
                <Layer
                  id={`radar-layer-${f.time}`}
                  type="raster"
                  paint={{
                    "raster-opacity": i === index ? 0.75 : 0,
                    "raster-opacity-transition": { duration: 300 },
                  }}
                />
              </Source>
            ))
          : null}
        <Marker latitude={lat} longitude={lon}>
          <span className="relative flex size-4">
            <span className="absolute inset-0 animate-ping rounded-full bg-foreground/50" />
            <span className="relative size-4 rounded-full border-2 border-card bg-foreground" />
          </span>
        </Marker>
      </MapView>

      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-full border border-border bg-card/85 py-1.5 pr-4 pl-1.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause radar" : "Play radar"}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background"
        >
          {playing ? (
            <PauseIcon weight="fill" className="size-3.5" />
          ) : (
            <PlayIcon weight="fill" className="size-3.5" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(0, frames.length - 1)}
          value={index}
          onChange={(event) => {
            setPlaying(false);
            setIndex(Number(event.target.value));
          }}
          aria-label="Radar time"
          className="h-1 flex-1 cursor-pointer accent-current"
        />
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {time}
        </span>
      </div>
    </div>
  );
}
