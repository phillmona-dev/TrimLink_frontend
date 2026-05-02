import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary",
        className
      )}
      {...props}
    />
  );
}
