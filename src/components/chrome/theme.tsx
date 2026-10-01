"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";

export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const apply = () => {
      const dark = root.classList.toggle("dark");
      try {
        localStorage.setItem("meteo:theme", dark ? "dark" : "light");
      } catch {
        /* preference just won't persist */
      }
    };
    if (
      document.startViewTransition &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.startViewTransition(apply);
    } else apply();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={className}
    >
      <SunIcon weight="bold" className="size-4 dark:hidden" />
      <MoonIcon weight="bold" className="hidden size-4 dark:block" />
    </button>
  );
}
