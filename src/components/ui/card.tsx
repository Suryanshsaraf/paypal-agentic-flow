import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={`rounded-panel border border-border bg-bg-elevated ${paddings[padding]} ${
        hover ? "hover:bg-bg-interactive transition-colors cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
