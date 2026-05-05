import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, suffix, ...props }, ref) => (
    <div className="grid gap-1.5 relative">
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-base text-white placeholder:text-white/40 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
            suffix && "pr-12",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="px-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
