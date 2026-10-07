"use client";

import {
  readPrerenderedTheme,
  readTheme,
  selectTheme,
  subscribeToTheme,
  syncThemeColor,
  THEMES,
  type Theme,
} from "@/lib/theme";
import { useEffect, useSyncExternalStore } from "react";

const STOPS: Record<Theme, { label: string; dot: string }> = {
  "1": { label: "left-0.5", dot: "translate-x-0" },
  "2": { label: "left-6.25", dot: "translate-x-5.75" },
  "3": { label: "left-11.75", dot: "translate-x-11.25" },
};

export default function ThemeSwitch() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readTheme,
    readPrerenderedTheme,
  );

  useEffect(() => {
    syncThemeColor();
  }, [theme]);

  return (
    <div className="flex items-center gap-6.5">
      <span id="theme-switch-label" className="text-label tracking-label">
        THEME
      </span>
      <div
        role="radiogroup"
        aria-labelledby="theme-switch-label"
        className="bg-panel group relative h-6.5 w-17.75 rounded-full"
      >
        <span
          className={`bg-marker group-hover:bg-accent-hover absolute bottom-1.25 left-1.25 size-4 rounded-full transition duration-200 motion-reduce:transition-none ${STOPS[theme].dot}`}
        />
        {THEMES.map((value) => (
          <label
            key={value}
            className={`has-focus-visible:outline-ink absolute -top-4 flex h-10.5 w-5.5 justify-center has-focus-visible:outline-2 has-focus-visible:outline-offset-2 ${STOPS[value].label}`}
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => selectTheme(value)}
              aria-label={`Theme ${value}`}
              className="sr-only"
            />
            <span className="text-label">{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
