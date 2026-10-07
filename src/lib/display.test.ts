import { groupThousands } from "@/lib/display";
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
