import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/FormField";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, type Role } from "@/config/permissions";
import { getErrorMessage } from "@/services/apiClient";
import { authService, DEMO_PASSWORD, DEMO_USERS } from "@/services/authService";
import { pageHead } from "@/utils/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead("Login", "Sign in to PICT College ERP with your institute credentials or a demo role."),
  component: LoginPage,
});

const schema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required").max(120),
  password: z.string().min(1, "Password is required").max(100),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { identifier: "", password: "", remember: true } });

  useEffect(() => {
    if (authService.getSession()) navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      const s = await authService.login(v.identifier, v.password, v.remember);
      toast.success(`Welcome, ${s.user.name}`);
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const demo = async (role: Role) => {
    const s = await authService.loginAs(role);
    toast.success(`Signed in as ${ROLE_LABELS[role]}`, { description: s.user.name });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-label="PICT College ERP home"><GraduationCap className="h-7 w-7" /></Link>
          <h1 className="mt-4 text-2xl font-semibold">PICT College ERP</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField control={form.control} field={{ name: "identifier", label: "Email or username", required: true, placeholder: "admin@pict.edu" }} />
            <FormField control={form.control} field={{ name: "password", label: "Password", type: "password", required: true, placeholder: "••••••••" }} />
            <div className="flex items-center justify-between">
              <FormField control={form.control} field={{ name: "remember", label: "Remember me", type: "checkbox" }} />
              <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setForgot(true)}>Forgot password?</Button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Login"}</Button>
          </form>
          <p className="mt-3 text-center text-xs text-muted-foreground">Demo password for all accounts: <code className="rounded bg-muted px-1">{DEMO_PASSWORD}</code></p>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Demo login as</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEMO_USERS.map((u) => (
              <Button key={u.role} variant="outline" size="sm" className="h-auto whitespace-normal py-2 text-xs" onClick={() => demo(u.role)}>{ROLE_LABELS[u.role]}</Button>
            ))}
          </div>
        </div>
      </div>
      <Modal open={forgot} onOpenChange={setForgot} title="Reset password" description="We'll email a reset link to your registered address.">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(resetEmail)) return toast.error("Enter a valid email address");
            await authService.requestPasswordReset(resetEmail).catch(() => undefined);
            toast.info("Placeholder: password reset email will be sent once the backend is connected.");
            setForgot(false);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="reset-email">Email<span className="text-destructive">*</span></Label>
            <Input id="reset-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@pict.edu" />
          </div>
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
      </Modal>
    </div>
  );
}
