/**
 * Route → page mapping for this module. Route files under src/routes import
 * these; TanStack Router's automatic code-splitting lazy-loads each page.
 *   /students       → StudentsPage
 *   /students/$id   → StudentProfilePage
 *   /admissions     → AdmissionsPage
 */
export { StudentsPage } from "./pages/StudentsPage";
export { StudentProfilePage } from "./pages/StudentProfilePage";
export { AdmissionsPage } from "./pages/AdmissionsPage";
