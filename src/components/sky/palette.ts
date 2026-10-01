import type { Sky } from "@/lib/wmo";

/** Three-stop vertical gradients, top to bottom, per sky and time of day. */
const PALETTES: Record<Sky, { day: string[]; night: string[] }> = {
  clear: {
    day: ["#1d4ed8", "#3b82f6", "#7dd3fc"],
    night: ["#020617", "#111640", "#2e2a6b"],
  },
  cloudy: {
    day: ["#2c4a7a", "#5577a8", "#9db4d1"],
    night: ["#050a18", "#141d38", "#2a3352"],
  },
  overcast: {
    day: ["#3a4556", "#5d6a7e", "#8e99aa"],
    night: ["#06090f", "#151b26", "#262e3b"],
  },
  fog: {
    day: ["#4b5563", "#7b8494", "#aeb5c0"],
    night: ["#0a0d13", "#1c2029", "#323844"],
  },
  rain: {
    day: ["#1f2a3a", "#36475d", "#5c6f86"],
    night: ["#03060c", "#0e1724", "#1d2a3b"],
  },
  snow: {
    day: ["#3b4d66", "#6b81a0", "#a9bad0"],
    night: ["#070b16", "#18213a", "#2d3a58"],
  },
  storm: {
    day: ["#0f1320", "#262a40", "#3f3a5c"],
    night: ["#020308", "#0d0f1c", "#1f1a35"],
  },
};

export function skyGradient(sky: Sky, isDay: boolean) {
  const [top, middle, bottom] = PALETTES[sky][isDay ? "day" : "night"];
  return `linear-gradient(180deg, ${top} 0%, ${middle} 55%, ${bottom} 100%)`;
}
