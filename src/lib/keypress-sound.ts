import { readTheme, type Theme } from "@/lib/theme";

type Voice = {
  wave: OscillatorType;
  fromHz: number;
  toHz: number;
  cutoffHz: number;
  peak: number;
  seconds: number;
};

const VOICES: Record<Theme, Voice> = {
  "1": {
    wave: "triangle",
    fromHz: 260,
    toHz: 130,
    cutoffHz: 1500,
    peak: 0.1,
    seconds: 0.09,
  },
  "2": {
    wave: "square",
    fromHz: 1500,
    toHz: 900,
    cutoffHz: 5200,
    peak: 0.03,
    seconds: 0.04,
  },
  "3": {
    wave: "sawtooth",
    fromHz: 420,
    toHz: 1250,
    cutoffHz: 2400,
    peak: 0.05,
    seconds: 0.13,
  },
};

const ATTACK_SECONDS = 0.002;
const SILENCE = 0.0001;

let shared: AudioContext | null = null;

function activeContext() {
  if (typeof AudioContext === "undefined") return null;
  shared ??= new AudioContext();
  if (shared.state === "suspended") void shared.resume();
  return shared;
}

export function playKeypress() {
  const audio = activeContext();
  if (!audio) return;

  const voice = VOICES[readTheme()];
  const start = audio.currentTime;
  const end = start + voice.seconds;

  const tone = new OscillatorNode(audio, { type: voice.wave });
  tone.frequency.setValueAtTime(voice.fromHz, start);
  tone.frequency.exponentialRampToValueAtTime(voice.toHz, end);

  const body = new BiquadFilterNode(audio, {
    type: "lowpass",
    frequency: voice.cutoffHz,
  });

  const envelope = new GainNode(audio);
  envelope.gain.setValueAtTime(SILENCE, start);
  envelope.gain.exponentialRampToValueAtTime(
    voice.peak,
    start + ATTACK_SECONDS,
  );
  envelope.gain.exponentialRampToValueAtTime(SILENCE, end);

  tone.connect(body).connect(envelope).connect(audio.destination);
  tone.onended = () => envelope.disconnect();
  tone.start(start);
  tone.stop(end);
}
