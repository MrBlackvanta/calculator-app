import Keypad from "@/components/keypad";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const SYMBOL_KEYS = [
  ["+", "+ add"],
  ["-", "- subtract"],
  [".", ". decimal point"],
  ["/", "/ divide"],
  ["x", "x multiply"],
  ["=", "= equals"],
];

describe("Keypad", () => {
  it("offers one button per key in the design", () => {
    render(<Keypad onPress={vi.fn()} pressedKey={null} />);
    expect(screen.getAllByRole("button")).toHaveLength(18);
  });

  it.each(["0", "1", "5", "9", "DEL", "RESET"])(
    "names the %s key by its visible label",
    (label) => {
      render(<Keypad onPress={vi.fn()} pressedKey={null} />);
      expect(screen.getByRole("button", { name: label })).toHaveTextContent(
        label,
      );
    },
  );

  it.each(SYMBOL_KEYS)(
    "spells out what %s does without dropping the glyph from its name",
    (label, name) => {
      render(<Keypad onPress={vi.fn()} pressedKey={null} />);
      const button = screen.getByRole("button", { name });
      expect(button).toHaveTextContent(label);
      expect(name.startsWith(label)).toBe(true);
    },
  );

  it.each([
    ["7", { type: "digit", digit: "7" }],
    ["DEL", { type: "delete" }],
    ["RESET", { type: "reset" }],
  ])("reports a press of %s as %o", async (label, action) => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(<Keypad onPress={onPress} pressedKey={null} />);
    await user.click(screen.getByRole("button", { name: label }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith(action);
  });

  it.each([
    ["x multiply", "x"],
    ["/ divide", "/"],
    ["- subtract", "-"],
    ["+ add", "+"],
  ])("reports a press of %s as the %s operator", async (name, operator) => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(<Keypad onPress={onPress} pressedKey={null} />);
    await user.click(screen.getByRole("button", { name }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith({
      type: "operator",
      operator,
    });
  });
  it("marks only the key named by pressedKey as pressed", () => {
    render(<Keypad onPress={vi.fn()} pressedKey="DEL" />);
    const pressed = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("data-pressed"));
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveAccessibleName("DEL");
  });

  it("marks nothing while no key is pressed", () => {
    render(<Keypad onPress={vi.fn()} pressedKey={null} />);
    expect(
      screen
        .getAllByRole("button")
        .some((button) => button.hasAttribute("data-pressed")),
    ).toBe(false);
  });
});
