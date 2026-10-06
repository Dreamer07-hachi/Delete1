import { createFileRoute } from "@tanstack/react-router";
import { StudentProfilePage } from "@/modules/student-admission";
import { pageHead } from "@/utils/seo";

export const Route = createFileRoute("/_app/students/$id")({
  head: () => pageHead("Student Profile", "Personal, academic, admission and cross-module summary for a student."),
  component: ProfileRoute,
});

function ProfileRoute() {
  const { id } = Route.useParams();
  return <StudentProfilePage key={id} id={id} />;
}
