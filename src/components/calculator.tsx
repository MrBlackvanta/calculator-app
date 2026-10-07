"use client";

import Keypad from "@/components/keypad";
import Screen from "@/components/screen";
import {
  INITIAL_STATE,
  actionForKey,
  calculatorReducer,
} from "@/lib/calculator";
import { useEffect, useReducer } from "react";

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, INITIAL_STATE);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const pressed = event.key;
      if (
        pressed === "Enter" &&
        document.activeElement instanceof HTMLButtonElement
      ) {
        return;
      }
      const action = actionForKey(pressed);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Screen value={state.entry} />
      <Keypad onPress={dispatch} />
    </div>
  );
}
