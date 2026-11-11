import React from "react";

/* ── Status Badge ── */
type BadgeVariant =
  | "default"
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "needs_review"
  | "cancelled"
  | "success"
  | "warning"
  | "danger"
  | "info";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-interactive text-text-secondary border-border",
  draft: "bg-bg-interactive text-text-secondary border-border",
  sent: "bg-warning-muted text-warning border-warning/20",
  paid: "bg-success-muted text-success border-success/20",
  overdue: "bg-danger-muted text-danger border-danger/20",
  needs_review: "bg-danger-muted text-danger border-danger/30",
  cancelled: "bg-bg-interactive text-text-muted border-border",
  success: "bg-success-muted text-success border-success/20",
  warning: "bg-warning-muted text-warning border-warning/20",
  danger: "bg-danger-muted text-danger border-danger/20",
  info: "bg-info-muted text-info border-info/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "default", children, className = "", dot }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-timestamp font-medium border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === "paid" || variant === "success"
              ? "bg-success"
              : variant === "overdue" || variant === "danger" || variant === "needs_review"
              ? "bg-danger"
              : variant === "sent" || variant === "warning"
              ? "bg-warning"
              : variant === "info"
              ? "bg-info"
              : "bg-text-muted"
          }`}
        />
      )}
      {children}
    </span>
  );
}

/* ── Status Badge Helper ── */
export function InvoiceStatusBadge({
  status,
  dueDate,
}: {
  status: string;
  dueDate: string;
}) {
  const isOverdue =
    status === "SENT" && new Date(dueDate) < new Date();

  if (status === "PAID") return <Badge variant="paid" dot>Paid</Badge>;
  if (status === "NEEDS_REVIEW") return <Badge variant="needs_review" dot>Needs Review</Badge>;
  if (status === "CANCELLED") return <Badge variant="cancelled" dot>Cancelled</Badge>;
  if (status === "DRAFT") return <Badge variant="draft" dot>Draft</Badge>;
  if (isOverdue) return <Badge variant="overdue" dot>Overdue</Badge>;
  return <Badge variant="sent" dot>Sent</Badge>;
}
