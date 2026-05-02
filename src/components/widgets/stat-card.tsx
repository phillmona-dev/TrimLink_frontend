import { Card } from "@/components/common/card";

export function StatCard({
  label,
  value,
  helper,
  isLoading
}: {
  label: string;
  value: string | number;
  helper?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="rounded-[1.5rem] bg-black/20 p-6 flex flex-col justify-center">
      <p className="text-sm font-medium text-white/50">{label}</p>
      {isLoading ? (
        <div className="h-9 w-16 bg-white/10 rounded animate-pulse mt-2" />
      ) : (
        <h3 className="mt-2 text-3xl font-black tracking-tight text-white/90">{value}</h3>
      )}
      {helper ? <p className="mt-2 text-xs text-white/40">{helper}</p> : null}
    </Card>
  );
}
