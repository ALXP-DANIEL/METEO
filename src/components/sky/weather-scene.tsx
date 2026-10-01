"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Sky } from "@/lib/wmo";
import { cloudTexture, glowTexture, moonTexture } from "./textures";

type WeatherSceneProps = {
  sky: Sky;
  isDay: boolean;
  cloudCover: number;
  /** 0–360°, the direction rain and clouds are pushed toward. */
  windDirection: number;
  windSpeed: number;
  /** The WMO code, for precipitation type and intensity. */
  code: number;
  onFlash: () => void;
};

const RAIN_VERT = /* glsl */ `
  attribute float aOffset;
  attribute float aEnd;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec2 uWind;
  uniform float uHeight;
  uniform float uLen;
  varying float vEnd;
  varying float vDepth;
  void main() {
    vec3 p = position;
    float fall = mod(p.y - uTime * uSpeed * (0.8 + aOffset * 0.4) + uHeight * 0.5, uHeight) - uHeight * 0.5;
    p.y = fall;
    p.xz += uWind * (fall / uHeight);
    // the tail of each streak trails up and against the wind
    p.y += aEnd * uLen;
    p.xz -= uWind * aEnd * 0.04;
    vEnd = aEnd;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = clamp(1.0 + mv.z / 60.0, 0.15, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const RAIN_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vEnd;
  varying float vDepth;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity * vDepth * (1.0 - vEnd));
  }
`;

const SNOW_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uHeight;
  uniform float uPixelRatio;
  uniform vec2 uWind;
  uniform float uFall;
  uniform float uSize;
  uniform float uSway;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float speed = (1.2 + aSeed * 1.6) * uFall;
    p.y = mod(p.y - uTime * speed + uHeight * 0.5, uHeight) - uHeight * 0.5;
    p.x += sin(uTime * 0.6 + aSeed * 40.0) * 1.2 * uSway + uWind.x * 0.15 * (p.y / uHeight);
    p.z += cos(uTime * 0.5 + aSeed * 23.0) * 0.8 * uSway;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.0 + aSeed * 4.0) * uSize * uPixelRatio * (30.0 / -mv.z);
    vAlpha = clamp(1.0 + mv.z / 70.0, 0.2, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const SNOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d);
    gl_FragColor = vec4(uColor, a * vAlpha * 0.9);
  }
`;

const STAR_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.45 + 0.55 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 60.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (1.0 + aSeed * 2.2) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;
const STAR_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vTwinkle * uOpacity);
  }
`;

/**
 * The 3D weather: banks of drifting clouds at different depths, GPU rain
 * streaks and snowflakes falling through the volume with the real wind,
 * a twinkling star dome, a glowing sun or moon, and lightning that lights
 * the clouds from inside. The camera leans with the pointer and scroll.
 */
export default function WeatherScene({
  sky,
  isDay,
  cloudCover,
  windDirection,
  windSpeed,
  code,
  onFlash,
}: WeatherSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef(onFlash);
  flashRef.current = onFlash;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const density = coarse ? 0.45 : 1;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    const root = document.documentElement;
    const isDark = () => root.classList.contains("dark");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !coarse,
        powerPreference: "low-power",
      });
    } catch {
      return; // no WebGL: the CSS gradient alone still looks right
    }
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      host.clientWidth / host.clientHeight,
      0.1,
      400,
    );
    camera.position.set(0, 0, 10);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T) => {
      disposables.push(item);
      return item;
    };

    // Wind in scene units: x across the screen, z toward/away from the viewer.
    const windRad = ((windDirection + 180) * Math.PI) / 180;
    const windStrength = Math.min(1, windSpeed / 40);
    const wind = new THREE.Vector2(
      Math.sin(windRad),
      -Math.cos(windRad),
    ).multiplyScalar(6 + windStrength * 14);

    const rainy = sky === "rain" || sky === "storm";
    const snowy = sky === "snow";
    const storm = sky === "storm";
    const freezing = [56, 57, 66, 67].includes(code);
    const hail = code === 96 || code === 99;
    // 0–1: drizzle is a fine mist of streaks, a downpour a dense sheet.
    const intensity = storm
      ? 1
      : code >= 51 && code <= 55
        ? 0.3
        : code === 65 || code === 82
          ? 1
          : code === 63 || code === 81
            ? 0.75
            : 0.55;
    const heavy = sky === "overcast" || sky === "fog" || rainy || snowy;

    /* ---------- stars ---------- */
    let stars: THREE.Points | null = null;
    if (!isDay && (sky === "clear" || sky === "cloudy")) {
      const count = Math.round(1400 * density);
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 0.9);
        const r = 180;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi) * 0.9 - 20;
        positions[i * 3 + 2] =
          -Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 40;
        seeds[i] = Math.random();
      }
      const geometry = track(new THREE.BufferGeometry());
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      const material = track(
        new THREE.ShaderMaterial({
          vertexShader: STAR_VERT,
          fragmentShader: STAR_FRAG,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: pixelRatio },
            uColor: { value: new THREE.Color("#ffffff") },
            uOpacity: { value: sky === "clear" ? 1 : 0.6 },
          },
        }),
      );
      stars = new THREE.Points(geometry, material);
      scene.add(stars);
    }

    /* ---------- sun / moon ---------- */
    const celestial = new THREE.Group();
    celestial.position.set(26, 15, -60);
    scene.add(celestial);
    if (isDay && (sky === "clear" || sky === "cloudy")) {
      const glow = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: track(
              glowTexture("rgba(255,250,225,1)", "rgba(255,200,90,0.35)"),
            ),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      );
      glow.scale.setScalar(sky === "clear" ? 70 : 50);
      celestial.add(glow);
    } else if (!isDay && sky !== "storm" && sky !== "fog") {
      const halo = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: track(
              glowTexture("rgba(220,228,255,0.6)", "rgba(160,175,230,0.12)"),
            ),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      );
      halo.scale.setScalar(36);
      const moon = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: track(moonTexture()),
            transparent: true,
            depthWrite: false,
          }),
        ),
      );
      moon.scale.setScalar(14);
      celestial.add(halo, moon);
    }

    /* ---------- clouds ---------- */
    const cloudTextures = [1, 2, 3, 4].map((seed) => track(cloudTexture(seed)));
    const clouds: {
      sprite: THREE.Sprite;
      speed: number;
      base: number;
      bob: number;
    }[] = [];
    const puffCount = Math.round(
      density *
        (sky === "clear" ? cloudCover / 6 : heavy ? 70 : 20 + cloudCover / 3),
    );
    const cloudBase = new THREE.Color();
    for (let i = 0; i < puffCount; i++) {
      const material = track(
        new THREE.SpriteMaterial({
          map: cloudTextures[i % cloudTextures.length],
          transparent: true,
          depthWrite: false,
          opacity: heavy
            ? 0.55 + Math.random() * 0.3
            : 0.4 + Math.random() * 0.35,
        }),
      );
      const sprite = new THREE.Sprite(material);
      const depth = 15 + Math.random() * 70;
      const spread = depth * 1.3;
      const band = heavy
        ? Math.random() * 0.9 + 0.1
        : Math.random() * 0.5 + 0.35;
      sprite.position.set(
        (Math.random() - 0.5) * spread * 2.4,
        band * depth * 0.55,
        -depth,
      );
      const size = (heavy ? 22 : 16) + Math.random() * 18 + depth * 0.25;
      sprite.scale.set(size * 1.7, size, 1);
      sprite.material.rotation = (Math.random() - 0.5) * 0.3;
      clouds.push({
        sprite,
        speed:
          (0.4 + Math.random() * 0.5) *
          (1 + windStrength * 2) *
          Math.sign(wind.x || 1),
        base: sprite.position.y,
        bob: Math.random() * Math.PI * 2,
      });
      scene.add(sprite);
    }

    /* ---------- rain ---------- */
    const volume = { width: 90, height: 60, depth: 70 };
    let rain: THREE.LineSegments | null = null;
    if (rainy) {
      const count = Math.round(5000 * Math.max(0.25, intensity) * density);
      const positions = new Float32Array(count * 6);
      const offsets = new Float32Array(count * 2);
      const ends = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * volume.width;
        const y = (Math.random() - 0.5) * volume.height;
        const z = -2 - Math.random() * volume.depth;
        const o = Math.random();
        positions.set([x, y, z, x, y, z], i * 6);
        offsets.set([o, o], i * 2);
        ends.set([0, 1], i * 2);
      }
      const geometry = track(new THREE.BufferGeometry());
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
      geometry.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
      const material = track(
        new THREE.ShaderMaterial({
          vertexShader: RAIN_VERT,
          fragmentShader: RAIN_FRAG,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
            uSpeed: { value: 20 + intensity * 24 },
            uWind: { value: wind },
            uHeight: { value: volume.height },
            uLen: { value: 0.45 + intensity * 0.9 },
            uColor: { value: new THREE.Color() },
            uOpacity: { value: 0.55 },
          },
        }),
      );
      rain = new THREE.LineSegments(geometry, material);
      rain.frustumCulled = false;
      scene.add(rain);
    }

    /* ---------- snow, sleet, hail ---------- */
    // One particle system, tuned per kind: snow drifts, sleet falls fast with
    // little sway, hail drops like stones.
    const makeFlakes = (
      count: number,
      fall: number,
      size: number,
      sway: number,
    ) => {
      const n = Math.round(count * density);
      const positions = new Float32Array(n * 3);
      const seeds = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        positions[i * 3] = (Math.random() - 0.5) * volume.width;
        positions[i * 3 + 1] = (Math.random() - 0.5) * volume.height;
        positions[i * 3 + 2] = -2 - Math.random() * volume.depth;
        seeds[i] = Math.random();
      }
      const geometry = track(new THREE.BufferGeometry());
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      const material = track(
        new THREE.ShaderMaterial({
          vertexShader: SNOW_VERT,
          fragmentShader: SNOW_FRAG,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
            uHeight: { value: volume.height },
            uPixelRatio: { value: pixelRatio },
            uWind: { value: wind },
            uFall: { value: fall },
            uSize: { value: size },
            uSway: { value: sway },
            uColor: { value: new THREE.Color("#ffffff") },
          },
        }),
      );
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      scene.add(points);
      return points;
    };
    const flakes: THREE.Points[] = [];
    if (snowy) flakes.push(makeFlakes(2600, 1, 1, 1));
    if (freezing) flakes.push(makeFlakes(1100, 4.5, 0.75, 0.3));
    if (hail) flakes.push(makeFlakes(800, 15, 0.9, 0.05));

    /* ---------- fog ---------- */
    const mists: { sprite: THREE.Sprite; speed: number }[] = [];
    if (sky === "fog") {
      scene.fog = new THREE.Fog("#c9ced6", 6, 75);
      const count = Math.round(26 * (coarse ? 0.6 : 1));
      for (let i = 0; i < count; i++) {
        const material = track(
          new THREE.SpriteMaterial({
            map: cloudTextures[i % cloudTextures.length],
            transparent: true,
            depthWrite: false,
            fog: false,
            opacity: 0.22 + Math.random() * 0.2,
          }),
        );
        const sprite = new THREE.Sprite(material);
        const depth = 6 + Math.random() * 40;
        sprite.position.set(
          (Math.random() - 0.5) * depth * 3,
          -4 - Math.random() * 6 + depth * 0.08,
          -depth,
        );
        sprite.scale.set(40 + Math.random() * 40, 8 + Math.random() * 6, 1);
        mists.push({
          sprite,
          speed: (0.3 + Math.random() * 0.6) * (Math.random() < 0.5 ? -1 : 1),
        });
        scene.add(sprite);
      }
    }

    /* ---------- lightning ---------- */
    const bolt = new THREE.PointLight("#c7d2fe", 0, 0, 0);
    const flashSprite = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: track(
            glowTexture("rgba(225,230,255,1)", "rgba(165,180,252,0.4)"),
          ),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0,
        }),
      ),
    );
    flashSprite.scale.setScalar(90);
    scene.add(bolt, flashSprite);
    let flash = 0;
    let nextStrike = performance.now() + 2500 + Math.random() * 4000;

    /* ---------- interaction ---------- */
    const lean = { x: 0, y: 0, tx: 0, ty: 0, scroll: 0 };
    const onPointer = (event: PointerEvent) => {
      lean.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      lean.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      lean.scroll = Math.min(
        1,
        window.scrollY /
          Math.max(1, document.body.scrollHeight - window.innerHeight),
      );
    };
    const onResize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
      if (reduced) render(performance.now());
    };
    if (!coarse)
      window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    /* ---------- loop ---------- */
    const start = performance.now();
    let last = start;
    let frame = 0;

    const render = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dark = isDark();

      lean.x += (lean.tx - lean.x) * 0.04;
      lean.y += (lean.ty - lean.y) * 0.04;
      camera.position.x = lean.x * 1.6;
      camera.position.y = -lean.y * 0.9 - lean.scroll * 3;
      camera.lookAt(lean.x * 4, -lean.y * 2 + 2 - lean.scroll * 6, -40);

      // cloud tint follows theme, daylight and storminess
      cloudBase.set(
        storm
          ? dark
            ? "#4b4f66"
            : "#9b9db3"
          : !isDay
            ? dark
              ? "#5b6481"
              : "#c2c7dc"
            : heavy
              ? dark
                ? "#8c97a8"
                : "#ffffff"
              : "#ffffff",
      );
      const lit = cloudBase
        .clone()
        .lerp(new THREE.Color("#e0e7ff"), Math.min(1, flash * 1.4));

      for (const cloud of clouds) {
        if (!reduced) {
          cloud.sprite.position.x += cloud.speed * dt;
          cloud.sprite.position.y =
            cloud.base + Math.sin(t * 0.2 + cloud.bob) * 0.4;
          const limit = -cloud.sprite.position.z * 1.6 + 30;
          if (cloud.sprite.position.x > limit) cloud.sprite.position.x = -limit;
          if (cloud.sprite.position.x < -limit) cloud.sprite.position.x = limit;
        }
        cloud.sprite.material.color.copy(lit);
      }

      if (stars) {
        (stars.material as THREE.ShaderMaterial).uniforms.uTime!.value = t;
        (stars.material as THREE.ShaderMaterial).uniforms.uColor!.value.set(
          dark ? "#ffffff" : "#4b5291",
        );
        stars.rotation.y = t * 0.004;
      }
      if (rain) {
        const u = (rain.material as THREE.ShaderMaterial).uniforms;
        u.uTime!.value = reduced ? 0 : t;
        u.uColor!.value.set(dark ? "#c7d7f5" : "#3b5174");
        u.uOpacity!.value = (dark ? 0.3 : 0.22) + intensity * 0.3;
      }
      for (const points of flakes) {
        const u = (points.material as THREE.ShaderMaterial).uniforms;
        u.uTime!.value = reduced ? 0 : t;
        u.uColor!.value.set(dark ? "#ffffff" : "#f8fbff");
      }
      if (scene.fog instanceof THREE.Fog)
        scene.fog.color.set(dark ? "#3a404c" : "#d6dae0");
      for (const mist of mists) {
        if (!reduced) {
          mist.sprite.position.x += mist.speed * dt;
          const limit = -mist.sprite.position.z * 1.6 + 30;
          if (mist.sprite.position.x > limit) mist.sprite.position.x = -limit;
          if (mist.sprite.position.x < -limit) mist.sprite.position.x = limit;
        }
        mist.sprite.material.color.set(dark ? "#9aa3b2" : "#ffffff");
      }
      celestial.position.y = 15 + Math.sin(t * 0.05) * 0.5;

      if (storm && !reduced && now > nextStrike) {
        nextStrike = now + 3500 + Math.random() * 8000;
        flash = 1;
        flashSprite.position.set(
          (Math.random() - 0.5) * 60,
          10 + Math.random() * 15,
          -40 - Math.random() * 30,
        );
        bolt.position.copy(flashSprite.position);
        flashRef.current();
      }
      flash = Math.max(0, flash - dt * 2.6);
      // a double-pulse reads as lightning rather than a fade
      const pulse =
        flash > 0.55 ? flash : flash * (0.6 + 0.4 * Math.sin(flash * 40));
      flashSprite.material.opacity = pulse * 0.9;
      bolt.intensity = pulse * 400;

      renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState === "visible" && !reduced) {
        last = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Re-render once when the theme flips while motion is reduced.
    const observer = new MutationObserver(
      () => reduced && render(performance.now()),
    );
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const item of disposables) item.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [sky, isDay, cloudCover, windDirection, windSpeed, code]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
