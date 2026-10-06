import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/utils/seo";
import { DashboardPage } from "@/views/DashboardPage";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => pageHead("Dashboard", "College-wide KPIs, charts, activity and upcoming events."),
  component: DashboardPage,
});
