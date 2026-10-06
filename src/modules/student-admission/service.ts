import { apiConfig } from "@/config/api";
import { apiClient, createRestResource, mockDelay } from "@/services/apiClient";
import { createMockCollection } from "@/services/mockStore";
import { REF_DATE } from "@/services/mockSeed";
import type { ResourceService } from "@/types/common";
import { seedApplications, seedStudents } from "./mockData";
import type { AdmissionStats, Application, CrossModuleSummary, DocStatus, Student, StudentStats } from "./types";

/* ------------------------------ Students ------------------------------ */

export interface StudentService extends ResourceService<Student> {
  getStats(): Promise<StudentStats>;
  /** Read-only summaries from Attendance, Exam, Finance, Hostel and Library modules. */
  getCrossModuleSummary(studentId: string): Promise<CrossModuleSummary>;
}

const students = createMockCollection(seedStudents, { searchKeys: ["id", "name", "email", "phone", "rollNo"], idPrefix: "STU2026" });

const mockStudentService: StudentService = {
  ...students,
  async getStats() {
    await mockDelay();
    const rows = students.rows();
    const count = (k: keyof Student) =>
      Object.entries(rows.reduce<Record<string, number>>((a, s) => ({ ...a, [String(s[k])]: (a[String(s[k])] ?? 0) + 1 }), {}));
    return {
      total: rows.length,
      active: rows.filter((s) => s.status === "Active").length,
      newAdmissions: rows.filter((s) => s.admissionYear === 2026).length,
      byDepartment: count("department").map(([department, students]) => ({ department, students })),
      byYear: ["FE", "SE", "TE", "BE"].map((y) => ({ year: y, students: rows.filter((s) => s.year === y).length })),
    };
  },
  async getCrossModuleSummary(studentId) {
    await mockDelay();
    const seed = Number(studentId.slice(-2)) || 1;
    return {
      // to be fetched from the Attendance module API: GET /api/attendance/students/:id/summary
      attendance: {
        overall: 70 + ((seed * 7) % 25),
        subjects: [["DBMS", 88], ["TOC", 79], ["CN", 86], ["SPOS", 72]].map(([subject, pct]) => ({ subject: String(subject), pct: Number(pct) - (seed % 5) })),
      },
      // to be fetched from the Examination module API: GET /api/examination/students/:id/summary
      examination: { cgpa: 7 + ((seed * 13) % 30) / 10, lastSgpa: 7.2 + ((seed * 11) % 25) / 10, backlogs: seed % 6 === 0 ? 1 : 0 },
      // to be fetched from the Finance module API: GET /api/finance/students/:id/summary
      fees: { total: 135000, paid: seed % 3 === 0 ? 135000 : 90000, pending: seed % 3 === 0 ? 0 : 45000, status: seed % 3 === 0 ? "Paid" : "Partial" },
      // to be fetched from the Hostel module API: GET /api/hostel/students/:id/allocation
      hostel: seed % 2 === 1 ? { allocated: true, hostel: "Saraswati Boys Hostel", room: `S-${100 + seed}` } : { allocated: false },
      // to be fetched from the Library module API: GET /api/library/members/:id/summary
      library: { issued: seed % 3, overdue: seed % 4 === 0 ? 1 : 0, fines: seed % 4 === 0 ? 24 : 0 },
      documents: [
        { name: "10th Marksheet", status: "Verified" }, { name: "12th Marksheet", status: "Verified" },
        { name: "MHT-CET Scorecard", status: "Verified" }, { name: "Caste Validity", status: seed % 2 ? "Pending" : "Verified" },
        { name: "Gap Certificate", status: "Pending" },
      ],
    };
  },
};

const restStudentService: StudentService = {
  ...createRestResource<Student>(apiConfig.students.baseUrl), // GET/POST /api/students, GET/PATCH/DELETE /api/students/:id
  getStats: () => apiClient.get(`${apiConfig.students.baseUrl}/stats`), // GET /api/students/stats
  getCrossModuleSummary: (id) => apiClient.get(`${apiConfig.students.baseUrl}/${id}/summary`), // GET /api/students/:id/summary
};

export const studentService: StudentService = apiConfig.students.useMock ? mockStudentService : restStudentService;

/* ----------------------------- Admissions ----------------------------- */

export interface AdmissionService extends ResourceService<Application> {
  getStats(): Promise<AdmissionStats>;
  verifyDocument(appId: string, docName: string, status: DocStatus): Promise<Application>;
  decide(appId: string, decision: "Approved" | "Rejected", remarks: string): Promise<Application>;
}

const applications = createMockCollection(seedApplications, { searchKeys: ["id", "applicantName", "email", "department"], idPrefix: "APP26" });

const mockAdmissionService: AdmissionService = {
  ...applications,
  async getStats() {
    await mockDelay();
    const rows = applications.rows();
    const c = (s: string) => rows.filter((a) => a.status === s).length;
    return { pending: c("Pending"), underReview: c("Under Review"), approved: c("Approved"), rejected: c("Rejected") };
  },
  async verifyDocument(appId, docName, status) {
    await mockDelay();
    const app = applications.rows().find((a) => a.id === appId)!;
    return applications.set(appId, {
      status: app.status === "Pending" ? "Under Review" : app.status,
      documents: app.documents.map((d) => (d.name === docName ? { ...d, status } : d)),
    });
  },
  async decide(appId, decision, remarks) {
    await mockDelay();
    const app = applications.rows().find((a) => a.id === appId)!;
    return applications.set(appId, {
      status: decision,
      remarks,
      history: [...app.history, { date: REF_DATE, action: `Application ${decision.toLowerCase()}${remarks ? ` — ${remarks}` : ""}`, by: "Admission Office" }],
    });
  },
};

const admissionBase = apiConfig.admissions.baseUrl;
const restAdmissionService: AdmissionService = {
  ...createRestResource<Application>(admissionBase), // /api/admissions
  getStats: () => apiClient.get(`${admissionBase}/stats`), // GET /api/admissions/stats
  verifyDocument: (id, doc, status) => apiClient.patch(`${admissionBase}/${id}/documents`, { doc, status }), // PATCH /api/admissions/:id/documents
  decide: (id, decision, remarks) => apiClient.post(`${admissionBase}/${id}/decision`, { decision, remarks }), // POST /api/admissions/:id/decision
};

export const admissionService: AdmissionService = apiConfig.admissions.useMock ? mockAdmissionService : restAdmissionService;
