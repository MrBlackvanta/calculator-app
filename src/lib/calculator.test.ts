import {
  INITIAL_STATE,
  actionForKey,
  calculatorReducer,
} from "@/lib/calculator";
import { describe, expect, it } from "vitest";

function press(...strokes: string[]) {
  return strokes.reduce((state, stroke) => {
    const action = actionForKey(stroke);
    if (!action) throw new Error(`no action is bound to ${stroke}`);
    return calculatorReducer(state, action);
  }, INITIAL_STATE);
}

function display(...strokes: string[]) {
  return press(...strokes).entry;
}

describe("arithmetic", () => {
  it.each([
    ["1+2=", "3"],
    ["9-4=", "5"],
    ["6*7=", "42"],
    ["8/2=", "4"],
    ["1/3=", "0.33333333"],
    ["0.1+0.2=", "0.3"],
    ["12.5x4=", "50"],
    ["7-9=", "-2"],
  ])("computes %s as %s", (strokes, expected) => {
    expect(display(...strokes)).toBe(expected);
  });

  it("chains an operator by folding the pending operation first", () => {
    expect(display(..."1+2+3=")).toBe("6");
  });

  it("shows the running total the moment the next operator is pressed", () => {
    expect(display(..."1+2+")).toBe("3");
  });

  it("swaps a mistyped operator instead of folding twice", () => {
    expect(display(..."5+-3=")).toBe("2");
  });

  it("carries the result of equals into the next operation", () => {
    expect(display(..."2+3=", "+", "4", "=")).toBe("9");
  });

  it("keeps full precision in the accumulator, not the rounded display", () => {
    expect(display(..."2/3x3=")).toBe("2");
  });

  it("treats a second equals as a no-op rather than repeating", () => {
    expect(display(..."2+3==")).toBe("5");
  });

  it("ignores equals when no operation is pending", () => {
    expect(display(..."5=")).toBe("5");
  });
});

describe("entry", () => {
  it.each([
    ["05", "5"],
    ["00", "0"],
    ["1..5", "1.5"],
    [".5", "0.5"],
    ["1234567890", "123456789"],
  ])("builds %s into %s", (strokes, expected) => {
    expect(display(...strokes)).toBe(expected);
  });

  it("starts a fresh entry after an operator rather than appending", () => {
    expect(display(..."12+3")).toBe("3");
  });

  it("starts a fresh decimal entry after an operator", () => {
    expect(display(..."12+.5")).toBe("0.5");
  });

  it("caps typing at the digits the narrowest screen can hold", () => {
    expect(display(..."9".repeat(20))).toBe("999999999");
  });
});

describe("delete", () => {
  it("drops the last character", () => {
    expect(display("1", "2", "3", "Backspace")).toBe("12");
  });

  it("falls back to zero rather than an empty display", () => {
    expect(display("5", "Backspace")).toBe("0");
  });

  it("leaves a pending operand alone while an operator is awaiting input", () => {
    expect(display("5", "+", "Backspace")).toBe("5");
  });
});

describe("reset", () => {
  it("returns every field to its initial value", () => {
    expect(press(..."12+34", "Escape")).toEqual(INITIAL_STATE);
  });
});

describe("errors", () => {
  it.each([
    ["2/0=", "Error"],
    ["0/0=", "Error"],
  ])("reports %s as %s", (strokes, expected) => {
    expect(display(...strokes)).toBe(expected);
  });

  it("surfaces a division by zero folded by the next operator", () => {
    expect(display(..."2/0+")).toBe("Error");
  });

  it("lets the next digit clear the error", () => {
    expect(display(..."2/0=", "7")).toBe("7");
  });

  it("lets delete clear the error", () => {
    expect(press(..."2/0=", "Backspace")).toEqual(INITIAL_STATE);
  });

  it("refuses to build an operation on top of an error", () => {
    expect(display(..."2/0=", "+")).toBe("Error");
  });
});

describe("actionForKey", () => {
  it.each(["0", "4", "9"])("maps %s to its digit", (stroke) => {
    expect(actionForKey(stroke)).toEqual({ type: "digit", digit: stroke });
  });

  it.each([
    ["+", "+"],
    ["-", "-"],
    ["*", "x"],
    ["x", "x"],
    ["X", "x"],
    ["/", "/"],
  ])("maps %s to the %s operator", (stroke, operator) => {
    expect(actionForKey(stroke)).toEqual({ type: "operator", operator });
  });

  it.each([
    [".", "decimal"],
    [",", "decimal"],
    ["=", "equals"],
    ["Enter", "equals"],
    ["Backspace", "delete"],
    ["Escape", "reset"],
    ["Delete", "reset"],
  ])("maps %s to %s", (stroke, type) => {
    expect(actionForKey(stroke)).toEqual({ type });
  });

  it.each(["a", "Shift", "Tab", "F5", " ", "ArrowLeft"])(
    "leaves %s to the browser",
    (stroke) => {
      expect(actionForKey(stroke)).toBeNull();
    },
  );
});
