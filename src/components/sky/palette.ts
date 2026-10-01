import type { Sky } from "@/lib/wmo";

type Stops = [string, string, string];

/**
 * Sky gradients, top to bottom. Dark theme gets the deep, saturated sky;
 * light theme a pale wash of the same mood that settles into the page
 * background so black text stays crisp.
 */
const PALETTES: Record<
  Sky,
  Record<"light" | "dark", { day: Stops; night: Stops }>
> = {
  clear: {
    light: {
      day: ["#78b6f4", "#b7d9fb", "#f3f8fe"],
      night: ["#9299d6", "#c3c6ea", "#f1f1fa"],
    },
    dark: {
      day: ["#1d4ed8", "#2f6fe0", "#4b8fd6"],
      night: ["#020617", "#111640", "#2e2a6b"],
    },
  },
  cloudy: {
    light: {
      day: ["#a3c1e3", "#cddcee", "#f3f6fa"],
      night: ["#a3a8c6", "#cacde0", "#f2f2f7"],
    },
    dark: {
      day: ["#2c4a7a", "#45648f", "#6a86a8"],
      night: ["#050a18", "#141d38", "#2a3352"],
    },
  },
  overcast: {
    light: {
      day: ["#b1bac7", "#d3d8df", "#f4f5f6"],
      night: ["#a9aebb", "#ccd0d8", "#f2f3f5"],
    },
    dark: {
      day: ["#3a4556", "#4f5b6d", "#6c7788"],
      night: ["#06090f", "#151b26", "#262e3b"],
    },
  },
  fog: {
    light: {
      day: ["#c0c5cb", "#dadde1", "#f5f5f6"],
      night: ["#b6bac2", "#d4d7dc", "#f3f4f5"],
    },
    dark: {
      day: ["#4b5563", "#626b79", "#7e8693"],
      night: ["#0a0d13", "#1c2029", "#323844"],
    },
  },
  rain: {
    light: {
      day: ["#8aa1bd", "#b9c8da", "#f0f3f7"],
      night: ["#868fab", "#b5bacd", "#eff0f5"],
    },
    dark: {
      day: ["#1f2a3a", "#2e3d50", "#46586e"],
      night: ["#03060c", "#0e1724", "#1d2a3b"],
    },
  },
  snow: {
    light: {
      day: ["#b9cde6", "#dbe6f3", "#f8fbff"],
      night: ["#aab5d3", "#d0d7ea", "#f5f7fc"],
    },
    dark: {
      day: ["#3b4d66", "#566c8b", "#7d93b1"],
      night: ["#070b16", "#18213a", "#2d3a58"],
    },
  },
  storm: {
    light: {
      day: ["#8784a6", "#b3b0c8", "#efeef4"],
      night: ["#7d7a9c", "#aaa7c1", "#edecf3"],
    },
    dark: {
      day: ["#0f1320", "#262a40", "#3f3a5c"],
      night: ["#020308", "#0d0f1c", "#1f1a35"],
    },
  },
};

export function skyGradient(sky: Sky, isDay: boolean, theme: "light" | "dark") {
  const [top, middle, bottom] = PALETTES[sky][theme][isDay ? "day" : "night"];
  return `linear-gradient(180deg, ${top} 0%, ${middle} 45%, ${bottom} 100%)`;
}
