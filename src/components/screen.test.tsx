import Screen from "@/components/screen";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Screen", () => {
  it("exposes the result as a named live region", () => {
    render(<Screen value="0" />);

    expect(screen.getByRole("status", { name: "Result" })).toBeInTheDocument();
  });

  it("spells the status role out, because Chromium maps a bare output to generic", () => {
    render(<Screen value="0" />);

    expect(screen.getByRole("status")).toHaveAttribute("role", "status");
  });

  it("groups the value it displays", () => {
    render(<Screen value="399981" />);

    expect(screen.getByRole("status")).toHaveTextContent("399,981");
  });

  it("announces a new value through the same region", () => {
    const { rerender } = render(<Screen value="1" />);
    const region = screen.getByRole("status");

    rerender(<Screen value="1000000" />);

    expect(screen.getByRole("status")).toBe(region);
    expect(region).toHaveTextContent("1,000,000");
  });
});
