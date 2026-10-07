const changeListeners = new Set<() => void>();
let prefersLight = false;

export function installMatchMedia() {
  changeListeners.clear();
  prefersLight = false;
  window.matchMedia = ((media: string) => ({
    media,
    get matches() {
      return prefersLight;
    },
    addEventListener: (_type: "change", listener: () => void) => {
      changeListeners.add(listener);
    },
    removeEventListener: (_type: "change", listener: () => void) => {
      changeListeners.delete(listener);
    },
  })) as typeof window.matchMedia;
}

export function setPrefersLight(value: boolean) {
  prefersLight = value;
  changeListeners.forEach((listener) => listener());
}

export function mediaListenerCount() {
  return changeListeners.size;
}
