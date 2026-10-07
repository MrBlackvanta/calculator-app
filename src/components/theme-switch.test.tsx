import ThemeSwitch from "@/components/theme-switch";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("ThemeSwitch", () => {
  it("names the group it controls", () => {
    render(<ThemeSwitch />);

    expect(
      screen.getByRole("radiogroup", { name: "THEME" }),
    ).toBeInTheDocument();
  });

  it("offers one named radio per theme", () => {
    render(<ThemeSwitch />);

    expect(
      screen
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("aria-label")),
    ).toEqual(["Theme 1", "Theme 2", "Theme 3"]);
  });

  it("checks the theme already applied to the document", () => {
    document.documentElement.dataset.theme = "3";

    render(<ThemeSwitch />);

    expect(screen.getByRole("radio", { name: "Theme 3" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Theme 1" })).not.toBeChecked();
  });

  it("applies and stores the theme the user picks", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await user.click(screen.getByRole("radio", { name: "Theme 2" }));

    expect(screen.getByRole("radio", { name: "Theme 2" })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe("2");
    expect(localStorage.getItem("calc-theme")).toBe("2");
  });

  it("follows a theme chosen in another tab", async () => {
    render(<ThemeSwitch />);

    document.documentElement.dataset.theme = "3";
    window.dispatchEvent(new Event("storage"));

    expect(await screen.findByRole("radio", { name: "Theme 3" })).toBeChecked();
  });
});
