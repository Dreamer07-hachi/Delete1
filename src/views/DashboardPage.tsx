import { Link } from "@tanstack/react-router";
import {
  Activity, BedDouble, BookOpen, Building2, CalendarClock, CalendarDays, GraduationCap, IndianRupee, Library, UserPlus, Users,
} from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard, KpiGrid } from "@/components/KpiCard";
import { PageHeader, Section } from "@/components/PageHeader";
import { ErrorState, LoadingSkeleton } from "@/components/States";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getErrorMessage } from "@/services/apiClient";
import { dashboardService } from "@/services/dashboardService";
import { formatDate, formatINR, formatINRCompact, formatNumber } from "@/utils/format";

export function DashboardPage() {
  const { isStudent, user } = usePermissions();
  return isStudent && user?.studentId ? <StudentDashboard studentId={user.studentId} /> : <AdminDashboard />;
}

function AdminDashboard() {
  const q = useServiceQuery(["dashboard"], dashboardService.getSummary);
  const { user } = usePermissions();
  if (q.isLoading) return <LoadingSkeleton variant="page" />;
  if (q.isError || !q.data) return <ErrorState message={getErrorMessage(q.error)} onRetry={() => q.refetch()} />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.name.split(" ").slice(0, 2).join(" ")}`} description="College-wide overview for academic year 2026–27" />
      <KpiGrid>
        <KpiCard label="Total Students" value={formatNumber(d.kpis.totalStudents)} icon={GraduationCap} />
        <KpiCard label="New Admissions" value={formatNumber(d.kpis.newAdmissions)} icon={UserPlus} accent="teal" hint="AY 2026–27" />
        <KpiCard label="Faculty Members" value={formatNumber(d.kpis.facultyMembers)} icon={Users} />
        <KpiCard label="Attendance" value={`${d.kpis.attendancePct}%`} icon={Activity} accent="success" hint="This month" />
        <KpiCard label="Pending Fees" value={formatINRCompact(d.kpis.pendingFees)} icon={IndianRupee} accent="amber" />
        <KpiCard label="Upcoming Exams" value={d.kpis.upcomingExams} icon={CalendarClock} accent="teal" hint="Next 30 days" />
        <KpiCard label="Hostel Occupancy" value={`${d.kpis.hostelOccupancyPct}%`} icon={Building2} />
        <KpiCard label="Books Issued" value={formatNumber(d.kpis.booksIssued)} icon={Library} accent="teal" />
      </KpiGrid>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Enrollment trend" type="line" data={d.enrollmentTrend} xKey="year" series={[{ key: "students", label: "Students" }]} />
        <ChartCard title="Department-wise distribution" type="pie" data={d.departmentDistribution} xKey="department" series={[{ key: "students", label: "Students" }]} />
        <ChartCard title="Attendance overview (%)" type="area" data={d.attendanceOverview} xKey="month" series={[{ key: "attendance", label: "Attendance %" }]} />
        <ChartCard title="Fee collected vs pending" type="bar" data={d.feeCollection} xKey="month" series={[{ key: "collected", label: "Collected" }, { key: "pending", label: "Pending" }]} valueFormatter={formatINRCompact} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Exam performance (grade distribution)" type="bar" data={d.examPerformance} xKey="grade" series={[{ key: "students", label: "Students" }]} />
        <Section title="Recent activity">
          <ul className="divide-y">
            {d.activity.map((a) => (
              <li key={a.id} className="px-4 py-3">
                <p className="text-sm">{a.text}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Upcoming events">
          <ul className="divide-y">
            {d.events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                </div>
                <StatusBadge status={e.category} tone={e.category === "Fee" ? "warning" : e.category === "Exam" ? "info" : "neutral"} />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function StudentDashboard({ studentId }: { studentId: string }) {
  const q = useServiceQuery(["dashboard", "student", studentId], () => dashboardService.getStudentDashboard(studentId));
  if (q.isLoading) return <LoadingSkeleton variant="page" />;
  if (q.isError || !q.data) return <ErrorState message={getErrorMessage(q.error)} onRetry={() => q.refetch()} />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${d.name.split(" ")[0]}`}
        description={`${d.studentId} · ${d.program}`}
        actions={<Button asChild variant="outline" size="sm"><Link to="/students/$id" params={{ id: studentId }}>View my profile</Link></Button>}
      />
      <KpiGrid cols={5}>
        <KpiCard label="My Attendance" value={`${d.attendancePct}%`} icon={Activity} accent="success" />
        <KpiCard label="CGPA" value={d.cgpa.toFixed(2)} icon={GraduationCap} />
        <KpiCard label="Fees Due" value={formatINR(d.feesDue)} icon={IndianRupee} accent="amber" />
        <KpiCard label="Books Issued" value={d.booksIssued} icon={BookOpen} accent="teal" />
        <KpiCard label="Hostel" value={<span className="text-base">{d.hostelRoom}</span>} icon={BedDouble} />
      </KpiGrid>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Attendance by subject (%)" type="bar" data={d.attendanceBySubject} xKey="subject" series={[{ key: "pct", label: "Attendance %" }]} />
        </div>
        <Section title="Upcoming">
          <ul className="divide-y">
            {d.upcoming.map((u) => (
              <li key={u.id} className="flex items-start gap-3 px-4 py-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div><p className="text-sm">{u.title}</p><p className="text-xs text-muted-foreground">{formatDate(u.date)} · {u.category}</p></div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button asChild variant="outline"><Link to="/academic/timetable">My timetable</Link></Button>
        <Button asChild variant="outline"><Link to="/examinations/results">My results</Link></Button>
        <Button asChild variant="outline"><Link to="/finance/payments">My fee receipts</Link></Button>
        <Button asChild variant="outline"><Link to="/student-services">Raise a request</Link></Button>
      </div>
    </div>
  );
}
