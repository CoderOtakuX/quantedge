import React from "react";
import { render, screen } from "@testing-library/react";
import MetricCard from "@/components/ui/MetricCard";
import "@testing-library/jest-dom";

describe("MetricCard component", () => {
  it("renders label and value correctly", () => {
    render(<MetricCard label="Market Cap" value="₹17.2T" />);
    expect(screen.getByText("Market Cap")).toBeInTheDocument();
    expect(screen.getByText("₹17.2T")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { container: lowContainer } = render(<MetricCard label="Test" value="Low" variant="low" />);
    expect(lowContainer.firstChild).toHaveClass("bg-surface-container-low");

    const { container: lowestContainer } = render(<MetricCard label="Test" value="Lowest" variant="lowest" />);
    expect(lowestContainer.firstChild).toHaveClass("bg-surface-container-lowest");
  });
});
