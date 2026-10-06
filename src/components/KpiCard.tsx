import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ACCENTS = {
  primary: "bg-secondary text-primary",
  teal: "bg-accent text-accent-foreground",
  amber: "tone-warning",
  danger: "tone-destructive",
  success: "tone-success",
};

export function KpiCard({
  label, value, icon: Icon, hint, accent = "primary", loading,
}: { label: string; value: ReactNode; icon?: LucideIcon; hint?: string; accent?: keyof typeof ACCENTS; loading?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 shadow-sm">
      {Icon && (
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ACCENTS[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-1 h-7 w-20" /> : <p className="mt-0.5 text-2xl font-semibold tabular-nums">{value}</p>}
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function KpiGrid({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 | 5 | 6 }) {
  const lg = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" }[cols];
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", lg)}>{children}</div>;
}
