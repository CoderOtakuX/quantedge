import React from "react";
import { render } from "@testing-library/react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import "@testing-library/jest-dom";

describe("LoadingSkeleton component", () => {
  it("renders with base classes", () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.firstChild).toHaveClass("bg-surface-container-high", "animate-pulse");
  });

  it("applies circle variant classes", () => {
    const { container } = render(<LoadingSkeleton variant="circle" />);
    expect(container.firstChild).toHaveClass("rounded-full");
  });

  it("applies text variant classes", () => {
    const { container } = render(<LoadingSkeleton variant="text" />);
    expect(container.firstChild).toHaveClass("rounded", "h-4", "w-3/4");
  });
});
