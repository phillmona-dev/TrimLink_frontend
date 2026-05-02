import { cn } from "@/utils/cn";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-400 to-glow-600 text-lg font-black text-ink-950 shadow-lift",
        className
      )}
    >
      T
    </div>
  );
}
