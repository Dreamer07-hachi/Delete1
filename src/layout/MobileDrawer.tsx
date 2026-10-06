import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Brand, SidebarNav } from "./Sidebar";

export function MobileDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">ERP modules</SheetDescription>
        <div className="flex h-16 items-center border-b border-sidebar-border px-4"><Brand /></div>
        <div className="p-3"><SidebarNav onNavigate={() => onOpenChange(false)} /></div>
      </SheetContent>
    </Sheet>
  );
}
