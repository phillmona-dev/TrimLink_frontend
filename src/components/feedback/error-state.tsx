import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/button";

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-danger/20 bg-danger/5 p-6">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
