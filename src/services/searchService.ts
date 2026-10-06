import { apiConfig } from "@/config/api";
import { apiClient, mockDelay } from "./apiClient";
import { getFacultyRoster, getStudentRoster, SUBJECTS } from "./mockSeed";

export interface SearchResult {
  id: string;
  kind: "Student" | "Faculty" | "Course";
  label: string;
  sub: string;
}

export interface SearchService {
  search(q: string): Promise<SearchResult[]>;
}

const mockSearchService: SearchService = {
  async search(q) {
    await mockDelay();
    const s = q.toLowerCase();
    const students = getStudentRoster().filter((x) => x.name.toLowerCase().includes(s) || x.id.toLowerCase().includes(s))
      .map((x) => ({ id: x.id, kind: "Student" as const, label: x.name, sub: `${x.id} · ${x.department}` }));
    const faculty = getFacultyRoster().filter((x) => x.name.toLowerCase().includes(s))
      .map((x) => ({ id: x.id, kind: "Faculty" as const, label: x.name, sub: `${x.designation} · ${x.department}` }));
    const courses = SUBJECTS.filter((x) => x.name.toLowerCase().includes(s) || x.code.toLowerCase().includes(s))
      .map((x) => ({ id: x.code, kind: "Course" as const, label: `${x.code} — ${x.name}`, sub: x.dept }));
    return [...students, ...faculty, ...courses].slice(0, 8);
  },
};

const restSearchService: SearchService = {
  search: (q) => apiClient.get(`${apiConfig.search.baseUrl}?q=${encodeURIComponent(q)}`), // GET /api/search?q=
};

export const searchService: SearchService = apiConfig.search.useMock ? mockSearchService : restSearchService;
