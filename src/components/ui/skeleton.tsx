import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`skeleton rounded-control ${className}`} aria-hidden />
  );
}

export function KpiSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-40 flex-1" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-14 rounded-pill" />
    </div>
  );
}
