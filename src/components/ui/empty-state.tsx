import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <div className="mb-4 text-text-muted">{icon}</div>
      )}
      <h3 className="text-body font-medium text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-meta text-text-muted text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
