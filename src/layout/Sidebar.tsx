import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MODULES } from "@/config/modules";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

export function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <GraduationCap className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-accent-foreground">PICT College ERP</p>
          <p className="text-[11px] text-sidebar-foreground/70">Pune Institute of Computer Technology</p>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { can } = usePermissions();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = MODULES.filter((m) => can(m.key));
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {items.map((m) => {
        const active = m.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
        const Icon = m.icon;
        const link = (
          <Link
            to={m.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-sidebar-primary")} />
            {!collapsed && <span className="truncate">{m.label}</span>}
          </Link>
        );
        return collapsed ? (
          <Tooltip key={m.key}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{m.label}</TooltipContent>
          </Tooltip>
        ) : (
          <div key={m.key}>{link}</div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] lg:flex", collapsed ? "w-[68px]" : "w-64")}>
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-2")}>
        <Brand collapsed={collapsed} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  );
}
