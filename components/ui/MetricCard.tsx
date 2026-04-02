import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  variant?: "low" | "lowest";
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  children?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  variant = "low",
  className = "",
  labelClassName = "",
  valueClassName = "",
  children,
}) => {
  const bgClass = variant === "lowest" ? "bg-surface-container-lowest" : "bg-surface-container-low";

  return (
    <div className={`${bgClass} p-5 rounded-xl ${className}`}>
      <p className={`text-[10px] font-bold text-outline tracking-widest uppercase mb-1 ${labelClassName}`}>
        {label}
      </p>
      <p className={`text-lg font-semibold tabular-nums text-on-surface ${valueClassName}`}>
        {value}
      </p>
      {children}
    </div>
  );
};

export default MetricCard;
