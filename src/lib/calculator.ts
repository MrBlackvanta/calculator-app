import { ERROR, MAX_DIGITS, countDigits, formatResult } from "@/lib/display";

export type Operator = "+" | "-" | "x" | "/";

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "delete" }
  | { type: "reset" };

export type CalculatorState = {
  entry: string;
  accumulator: number | null;
  operator: Operator | null;
  awaitingEntry: boolean;
};

export const INITIAL_STATE: CalculatorState = {
  entry: "0",
  accumulator: null,
  operator: null,
  awaitingEntry: false,
};

function apply(left: number, operator: Operator, right: number) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "x":
      return left * right;
    case "/":
      return left / right;
  }
}

function resolve(state: CalculatorState) {
  if (state.operator === null || state.accumulator === null) {
    return Number(state.entry);
  }
  return apply(state.accumulator, state.operator, Number(state.entry));
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case "reset":
      return INITIAL_STATE;

    case "digit": {
      if (state.awaitingEntry || state.entry === ERROR) {
        return { ...state, entry: action.digit, awaitingEntry: false };
      }
      if (countDigits(state.entry) >= MAX_DIGITS) return state;
      if (state.entry === "0") return { ...state, entry: action.digit };
      return { ...state, entry: state.entry + action.digit };
    }

    case "decimal": {
      if (state.awaitingEntry || state.entry === ERROR) {
        return { ...state, entry: "0.", awaitingEntry: false };
      }
      if (state.entry.includes(".")) return state;
      return { ...state, entry: state.entry + "." };
    }

    case "operator": {
      if (state.entry === ERROR) return state;
      if (state.awaitingEntry && state.operator !== null) {
        return { ...state, operator: action.operator };
      }
      const carried = resolve(state);
      const shown = formatResult(carried);
      if (shown === ERROR) return { ...INITIAL_STATE, entry: ERROR };
      return {
        entry: shown,
        accumulator: carried,
        operator: action.operator,
        awaitingEntry: true,
      };
    }

    case "equals": {
      if (state.entry === ERROR || state.operator === null) return state;
      return {
        ...INITIAL_STATE,
        entry: formatResult(resolve(state)),
        awaitingEntry: true,
      };
    }

    case "delete": {
      if (state.entry === ERROR) return INITIAL_STATE;
      if (state.awaitingEntry) return state;
      const shortened = state.entry.slice(0, -1);
      return {
        ...state,
        entry: shortened === "" || shortened === "-" ? "0" : shortened,
      };
    }
  }
}

export function actionForKey(key: string): CalculatorAction | null {
  if (/^\d$/.test(key)) return { type: "digit", digit: key };
  switch (key) {
    case ".":
    case ",":
      return { type: "decimal" };
    case "+":
      return { type: "operator", operator: "+" };
    case "-":
      return { type: "operator", operator: "-" };
    case "*":
    case "x":
    case "X":
      return { type: "operator", operator: "x" };
    case "/":
      return { type: "operator", operator: "/" };
    case "=":
    case "Enter":
      return { type: "equals" };
    case "Backspace":
      return { type: "delete" };
    case "Escape":
    case "Delete":
      return { type: "reset" };
    default:
      return null;
  }
}
