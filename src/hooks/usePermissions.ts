import { can, type Action, type ModuleKey } from "@/config/permissions";
import type { Filters } from "@/types/common";
import { useAuth } from "./useAuth";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  return {
    role,
    user,
    isStudent: role === "student",
    can: (module: ModuleKey, action: Action = "view") => can(role, module, action),
    /** Filters that scope lists to the signed-in student's own records. */
    ownScope: (key = "studentId"): Filters => (role === "student" && user?.studentId ? { [key]: user.studentId } : {}),
  };
}
