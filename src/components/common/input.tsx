import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="grid gap-1.5">
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-base text-white placeholder:text-white/40 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...props}
      />
      {error && <p className="px-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
