import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RowAction } from "./DataTable";
import { ConfirmDialog } from "./Modal";

/**
 * Approve/Reject row actions with a confirmation dialog + optional remarks.
 * Usage: const ar = useApproveReject(...); pass ar.actions to a table, render ar.dialog.
 */
export function useApproveReject<T extends { id: string }>({
  nameOf, canApprove, isPending, onDecide, loading,
}: {
  nameOf: (r: T) => string;
  canApprove: boolean;
  isPending: (r: T) => boolean;
  onDecide: (row: T, decision: "Approved" | "Rejected", remarks: string) => void;
  loading?: boolean;
}) {
  const [target, setTarget] = useState<{ row: T; decision: "Approved" | "Rejected" } | null>(null);
  const [remarks, setRemarks] = useState("");
  const actions: RowAction<T>[] = canApprove
    ? [
        { label: "Approve", icon: <CheckCircle2 className="h-4 w-4" />, onClick: (row) => { setRemarks(""); setTarget({ row, decision: "Approved" }); }, hidden: (r) => !isPending(r) },
        { label: "Reject", icon: <XCircle className="h-4 w-4" />, destructive: true, onClick: (row) => { setRemarks(""); setTarget({ row, decision: "Rejected" }); }, hidden: (r) => !isPending(r) },
      ]
    : [];
  const dialog = (
    <ConfirmDialog
      open={!!target}
      onOpenChange={(o) => !o && setTarget(null)}
      title={target?.decision === "Approved" ? "Approve request?" : "Reject request?"}
      description={<>You are about to mark <strong>{target ? nameOf(target.row) : ""}</strong> as {target?.decision.toLowerCase()}.</>}
      confirmLabel={target?.decision === "Approved" ? "Approve" : "Reject"}
      destructive={target?.decision === "Rejected"}
      loading={loading}
      onConfirm={() => { if (target) { onDecide(target.row, target.decision, remarks); setTarget(null); } }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="decision-remarks">Remarks (optional)</Label>
        <Textarea id="decision-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add a note for the record" />
      </div>
    </ConfirmDialog>
  );
  return { actions, dialog };
}
