import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    default: "bg-surface-container text-on-surface-variant",
    success: "bg-tertiary-container/10 text-tertiary-container",
    warning: "bg-secondary-container/20 text-secondary",
    error: "bg-error-container/20 text-error",
    info: "bg-primary-container/10 text-primary-container",
    neutral: "bg-surface-variant text-on-surface-variant",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide inline-flex items-center justify-center ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
