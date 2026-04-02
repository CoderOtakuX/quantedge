export function formatCurrency(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const parts = absValue.toFixed(2).split(".");
  let intPart = parts[0];
  const lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  intPart =
    otherNumbers !== ""
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;

  return `${isNegative ? "-" : ""}₹${intPart}.${parts[1]}`;
}

export function formatLargeNumber(value: number): string {
  const abs = Math.abs(value);
  let formatted = "";

  if (abs >= 1e12) {
    formatted = parseFloat((abs / 1e12).toFixed(2)) + "T";
  } else if (abs >= 1e7) {
    const crValue = abs / 1e7;
    // For Crore, we often see integers if large, or 2 decimals if small. 
    // Let's stick to 2 decimals max and strip zeros.
    formatted = parseFloat(crValue.toFixed(2)) + "Cr";
  } else {
    formatted = abs.toLocaleString("en-IN");
  }

  return `${value < 0 ? "-" : ""}₹${formatted}`;
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
