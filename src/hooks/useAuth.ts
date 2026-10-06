import { useSyncExternalStore } from "react";
import { authService, type Session } from "@/services/authService";

export function useAuth(): { session: Session | null; user: Session["user"] | null; logout: () => void } {
  const session = useSyncExternalStore(authService.subscribe, authService.getSession, () => null);
  return { session, user: session?.user ?? null, logout: authService.logout };
}
