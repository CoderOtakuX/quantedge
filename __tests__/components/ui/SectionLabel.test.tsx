import React from "react";
import { render, screen } from "@testing-library/react";
import SectionLabel from "@/components/ui/SectionLabel";
import { Brain } from "lucide-react";
import "@testing-library/jest-dom";

describe("SectionLabel component", () => {
  it("renders label correctly", () => {
    render(<SectionLabel label="AI Report" />);
    expect(screen.getByText("AI Report")).toBeInTheDocument();
  });

  it("renders with icon when provided", () => {
    const { container } = render(<SectionLabel label="AI Report" icon={Brain} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-primary-container");
  });
});
