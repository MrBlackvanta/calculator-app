"use client";

import Keypad from "@/components/keypad";
import Screen from "@/components/screen";
import {
  INITIAL_STATE,
  actionForKey,
  calculatorReducer,
  keyLabelForAction,
  type CalculatorAction,
} from "@/lib/calculator";
import { playKeypress } from "@/lib/keypress-sound";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

const PRESS_MS = 110;

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, INITIAL_STATE);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const release = useRef<number | undefined>(undefined);

  const press = useCallback((action: CalculatorAction) => {
    playKeypress();
    setPressedKey(keyLabelForAction(action));
    clearTimeout(release.current);
    release.current = window.setTimeout(() => setPressedKey(null), PRESS_MS);
    dispatch(action);
  }, []);

  useEffect(() => () => clearTimeout(release.current), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) {
        return;
      }
      const stroke = event.key;
      if (
        stroke === "Enter" &&
        document.activeElement instanceof HTMLButtonElement
      ) {
        return;
      }
      const action = actionForKey(stroke);
      if (!action) return;
      event.preventDefault();
      press(action);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [press]);

  return (
    <div className="flex flex-col gap-6">
      <Screen value={state.entry} />
      <Keypad onPress={press} pressedKey={pressedKey} />
    </div>
  );
}
