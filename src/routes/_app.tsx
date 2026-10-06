import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/layout/AppShell";
import { authService } from "@/services/authService";

// Session lives in browser storage, so the authenticated area renders client-side only.
export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: () => {
    if (!authService.getSession()) throw redirect({ to: "/login" });
  },
  component: AppShell,
});
