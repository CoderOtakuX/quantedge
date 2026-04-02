import React from "react";
import { render, screen } from "@testing-library/react";
import DeltaPill from "@/components/ui/DeltaPill";
import "@testing-library/jest-dom";

describe("DeltaPill component", () => {
  it("renders positive delta correctly with green color", () => {
    render(<DeltaPill value={1.5} />);
    const pill = screen.getByText("+1.50%");
    expect(pill.parentElement).toHaveClass("text-tertiary-container");
  });

  it("renders negative delta correctly with red color", () => {
    render(<DeltaPill value={-0.85} />);
    const pill = screen.getByText("-0.85%");
    expect(pill.parentElement).toHaveClass("text-error");
  });

  it("renders zero delta", () => {
    render(<DeltaPill value={0} />);
    expect(screen.getByText("0.00%")).toBeInTheDocument();
  });
});
