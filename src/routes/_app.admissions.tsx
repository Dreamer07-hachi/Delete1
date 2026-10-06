import { createFileRoute } from "@tanstack/react-router";
import { AdmissionsPage } from "@/modules/student-admission";
import { pageHead } from "@/utils/seo";

export const Route = createFileRoute("/_app/admissions")({
  head: () => pageHead("Admissions", "Review admission applications, verify documents and approve or reject."),
  component: AdmissionsPage,
});
