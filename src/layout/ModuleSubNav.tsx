import { Link } from "@tanstack/react-router";
import type { ModuleDef } from "@/config/modules";

export function ModuleSubNav({ module }: { module: ModuleDef }) {
  if (!module.tabs.length) return null;
  return (
    <div className="border-b bg-card">
      <nav className="flex gap-1 overflow-x-auto px-4 sm:px-6" aria-label={`${module.label} sections`}>
        {module.tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: !!t.exact }}
            className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "!border-primary font-medium !text-foreground" }}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
