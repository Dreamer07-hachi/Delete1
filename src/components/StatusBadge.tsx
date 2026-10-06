import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  success: "tone-success",
  warning: "tone-warning",
  destructive: "tone-destructive",
  info: "tone-info",
  neutral: "tone-neutral",
};

const MAP: Record<string, keyof typeof TONES> = {
  active: "success", approved: "success", paid: "success", present: "success", pass: "success", passed: "success",
  resolved: "success", available: "success", completed: "success", ready: "success", verified: "success",
  returned: "success", good: "success", cleared: "success", hired: "success", vacant: "success", published: "success",
  open: "warning", pending: "warning", partial: "warning", "in progress": "warning", "under review": "warning",
  "on leave": "warning", warning: "warning", submitted: "info", registered: "info", reserved: "warning",
  shortlisted: "info", interview: "info", offer: "info", issued: "info", scheduled: "info", upcoming: "info",
  rejected: "destructive", inactive: "neutral", failed: "destructive", fail: "destructive", overdue: "destructive",
  absent: "destructive", shortage: "destructive", atkt: "destructive", suspended: "destructive", full: "destructive",
  maintenance: "neutral", vacated: "neutral", alumni: "neutral", closed: "neutral", processing: "warning",
  high: "destructive", medium: "warning", low: "neutral",
};

export function StatusBadge({ status, tone, className }: { status: string; tone?: keyof typeof TONES; className?: string }) {
  const t = tone ?? MAP[status.toLowerCase()] ?? "neutral";
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[t], className)}>
      {status}
    </span>
  );
}
