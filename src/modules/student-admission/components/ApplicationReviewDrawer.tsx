import { Check, X } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Modal";
import { InfoGrid } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/hooks/usePermissions";
import { useServiceMutation } from "@/hooks/useServiceQuery";
import { formatDate } from "@/utils/format";
import { admissionService } from "../service";
import type { Application, DocStatus } from "../types";
import { docProgress } from "../utils";

export function ApplicationReviewDrawer({ app, onClose, onChange }: { app: Application | null; onClose: () => void; onChange: (a: Application) => void }) {
  const { can } = usePermissions();
  const canApprove = can("student-admission", "approve");
  const [decision, setDecision] = useState<"Approved" | "Rejected" | null>(null);
  const [remarks, setRemarks] = useState("");

  const verify = useServiceMutation(
    (v: { doc: string; status: DocStatus }) => admissionService.verifyDocument(app!.id, v.doc, v.status),
    { invalidate: ["applications"], success: (_r, v) => `${v.doc} marked ${v.status.toLowerCase()}`, onSuccess: onChange },
  );
  const decide = useServiceMutation(
    (v: { decision: "Approved" | "Rejected"; remarks: string }) => admissionService.decide(app!.id, v.decision, v.remarks),
    { invalidate: ["applications"], success: (r) => `Application ${r.id} ${r.status.toLowerCase()}`, onSuccess: (r) => { onChange(r); setDecision(null); } },
  );

  const open = !!app;
  const final = app?.status === "Approved" || app?.status === "Rejected";
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {app && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">{app.applicantName}<StatusBadge status={app.status} /></SheetTitle>
              <SheetDescription>{app.id} · applied {formatDate(app.appliedOn)}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-6">
              <div className="-mx-4 rounded-lg border">
                <InfoGrid items={[
                  { label: "Email", value: app.email }, { label: "Phone", value: app.phone }, { label: "Program", value: `${app.program} ${app.department}` },
                  { label: "Entrance", value: `${app.entranceExam} · ${app.score}` }, { label: "Category", value: app.category },
                ]} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Document verification ({docProgress(app.documents)}/{app.documents.length})</h3>
                <ul className="divide-y rounded-lg border">
                  {app.documents.map((d) => (
                    <li key={d.name} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                      <span>{d.name}</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={d.status} />
                        {canApprove && !final && (
                          <>
                            <Button size="icon" variant="outline" className="h-7 w-7" aria-label={`Verify ${d.name}`} disabled={verify.isPending || d.status === "Verified"} onClick={() => verify.mutate({ doc: d.name, status: "Verified" })}><Check className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" aria-label={`Reject ${d.name}`} disabled={verify.isPending || d.status === "Rejected"} onClick={() => verify.mutate({ doc: d.name, status: "Rejected" })}><X className="h-3.5 w-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {app.remarks && <p className="rounded-md bg-muted p-3 text-sm"><strong>Remarks:</strong> {app.remarks}</p>}
              {canApprove && !final && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1" onClick={() => { setRemarks(""); setDecision("Approved"); }}>Approve admission</Button>
                  <Button className="flex-1" variant="outline" onClick={() => { setRemarks(""); setDecision("Rejected"); }}>Reject</Button>
                </div>
              )}
            </div>
            <ConfirmDialog
              open={!!decision}
              onOpenChange={(o) => !o && setDecision(null)}
              title={decision === "Approved" ? "Approve this application?" : "Reject this application?"}
              description={<>Application <strong>{app.id}</strong> for <strong>{app.applicantName}</strong> will be {decision?.toLowerCase()}.</>}
              confirmLabel={decision === "Approved" ? "Approve" : "Reject"}
              destructive={decision === "Rejected"}
              loading={decide.isPending}
              onConfirm={() => decision && decide.mutate({ decision, remarks })}
            >
              <div className="space-y-1.5">
                <Label htmlFor="adm-remarks">Remarks</Label>
                <Textarea id="adm-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason / note for the applicant" />
              </div>
            </ConfirmDialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
