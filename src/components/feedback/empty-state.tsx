import { Inbox } from "lucide-react";
import { Button } from "@/components/common/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/70 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
