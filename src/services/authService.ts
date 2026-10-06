import { apiConfig } from "@/config/api";
import type { Role } from "@/config/permissions";
import { apiClient, HttpError, mockDelay } from "./apiClient";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Linked student record for the Student role. */
  studentId?: string;
  facultyId?: string;
}

export interface Session {
  user: SessionUser;
  token: string;
}

export interface AuthService {
  login(identifier: string, password: string, remember: boolean): Promise<Session>;
  loginAs(role: Role): Promise<Session>;
  logout(): void;
  getSession(): Session | null;
  subscribe(cb: () => void): () => void;
  requestPasswordReset(email: string): Promise<void>;
}

const KEY = "pict-erp-session";
export const DEMO_PASSWORD = "demo123";

export const DEMO_USERS: SessionUser[] = [
  { id: "U001", name: "Dr. Anil Bhandari", email: "admin@pict.edu", role: "super_admin" },
  { id: "U002", name: "Mrs. Shalini Kapoor", email: "admissions@pict.edu", role: "admission_officer" },
  { id: "U003", name: "Dr. Manish Verma", email: "academic@pict.edu", role: "academic_admin" },
  { id: "U004", name: "Prof. Meera Deshpande", email: "faculty@pict.edu", role: "faculty", facultyId: "FAC002" },
  { id: "U005", name: "Mr. Ganesh Pillai", email: "hr@pict.edu", role: "hr_admin" },
  { id: "U006", name: "Mrs. Lata Kulkarni", email: "accounts@pict.edu", role: "accounts_officer" },
  { id: "U007", name: "Mr. Dinesh Yadav", email: "hostel@pict.edu", role: "hostel_admin" },
  { id: "U008", name: "Mrs. Rekha Sawant", email: "library@pict.edu", role: "librarian" },
  { id: "U009", name: "Aarav Kulkarni", email: "aarav.kulkarni@pict.edu", role: "student", studentId: "STU2023001" },
];

const listeners = new Set<() => void>();
let cached: Session | null | undefined;

function read(): Session | null {
  if (typeof window === "undefined") return null;
  if (cached !== undefined) return cached;
  const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
  try {
    cached = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cached = null;
  }
  return cached;
}

function persist(session: Session | null, remember = true) {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  if (session) (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
  cached = session;
  listeners.forEach((l) => l());
}

const mockAuthService: AuthService = {
  async login(identifier, password, remember) {
    await mockDelay();
    const id = identifier.trim().toLowerCase();
    const user = DEMO_USERS.find((u) => u.email === id || u.email.split("@")[0] === id);
    if (!user || password !== DEMO_PASSWORD) {
      throw new HttpError(`Invalid credentials. Use a demo email with password "${DEMO_PASSWORD}".`, 401);
    }
    const session = { user, token: `mock-${user.id}` };
    persist(session, remember);
    return session;
  },
  async loginAs(role) {
    const user = DEMO_USERS.find((u) => u.role === role)!;
    const session = { user, token: `mock-${user.id}` };
    persist(session, true);
    return session;
  },
  logout: () => persist(null),
  getSession: read,
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  async requestPasswordReset() {
    await mockDelay();
  },
};

const restAuthService: AuthService = {
  ...mockAuthService,
  async login(identifier, password, remember) {
    // POST /api/auth/login → { user, token }
    const session = await apiClient.post<Session>(`${apiConfig.auth.baseUrl}/login`, { identifier, password });
    persist(session, remember);
    return session;
  },
  async requestPasswordReset(email) {
    // POST /api/auth/forgot-password
    await apiClient.post(`${apiConfig.auth.baseUrl}/forgot-password`, { email });
  },
};

export const authService: AuthService = apiConfig.auth.useMock ? mockAuthService : restAuthService;
