import { Link } from "@tanstack/react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { InfoGrid, Section } from "@/components/PageHeader";
import { ErrorState, LoadingSkeleton } from "@/components/States";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/usePermissions";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getErrorMessage } from "@/services/apiClient";
import { placeholder } from "@/utils/export";
import { formatDate, formatINR, initials } from "@/utils/format";
import { studentService } from "../service";

export function StudentProfilePage({ id }: { id: string }) {
  const { can } = usePermissions();
  const q = useServiceQuery(["students", id], () => studentService.get(id));
  const summary = useServiceQuery(["students", id, "summary"], () => studentService.getCrossModuleSummary(id));

  if (q.isLoading) return <LoadingSkeleton variant="page" />;
  if (q.isError || !q.data) return <ErrorState message={getErrorMessage(q.error)} onRetry={() => q.refetch()} />;
  const s = q.data;
  const x = summary.data;
  const sumBlock = (node: React.ReactNode) =>
    summary.isLoading ? <LoadingSkeleton rows={3} /> : summary.isError ? <ErrorState onRetry={() => summary.refetch()} /> : node;

  return (
    <div className="space-y-6">
      {can("student-admission") && (
        <Button asChild variant="ghost" size="sm" className="-ml-2"><Link to="/students"><ArrowLeft className="h-4 w-4" />Back to students</Link></Button>
      )}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials(s.name)}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold">{s.name}</h1><StatusBadge status={s.status} /></div>
          <p className="text-sm text-muted-foreground">{s.id} · Roll {s.rollNo} · {s.program} {s.department} · {s.year} Div {s.division}</p>
        </div>
      </div>
      <Tabs defaultValue="personal">
        <div className="overflow-x-auto"><TabsList className="w-max">
          {["Personal", "Contact", "Academic", "Parent/Guardian", "Admission", "Documents", "Attendance", "Examination", "Fees", "Hostel", "Library"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()}>{t}</TabsTrigger>
          ))}
        </TabsList></div>
        <TabsContent value="personal"><Section><InfoGrid items={[
          { label: "Full name", value: s.name }, { label: "Gender", value: s.gender }, { label: "Date of birth", value: formatDate(s.dob) },
          { label: "Blood group", value: s.bloodGroup }, { label: "Category", value: s.category },
        ]} /></Section></TabsContent>
        <TabsContent value="contact"><Section><InfoGrid items={[
          { label: "Email", value: s.email }, { label: "Mobile", value: s.phone }, { label: "Address", value: s.address }, { label: "City", value: s.city },
        ]} /></Section></TabsContent>
        <TabsContent value="academic"><Section><InfoGrid items={[
          { label: "Program", value: s.program }, { label: "Department", value: s.department }, { label: "Year", value: s.year },
          { label: "Division", value: s.division }, { label: "Roll no.", value: s.rollNo },
        ]} /></Section></TabsContent>
        <TabsContent value="parent/guardian"><Section><InfoGrid items={[
          { label: "Name", value: s.parentName }, { label: "Mobile", value: s.parentPhone }, { label: "Occupation", value: s.parentOccupation },
        ]} /></Section></TabsContent>
        <TabsContent value="admission"><Section><InfoGrid items={[
          { label: "Admission year", value: s.admissionYear }, { label: "Admission type", value: s.admissionType }, { label: "Entrance percentile", value: s.entranceScore || "—" },
        ]} /></Section></TabsContent>
        <TabsContent value="documents"><Section title="Documents" actions={<Button size="sm" variant="outline" onClick={() => placeholder("Document upload")}><Upload className="h-4 w-4" />Upload</Button>}>
          {sumBlock(<ul className="divide-y">{x?.documents.map((d) => <li key={d.name} className="flex items-center justify-between px-4 py-3 text-sm">{d.name}<StatusBadge status={d.status} /></li>)}</ul>)}
        </Section></TabsContent>
        <TabsContent value="attendance"><Section title={x ? `Overall attendance: ${x.attendance.overall}%` : "Attendance"}>
          {sumBlock(<div className="space-y-3 p-4">{x?.attendance.subjects.map((a) => (
            <div key={a.subject}><div className="mb-1 flex justify-between text-sm"><span>{a.subject}</span><span className={a.pct < 75 ? "text-destructive" : ""}>{a.pct}%</span></div><Progress value={a.pct} /></div>
          ))}</div>)}
        </Section></TabsContent>
        <TabsContent value="examination"><Section>{sumBlock(x && <InfoGrid items={[
          { label: "CGPA", value: x.examination.cgpa.toFixed(2) }, { label: "Last SGPA", value: x.examination.lastSgpa.toFixed(2) }, { label: "Active backlogs", value: x.examination.backlogs },
        ]} />)}</Section></TabsContent>
        <TabsContent value="fees"><Section>{sumBlock(x && <InfoGrid items={[
          { label: "Total fee", value: formatINR(x.fees.total) }, { label: "Paid", value: formatINR(x.fees.paid) },
          { label: "Pending", value: formatINR(x.fees.pending) }, { label: "Status", value: <StatusBadge status={x.fees.status} /> },
        ]} />)}</Section></TabsContent>
        <TabsContent value="hostel"><Section>{sumBlock(x && (x.hostel.allocated
          ? <InfoGrid items={[{ label: "Hostel", value: x.hostel.hostel }, { label: "Room", value: x.hostel.room }]} />
          : <p className="p-4 text-sm text-muted-foreground">No hostel allocated (day scholar).</p>))}</Section></TabsContent>
        <TabsContent value="library"><Section>{sumBlock(x && <InfoGrid items={[
          { label: "Books issued", value: x.library.issued }, { label: "Overdue", value: x.library.overdue }, { label: "Fines due", value: formatINR(x.library.fines) },
        ]} />)}</Section></TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground">Attendance, examination, fee, hostel and library summaries are read-only and come from their respective modules.</p>
    </div>
  );
}
