import { z } from "zod";
import type { FieldDef } from "@/components/FormField";
import { DEPARTMENT_NAMES, DIVISIONS, YEARS } from "@/services/mockSeed";

export const studentSchema = z.object({
  name: z.string().trim().min(3, "Enter the full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Select gender" }) }),
  dob: z.string().min(1, "Date of birth is required"),
  department: z.string().min(1, "Select a department"),
  program: z.string().min(1, "Select a program"),
  year: z.string().min(1, "Select a year"),
  division: z.string().min(1, "Select a division"),
  admissionYear: z.coerce.number().int().min(2015, "Invalid year").max(2030, "Invalid year"),
  status: z.string().min(1, "Select a status"),
  parentName: z.string().trim().min(3, "Parent/guardian name is required").max(80),
  parentPhone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  city: z.string().trim().min(2, "City is required").max(50),
});
export type StudentFormValues = z.infer<typeof studentSchema>;

export const studentFields: FieldDef[] = [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Mobile", type: "tel", required: true },
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"], required: true },
  { name: "dob", label: "Date of birth", type: "date", required: true },
  { name: "department", label: "Department", type: "select", options: DEPARTMENT_NAMES, required: true },
  { name: "program", label: "Program", type: "select", options: ["B.E.", "M.E.", "Ph.D."], required: true },
  { name: "year", label: "Year", type: "select", options: YEARS, required: true },
  { name: "division", label: "Division", type: "select", options: DIVISIONS, required: true },
  { name: "admissionYear", label: "Admission year", type: "number", required: true },
  { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Alumni", "Suspended"], required: true },
  { name: "city", label: "City", required: true },
  { name: "parentName", label: "Parent / guardian name", required: true },
  { name: "parentPhone", label: "Parent mobile", type: "tel", required: true },
];

export const studentDefaults: Partial<StudentFormValues> = { program: "B.E.", admissionYear: 2026, status: "Active", year: "FE" };
