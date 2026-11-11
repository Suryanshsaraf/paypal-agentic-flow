import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent hover:bg-accent-hover text-white shadow-glow border-accent/50",
  secondary:
    "bg-bg-interactive hover:bg-bg-elevated text-text-primary border-border",
  ghost:
    "bg-transparent hover:bg-bg-interactive text-text-secondary hover:text-text-primary border-transparent",
  danger:
    "bg-danger-muted hover:bg-danger/20 text-danger border-danger/30",
  success:
    "bg-success-muted hover:bg-success/20 text-success border-success/30",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-timestamp gap-1.5",
  md: "h-8 px-3 text-meta gap-2",
  lg: "h-9 px-4 text-body gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-control border transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="w-3.5 h-3.5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
