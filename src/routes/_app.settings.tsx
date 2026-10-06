import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/utils/seo";
import { SettingsPage } from "@/views/SettingsPage";

export const Route = createFileRoute("/_app/settings")({
  head: () => pageHead("Settings", "Manage your ERP profile, notifications and security preferences."),
  component: SettingsPage,
});
