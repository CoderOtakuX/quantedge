import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionLabelProps {
  label: string;
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({
  label,
  icon: Icon,
  className = "",
  iconClassName = "",
  labelClassName = "",
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {Icon && <Icon className={`text-primary-container h-5 w-5 ${iconClassName}`} />}
      <h3 className={`text-lg font-semibold text-on-surface ${labelClassName}`}>{label}</h3>
    </div>
  );
};

export default SectionLabel;
