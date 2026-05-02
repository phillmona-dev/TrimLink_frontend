import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-white/5 bg-black/30 p-7 shadow-2xl backdrop-blur-md text-white",
        className
      )}
      {...props}
    />
  );
}
