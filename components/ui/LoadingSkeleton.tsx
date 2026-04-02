import React from "react";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "rectangle" | "circle" | "text";
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "",
  variant = "rectangle",
}) => {
  const baseClass = "bg-surface-container-high animate-pulse";
  const shapeClass =
    variant === "circle" ? "rounded-full" : variant === "text" ? "rounded h-4 w-3/4" : "rounded-xl";

  return <div className={`${baseClass} ${shapeClass} ${className}`} />;
};

export default LoadingSkeleton;
