import React from "react";
import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/layout/Sidebar";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar component", () => {
  it("renders all navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Screener")).toBeInTheDocument();
    expect(screen.getByText("Sectors")).toBeInTheDocument();
  });

  it("applies active styles to current route", () => {
    const { container } = render(<Sidebar />);
    const activeLink = screen.getByText("Dashboard").closest("a");
    // expect border-l-2 and bg-surface-container-lowest
    expect(activeLink).toHaveClass("bg-surface-container-lowest");
    expect(activeLink).toHaveClass("border-l-2");
    expect(activeLink).toHaveClass("border-primary-container");
  });
});
