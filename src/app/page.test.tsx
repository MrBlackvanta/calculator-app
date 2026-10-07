import Home from "@/app/page";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Home", () => {
  it("builds the page from one main landmark and one top-level heading", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("calc");
  });

  it("places the readout and the theme control inside the calculator", () => {
    render(<Home />);

    expect(screen.getByRole("status", { name: "Result" })).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "THEME" }),
    ).toBeInTheDocument();
  });
});
