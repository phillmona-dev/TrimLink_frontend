export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-3xl bg-muted ${className}`} />;
}
