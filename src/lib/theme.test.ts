import {
  readTheme,
  selectTheme,
  subscribeToTheme,
  THEME_PREPAINT_SCRIPT,
} from "@/lib/theme";
import { mediaListenerCount, setPrefersLight } from "@/test/match-media";
import { describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "calc-theme";

function runPrepaintScript() {
  new Function(THEME_PREPAINT_SCRIPT)();
}

describe("THEME_PREPAINT_SCRIPT", () => {
  it("applies a stored theme before React runs", () => {
    localStorage.setItem(STORAGE_KEY, "3");
    runPrepaintScript();
    expect(document.documentElement.dataset.theme).toBe("3");
  });

  it("leaves the system preference alone when nothing is stored", () => {
    runPrepaintScript();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("ignores a stored value outside the theme set", () => {
    localStorage.setItem(STORAGE_KEY, "4");
    runPrepaintScript();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});

describe("readTheme", () => {
  it("prefers the applied attribute over the system preference", () => {
    setPrefersLight(true);
    document.documentElement.dataset.theme = "3";
    expect(readTheme()).toBe("3");
  });

  it("falls back to the light theme when the system prefers light", () => {
    setPrefersLight(true);
    expect(readTheme()).toBe("2");
  });

  it("falls back to the dark theme otherwise", () => {
    expect(readTheme()).toBe("1");
  });
});

describe("subscribeToTheme", () => {
  it("reports a change of system preference", () => {
    const onStoreChange = vi.fn();
    const unsubscribe = subscribeToTheme(onStoreChange);

    setPrefersLight(true);

    expect(onStoreChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("detaches every listener it attached", () => {
    const onStoreChange = vi.fn();
    subscribeToTheme(onStoreChange)();

    expect(mediaListenerCount()).toBe(0);

    setPrefersLight(true);
    selectTheme("3");
    window.dispatchEvent(new Event("storage"));

    expect(onStoreChange).not.toHaveBeenCalled();
  });
});

describe("selectTheme", () => {
  it("applies, persists and announces the choice", () => {
    const onStoreChange = vi.fn();
    const unsubscribe = subscribeToTheme(onStoreChange);

    selectTheme("2");

    expect(document.documentElement.dataset.theme).toBe("2");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("2");
    expect(onStoreChange).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("still applies the theme when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    expect(() => selectTheme("3")).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe("3");
  });
});
