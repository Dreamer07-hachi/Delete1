import type { StudentFormValues } from "./validation";
import type { Student } from "./types";
import { DEPARTMENTS } from "@/services/mockSeed";

/** Fills derived/defaulted fields when creating a student from the form. */
export function studentFromForm(v: StudentFormValues, existing?: Student): Partial<Student> {
  const code = DEPARTMENTS.find((d) => d.name === v.department)?.code ?? "XX";
  return {
    ...v,
    gender: v.gender,
    status: v.status as Student["status"],
    rollNo: existing?.rollNo ?? `${v.year}${code}${v.division}${String(Date.now()).slice(-2)}`,
    address: existing?.address ?? "",
    bloodGroup: existing?.bloodGroup ?? "—",
    category: existing?.category ?? "Open",
    parentOccupation: existing?.parentOccupation ?? "—",
    admissionType: existing?.admissionType ?? "Institute Level",
    entranceScore: existing?.entranceScore ?? 0,
  };
}

export const docProgress = (docs: { status: string }[]) => docs.filter((d) => d.status === "Verified").length;
