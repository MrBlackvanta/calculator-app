import { selectTheme } from "@/lib/theme";
import { setPrefersLight } from "@/test/match-media";
import { afterEach, describe, expect, it, vi } from "vitest";

class FakeParam {
  value = 0;
  readonly ramps: number[] = [];

  setValueAtTime(value: number) {
    this.value = value;
    return this;
  }

  exponentialRampToValueAtTime(value: number) {
    this.ramps.push(value);
    return this;
  }
}

class FakeNode {
  connect(target: unknown) {
    return target;
  }

  disconnect() {}
}

class FakeOscillator extends FakeNode {
  readonly frequency = new FakeParam();
  readonly type: string;
  onended: (() => void) | null = null;
  started: number | null = null;
  stopped: number | null = null;

  constructor(_context: unknown, options: { type: string }) {
    super();
    this.type = options.type;
  }

  start(when: number) {
    this.started = when;
  }

  stop(when: number) {
    this.stopped = when;
  }
}

class FakeFilter extends FakeNode {
  readonly type: string;
  readonly frequency: number;

  constructor(_context: unknown, options: { type: string; frequency: number }) {
    super();
    this.type = options.type;
    this.frequency = options.frequency;
  }
}

class FakeGain extends FakeNode {
  readonly gain = new FakeParam();
}

type Engine = {
  play: () => void;
  tones: FakeOscillator[];
  gains: FakeGain[];
  contexts: number;
  resumes: number;
};

async function startEngine(state: AudioContextState = "running") {
  const tones: FakeOscillator[] = [];
  const gains: FakeGain[] = [];
  const engine = { tones, gains, contexts: 0, resumes: 0 } as Engine;

  class FakeContext {
    readonly destination = {};
    readonly currentTime = 0;
    state = state;

    constructor() {
      engine.contexts += 1;
    }

    resume() {
      engine.resumes += 1;
      this.state = "running";
      return Promise.resolve();
    }
  }

  vi.stubGlobal("AudioContext", FakeContext);
  vi.stubGlobal(
    "OscillatorNode",
    class extends FakeOscillator {
      constructor(context: unknown, options: { type: string }) {
        super(context, options);
        tones.push(this);
      }
    },
  );
  vi.stubGlobal("BiquadFilterNode", FakeFilter);
  vi.stubGlobal(
    "GainNode",
    class extends FakeGain {
      constructor() {
        super();
        gains.push(this);
      }
    },
  );

  vi.resetModules();
  engine.play = (await import("@/lib/keypress-sound")).playKeypress;
  return engine;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("playKeypress", () => {
  it("stays silent on a browser with no audio engine", async () => {
    vi.resetModules();
    vi.stubGlobal("AudioContext", undefined);
    const { playKeypress } = await import("@/lib/keypress-sound");
    expect(() => playKeypress()).not.toThrow();
  });

  it("gives every theme a voice of its own", async () => {
    const engine = await startEngine();
    for (const theme of ["1", "2", "3"] as const) {
      selectTheme(theme);
      engine.play();
    }
    const voices = engine.tones.map(
      (tone) => `${tone.type}:${tone.frequency.value}`,
    );
    expect(new Set(voices).size).toBe(3);
  });

  it("voices the system preference when no theme has been chosen", async () => {
    const engine = await startEngine();
    selectTheme("2");
    engine.play();
    delete document.documentElement.dataset.theme;
    setPrefersLight(true);
    engine.play();
    const [chosen, inherited] = engine.tones;
    expect(inherited.type).toBe(chosen.type);
    expect(inherited.frequency.value).toBe(chosen.frequency.value);
  });

  it("opens its envelope and closes it again inside the press", async () => {
    const engine = await startEngine();
    engine.play();
    const [envelope] = engine.gains;
    const [peak, tail] = envelope.gain.ramps;
    expect(peak).toBeGreaterThan(envelope.gain.value);
    expect(tail).toBeLessThan(peak);
    expect(engine.tones[0].stopped).toBeGreaterThan(engine.tones[0].started!);
  });

  it("builds one audio context however many keys are pressed", async () => {
    const engine = await startEngine();
    engine.play();
    engine.play();
    engine.play();
    expect(engine.contexts).toBe(1);
    expect(engine.tones).toHaveLength(3);
  });

  it("resumes a context the browser left suspended", async () => {
    const engine = await startEngine("suspended");
    engine.play();
    engine.play();
    expect(engine.resumes).toBe(1);
  });
});
