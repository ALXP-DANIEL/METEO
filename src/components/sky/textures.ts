import * as THREE from "three";

/** A soft, lumpy cloud puff: many overlapping radial blobs on a canvas. */
export function cloudTexture(seed = 1) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 26; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * size * 0.22;
      const x = size / 2 + Math.cos(angle) * dist * 1.4;
      const y = size / 2 + Math.sin(angle) * dist * 0.7;
      const r = size * (0.12 + rand() * 0.16);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(0.6, "rgba(255,255,255,0.18)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A radial glow for the sun, the moon's halo and lightning. */
export function glowTexture(inner: string, outer: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, inner);
    g.addColorStop(0.18, inner);
    g.addColorStop(0.35, outer);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** The moon: a lit disc with soft maria. */
export function moonTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const c = size / 2;
    const disc = ctx.createRadialGradient(c * 0.8, c * 0.8, 0, c, c, c * 0.5);
    disc.addColorStop(0, "#fffef5");
    disc.addColorStop(1, "#d9dce6");
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(c, c, c * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(150,155,175,0.25)";
    for (const [x, y, r] of [
      [0.9, 0.85, 0.12],
      [1.1, 1.05, 0.08],
      [0.85, 1.12, 0.06],
      [1.12, 0.82, 0.05],
    ] as const) {
      ctx.beginPath();
      ctx.arc(c * x, c * y, c * r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
