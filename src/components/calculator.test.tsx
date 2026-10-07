import Calculator from "@/components/calculator";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

  it("leaves Enter to the focused key instead of also computing", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await tap(user, "1", "+ add", "2");
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
});
