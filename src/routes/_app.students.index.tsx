import { createFileRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/modules/student-admission";
import { pageHead } from "@/utils/seo";

export const Route = createFileRoute("/_app/students/")({
  head: () => pageHead("Students", "Student records, department statistics and profiles."),
  component: StudentsPage,
});
