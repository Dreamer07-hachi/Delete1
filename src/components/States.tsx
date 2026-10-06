import { AlertTriangle, Inbox, SearchX, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({
  title = "No records yet",
  description = "Records you add will appear here.",
  icon,
  action,
}: { title?: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function NoResultsState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={<SearchX className="h-5 w-5" />}
      title="No matching results"
      description="Try a different search term or clear the filters."
      action={onClear && <Button variant="outline" size="sm" onClick={onClear}>Clear search & filters</Button>}
    />
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full tone-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="font-medium">Couldn't load data</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message ?? "Something went wrong while contacting the server."}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function LoadingSkeleton({ variant = "table", rows = 6 }: { variant?: "table" | "cards" | "page"; rows?: number }) {
  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
    );
  }
  if (variant === "page") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <LoadingSkeleton variant="cards" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }
  return (
    <div className="space-y-2 p-4" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
    </div>
  );
}

export function AccessDenied({ moduleLabel }: { moduleLabel?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full tone-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role doesn't have permission to view {moduleLabel ? <strong>{moduleLabel}</strong> : "this page"}. Contact the
          ERP administrator if you think this is a mistake.
        </p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    </div>
  );
}
