import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEATURE_MODULES } from "@/config/modules";
import { pageHead } from "@/utils/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead("Home", "Unified Digital Platform for Students, Faculty and Administration at Pune Institute of Computer Technology."),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></div>
            <span className="font-semibold">PICT College ERP</span>
          </div>
          <Button asChild size="sm"><Link to="/login">Login</Link></Button>
        </div>
      </header>
      <section className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-wider text-teal">Pune Institute of Computer Technology</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">PICT College ERP</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Unified Digital Platform for Students, Faculty and Administration</p>
          <Button asChild size="lg" className="mt-8"><Link to="/login">Login to ERP <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-lg font-semibold">Modules</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_MODULES.map((m) => (
            <div key={m.key} className="flex flex-col rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary"><m.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold">{m.label}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.description}</p>
              <Button asChild variant="outline" size="sm" className="mt-4 self-start"><Link to="/login"><Lock className="h-3.5 w-3.5" />Login to Access</Link></Button>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">© 2026 Pune Institute of Computer Technology · Demo ERP (mock data)</footer>
    </div>
  );
}
