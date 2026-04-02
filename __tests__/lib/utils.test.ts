import { formatCurrency, formatLargeNumber, formatDelta } from "@/lib/utils";

describe("utils", () => {
  test("formatCurrency", () => {
    expect(formatCurrency(2540.5)).toBe("₹2,540.50");
  });

  test("formatLargeNumber", () => {
    expect(formatLargeNumber(17200000000000)).toBe("₹17.2T"); // matches replace logic which removes .0
    expect(formatLargeNumber(1800000000)).toBe("₹180Cr");
    expect(formatLargeNumber(450000000)).toBe("₹45Cr");
  });

  test("formatDelta", () => {
    expect(formatDelta(1.25)).toBe("+1.25%");
    expect(formatDelta(-0.82)).toBe("-0.82%");
  });
});
