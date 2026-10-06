import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { AccessDenied } from "@/components/States";
import { TooltipProvider } from "@/components/ui/tooltip";
import { moduleForPath } from "@/config/modules";
import { usePermissions } from "@/hooks/usePermissions";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";
import { ModuleSubNav } from "./ModuleSubNav";
import { Sidebar } from "./Sidebar";

/** Students may open their own profile (/students/<ownId>) even without Student & Admission access. */
function isOwnProfile(pathname: string, studentId?: string) {
  return !!studentId && pathname === `/students/${studentId}`;
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { can, user } = usePermissions();
  const module = moduleForPath(pathname);
  const allowed = !module || can(module.key) || isOwnProfile(pathname, user?.studentId);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsed={collapsed} />
        <MobileDrawer open={drawer} onOpenChange={setDrawer} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenu={() => setDrawer(true)} onToggleCollapse={() => setCollapsed((c) => !c)} />
          {module && allowed && can(module.key) && <ModuleSubNav module={module} />}
          <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6">
            {allowed ? <Outlet /> : <AccessDenied moduleLabel={module?.label} />}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
