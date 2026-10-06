export type Role =
  | "super_admin"
  | "admission_officer"
  | "academic_admin"
  | "faculty"
  | "hr_admin"
  | "accounts_officer"
  | "hostel_admin"
  | "librarian"
  | "student";

export type ModuleKey =
  | "dashboard"
  | "student-admission"
  | "academic"
  | "attendance-examination"
  | "faculty-hr"
  | "finance"
  | "hostel"
  | "library-services"
  | "settings";

export type Action = "view" | "create" | "edit" | "delete" | "approve";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admission_officer: "Admission Officer",
  academic_admin: "Academic Administrator",
  faculty: "Faculty",
  hr_admin: "HR / Admin",
  accounts_officer: "Accounts Officer",
  hostel_admin: "Hostel Administrator",
  librarian: "Librarian",
  student: "Student",
};

const FULL: Action[] = ["view", "create", "edit", "delete", "approve"];
const READ: Action[] = ["view"];
const ALWAYS: Partial<Record<ModuleKey, Action[]>> = { dashboard: READ, settings: ["view", "edit"] };

/** Role → module → allowed actions. Missing module = no access (Access Denied). */
export const PERMISSIONS: Record<Role, Partial<Record<ModuleKey, Action[]>>> = {
  super_admin: {
    ...ALWAYS,
    "student-admission": FULL,
    academic: FULL,
    "attendance-examination": FULL,
    "faculty-hr": FULL,
    finance: FULL,
    hostel: FULL,
    "library-services": FULL,
  },
  admission_officer: { ...ALWAYS, "student-admission": FULL },
  academic_admin: { ...ALWAYS, academic: FULL, "attendance-examination": FULL },
  // Faculty: mark attendance (create) + enter marks (edit); academic read-only; no HR.
  faculty: { ...ALWAYS, academic: READ, "attendance-examination": ["view", "create", "edit"] },
  hr_admin: { ...ALWAYS, "faculty-hr": FULL },
  accounts_officer: { ...ALWAYS, finance: FULL },
  hostel_admin: { ...ALWAYS, hostel: FULL },
  librarian: { ...ALWAYS, "library-services": FULL },
  // Student: read-only, scoped to own records; may raise hostel/service requests (create).
  student: {
    ...ALWAYS,
    academic: READ,
    "attendance-examination": READ,
    finance: READ,
    hostel: ["view", "create"],
    "library-services": ["view", "create"],
  },
};

export function can(role: Role | undefined, module: ModuleKey, action: Action = "view"): boolean {
  if (!role) return false;
  return PERMISSIONS[role][module]?.includes(action) ?? false;
}
