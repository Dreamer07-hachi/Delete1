import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Eye, Hourglass, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { KpiCard, KpiGrid } from "@/components/KpiCard";
import { PageHeader, Section } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/States";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useList, useServiceQuery } from "@/hooks/useServiceQuery";
import { getErrorMessage } from "@/services/apiClient";
import { DEPARTMENT_NAMES } from "@/services/mockSeed";
import { formatDate } from "@/utils/format";
import { ApplicationReviewDrawer } from "../components/ApplicationReviewDrawer";
import { admissionService } from "../service";
import type { Application } from "../types";
import { docProgress } from "../utils";

function AdmissionHistory() {
  const q = useQuery({ queryKey: ["applications", "history"], queryFn: () => admissionService.all() });
  if (q.isLoading) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState message={getErrorMessage(q.error)} onRetry={() => q.refetch()} />;
  const events = (q.data ?? []).flatMap((a) => a.history.map((h, i) => ({ ...h, key: `${a.id}-${i}`, app: a }))).sort((a, b) => b.date.localeCompare(a.date));
  if (!events.length) return <EmptyState title="No admission history" />;
  return (
    <ul className="divide-y">
      {events.map((e) => (
        <li key={e.key} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm">{e.action}</p><p className="text-xs text-muted-foreground">{e.app.applicantName} · {e.app.id} · by {e.by}</p></div>
          <span className="text-xs text-muted-foreground">{formatDate(e.date)}</span>
        </li>
      ))}
    </ul>
  );
}

export function AdmissionsPage() {
  const stats = useServiceQuery(["applications", "stats"], admissionService.getStats);
  const list = useList<Application>(["applications"], admissionService.list, { initialSort: { key: "appliedOn", dir: "desc" } });
  const [reviewing, setReviewing] = useState<Application | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Admissions" description="Review applications for AY 2026–27" />
      <KpiGrid>
        <KpiCard label="Pending" value={stats.data?.pending ?? "—"} icon={Hourglass} accent="amber" loading={stats.isLoading} />
        <KpiCard label="Under Review" value={stats.data?.underReview ?? "—"} icon={ClipboardList} loading={stats.isLoading} />
        <KpiCard label="Approved" value={stats.data?.approved ?? "—"} icon={ThumbsUp} accent="success" loading={stats.isLoading} />
        <KpiCard label="Rejected" value={stats.data?.rejected ?? "—"} icon={ThumbsDown} accent="danger" loading={stats.isLoading} />
      </KpiGrid>
      <Tabs defaultValue="applications">
        <TabsList><TabsTrigger value="applications">Applications</TabsTrigger><TabsTrigger value="history">Admission history</TabsTrigger></TabsList>
        <TabsContent value="applications">
          <DataTable
            list={list}
            exportName="Admission applications"
            searchPlaceholder="Search applicant, ID, email…"
            onRowClick={setReviewing}
            actions={[{ label: "Review", icon: <Eye className="h-4 w-4" />, onClick: setReviewing }]}
            columns={[
              { key: "id", header: "App ID", sortable: true, render: (a) => <span className="font-mono text-xs">{a.id}</span> },
              { key: "applicantName", header: "Applicant", sortable: true, render: (a) => <span className="font-medium">{a.applicantName}</span> },
              { key: "department", header: "Department", sortable: true },
              { key: "entranceExam", header: "Exam" },
              { key: "score", header: "Score", sortable: true },
              { key: "appliedOn", header: "Applied", sortable: true, render: (a) => formatDate(a.appliedOn) },
              { key: "docs", header: "Docs", render: (a) => `${docProgress(a.documents)}/${a.documents.length}` },
              { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
            ]}
            filters={[
              { key: "status", label: "Statuses", options: ["Pending", "Under Review", "Approved", "Rejected"] },
              { key: "department", label: "Departments", options: DEPARTMENT_NAMES },
            ]}
            emptyTitle="No applications yet"
            emptyDescription="New admission applications will appear here."
          />
        </TabsContent>
        <TabsContent value="history"><Section title="Admission history"><AdmissionHistory /></Section></TabsContent>
      </Tabs>
      <ApplicationReviewDrawer app={reviewing} onClose={() => setReviewing(null)} onChange={setReviewing} />
    </div>
  );
}
