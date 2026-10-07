import {
  MAX_DIGITS,
  countDigits,
  formatResult,
  groupThousands,
} from "@/lib/display";
import { describe, expect, it } from "vitest";

describe("groupThousands", () => {
  it.each([
    ["0", "0"],
    ["7", "7"],
    ["42", "42"],
    ["999", "999"],
    ["1000", "1,000"],
    ["399981", "399,981"],
    ["1234567890", "1,234,567,890"],
  ])("groups %s into %s", (input, expected) => {
    expect(groupThousands(input)).toBe(expected);
  });

  it.each([
    ["-1", "-1"],
    ["-1000", "-1,000"],
    ["-1234567", "-1,234,567"],
    ["-9876543.21", "-9,876,543.21"],
  ])("keeps the sign outside the grouping for %s", (input, expected) => {
    expect(groupThousands(input)).toBe(expected);
  });

  it.each([
    ["3.14", "3.14"],
    ["1234.5678", "1,234.5678"],
    ["0.000001", "0.000001"],
  ])("never groups the fraction of %s", (input, expected) => {
    expect(groupThousands(input)).toBe(expected);
  });

  it.each([
    ["0.", "0."],
    ["1000.", "1,000."],
  ])(
    "preserves the trailing separator while %s is being typed",
    (input, expected) => {
      expect(groupThousands(input)).toBe(expected);
    },
  );

  it.each(["Infinity", "-Infinity", "Error", "NaN"])(
    "passes %s through untouched",
    (input) => {
      expect(groupThousands(input)).toBe(input);
    },
  );
});

describe("countDigits", () => {
  it.each([
    ["0", 1],
    ["123456789", 9],
    ["-1234.56", 6],
    ["0.", 1],
    ["Error", 0],
  ])("counts the digits in %s as %i", (input, expected) => {
    expect(countDigits(input)).toBe(expected);
  });
});

describe("formatResult", () => {
  it.each([
    [0, "0"],
    [-0, "0"],
    [3, "3"],
    [-1000, "-1000"],
    [99.5, "99.5"],
    [123456789, "123456789"],
    [999999999.4, "999999999"],
  ])("renders %p as %s", (input, expected) => {
    expect(formatResult(input)).toBe(expected);
  });

  it.each([
    [1 / 3, "0.33333333"],
    [-1 / 3, "-0.33333333"],
    [0.1 + 0.2, "0.3"],
    [1.005 * 100, "100.5"],
  ])("absorbs binary float noise, rendering %p as %s", (input, expected) => {
    expect(formatResult(input)).toBe(expected);
  });

  it.each([
    1 / 3,
    123456789,
    0.1 + 0.2,
    999999999.4,
    -1 / 3,
    2 / 7,
    -98765.4321,
  ])("keeps %p inside the display's digit budget", (input) => {
    expect(countDigits(formatResult(input))).toBeLessThanOrEqual(MAX_DIGITS);
  });

  it.each([
    [1e9, "1e9"],
    [1234567890, "1.235e9"],
    [8999999991, "9e9"],
    [1e-12, "1e-12"],
    [-1.5241578750190521e18, "-1.524e18"],
  ])("escapes to exponential for %p, giving %s", (input, expected) => {
    expect(formatResult(input)).toBe(expected);
  });

  it.each([Infinity, -Infinity, NaN])("reports %p as an error", (input) => {
    expect(formatResult(input)).toBe("Error");
  });
});
