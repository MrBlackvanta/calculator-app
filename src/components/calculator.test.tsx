import Calculator from "@/components/calculator";
import { playKeypress } from "@/lib/keypress-sound";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/keypress-sound", () => ({ playKeypress: vi.fn() }));

const DIGIT_SEVEN = { key: "7", code: "Digit7" };

function pad(name: string) {
  return screen.getByRole("button", { name });
}

function litKeys() {
  return screen
    .getAllByRole("button")
    .filter((button) => button.hasAttribute("data-pressed"))
    .map((button) => button.textContent);
}

function readout() {
  return screen.getByRole("status", { name: "Result" }).textContent;
}

async function tap(
  user: ReturnType<typeof userEvent.setup>,
  ...names: string[]
) {
  for (const name of names) {
    await user.click(screen.getByRole("button", { name }));
  }
}

describe("Calculator", () => {
  it("renders the same value on the server and the first client paint", () => {
    render(<Calculator />);
    expect(readout()).toBe("0");
  });

  it("computes from the keypad", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await tap(user, "1", "+ add", "2", "= equals");
    expect(readout()).toBe("3");
  });

  it("groups a long result as it reaches the screen", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await tap(user, "9", "9", "9", "x multiply", "4", "0", "1", "= equals");
    expect(readout()).toBe("400,599");
  });

  it("computes from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await user.keyboard("12+34{Enter}");
    expect(readout()).toBe("46");
  });

  it.each([
    ["{Escape}", "0"],
    ["{Backspace}", "12"],
  ])("handles %s after typing 123", async (stroke, expected) => {
    const user = userEvent.setup();
    render(<Calculator />);
    await user.keyboard(`123${stroke}`);
    expect(readout()).toBe(expected);
  });

  it("shows an error rather than Infinity when dividing by zero", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await user.keyboard("8/0{Enter}");
    expect(readout()).toBe("Error");
  });

  it("computes on Enter after a click rather than repeating the clicked key", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await tap(user, "1", "+ add", "2");
    expect(document.activeElement).toBe(document.body);
    await user.keyboard("{Enter}");
    expect(readout()).toBe("3");
  });

  it("leaves Enter to a key reached by keyboard instead of also computing", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await tap(user, "1", "+ add", "2");
    pad("2").focus();
    await user.keyboard("{Enter}");
    expect(readout()).toBe("22");
  });

  it("detaches the exact keyboard listener it attached", () => {
    const attach = vi.spyOn(window, "addEventListener");
    const detach = vi.spyOn(window, "removeEventListener");
    const view = render(<Calculator />);
    const attached = attach.mock.calls.find(([type]) => type === "keydown");
    view.unmount();
    expect(attached).toBeDefined();
    expect(detach).toHaveBeenCalledWith("keydown", attached![1]);
  });
  it("sounds a press whether it was clicked or typed", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    vi.mocked(playKeypress).mockClear();
    await tap(user, "7");
    expect(playKeypress).toHaveBeenCalledTimes(1);
    await user.keyboard("8");
    expect(playKeypress).toHaveBeenCalledTimes(2);
  });

  it("stays quiet for a stroke the calculator ignores", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    vi.mocked(playKeypress).mockClear();
    await user.keyboard("q");
    expect(playKeypress).not.toHaveBeenCalled();
  });

  it("lights the key a click landed on, then lets it go", async () => {
    render(<Calculator />);
    fireEvent.click(pad("7"));
    expect(pad("7")).toHaveAttribute("data-pressed");
    await waitFor(() => {
      expect(pad("7")).not.toHaveAttribute("data-pressed");
    });
  });

  it.each([
    ["4", "4"],
    ["*", "x multiply"],
    ["Backspace", "DEL"],
    ["Escape", "RESET"],
    ["Enter", "= equals"],
  ])("lights the pad key that %s stands for", (stroke, name) => {
    render(<Calculator />);
    fireEvent.keyDown(window, { key: stroke });
    expect(pad(name)).toHaveAttribute("data-pressed");
  });

  it("lights one key at a time as a calculation is typed", () => {
    render(<Calculator />);
    fireEvent.keyDown(window, { key: "5" });
    expect(litKeys()).toEqual(["5"]);
    fireEvent.keyDown(window, { key: "+" });
    expect(litKeys()).toEqual(["+"]);
  });

  it("counts a held stroke as the one press it looks like", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    vi.mocked(playKeypress).mockClear();
    await user.keyboard("7");
    fireEvent.keyDown(window, { repeat: true, ...DIGIT_SEVEN });
    expect(readout()).toBe("7");
    expect(playKeypress).toHaveBeenCalledTimes(1);
  });
});
