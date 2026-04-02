import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatDelta } from "@/lib/utils";

interface DeltaPillProps {
  value: number;
  showIcon?: boolean;
  className?: string;
}

const DeltaPill: React.FC<DeltaPillProps> = ({ value, showIcon = true, className = "" }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const colorClass = isPositive
    ? "text-tertiary-container"
    : isNegative
    ? "text-error"
    : "text-outline";

  return (
    <div className={`flex items-center gap-1 font-semibold tabular-nums ${colorClass} ${className}`}>
      {showIcon && (
        <>
          {isPositive && <TrendingUp size={14} />}
          {isNegative && <TrendingDown size={14} />}
          {!isPositive && !isNegative && <Minus size={14} />}
        </>
      )}
      <span className="text-xs">{formatDelta(value)}</span>
    </div>
  );
};

export default DeltaPill;
