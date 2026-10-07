const STORAGE_KEY = "calc-theme";
const LIGHT_QUERY = "(prefers-color-scheme: light)";
const CHANGE_EVENT = "calc:themechange";

export const THEMES = ["1", "2", "3"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_PREPAINT_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="1"||t==="2"||t==="3")document.documentElement.dataset.theme=t}catch(e){}`;

function isTheme(value: string | undefined): value is Theme {
  return value === "1" || value === "2" || value === "3";
}

export function subscribeToTheme(onStoreChange: () => void) {
  const media = window.matchMedia(LIGHT_QUERY);
  media.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    media.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function readTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (isTheme(chosen)) return chosen;
  return window.matchMedia(LIGHT_QUERY).matches ? "2" : "1";
}

export function readPrerenderedTheme(): Theme {
  return "1";
}

export function selectTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    void 0;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function syncThemeColor() {
  const page = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-page")
    .trim();
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", page));
}
