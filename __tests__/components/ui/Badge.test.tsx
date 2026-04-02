import React from "react";
import { render, screen } from "@testing-library/react";
import Badge from "@/components/ui/Badge";
import "@testing-library/jest-dom";

describe("Badge component", () => {
  it("renders children correctly", () => {
    render(<Badge>BUY</Badge>);
    expect(screen.getByText("BUY")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { container } = render(<Badge variant="success">SUCCESS</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-tertiary-container/10", "text-tertiary-container");
  });

  it("adds custom className when provided", () => {
    render(<Badge className="custom-class">TEST</Badge>);
    expect(screen.getByText("TEST")).toHaveClass("custom-class");
  });
});
