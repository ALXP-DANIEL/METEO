"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Panel from "@/components/weather/panel";

const RadarMap = dynamic(() => import("./radar-map"), { ssr: false });

/** Loads the map (and its ~800 kB of MapLibre) only once it nears the viewport. */
export default function Radar({ lat, lon }: { lat: number; lon: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Panel
      title="Precipitation radar"
      className="col-span-full overflow-hidden p-0 sm:p-0 [&>h2]:px-4 [&>h2]:pt-4 sm:[&>h2]:px-5 sm:[&>h2]:pt-5"
    >
      <div ref={ref} className="h-96 sm:h-[28rem]">
        {show ? <RadarMap key={`${lat},${lon}`} lat={lat} lon={lon} /> : null}
      </div>
    </Panel>
  );
}
