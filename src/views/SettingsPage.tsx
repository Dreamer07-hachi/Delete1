import { toast } from "sonner";
import { InfoGrid, PageHeader, Section } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ROLE_LABELS } from "@/config/permissions";
import { useAuth } from "@/hooks/useAuth";
import { placeholder } from "@/utils/export";

export function SettingsPage() {
  const { user } = useAuth();
  const prefs = [
    { id: "email", label: "Email notifications", desc: "Fee reminders, exam schedules and approvals." },
    { id: "sms", label: "SMS alerts", desc: "Critical alerts such as attendance shortage." },
    { id: "compact", label: "Compact tables", desc: "Show more rows per screen." },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your account and preferences" />
      <Section title="Profile" actions={<Button size="sm" variant="outline" onClick={() => placeholder("Profile editing")}>Edit profile</Button>}>
        <InfoGrid items={[
          { label: "Name", value: user?.name },
          { label: "Email", value: user?.email },
          { label: "Role", value: user ? ROLE_LABELS[user.role] : "" },
        ]} />
      </Section>
      <Section title="Preferences">
        <div className="divide-y">
          {prefs.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <Label htmlFor={`pref-${p.id}`}>{p.label}</Label>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
              <Switch id={`pref-${p.id}`} defaultChecked={i < 2} onCheckedChange={(v) => toast.success(`${p.label} ${v ? "enabled" : "disabled"}`)} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Security">
        <div className="flex flex-wrap gap-2 p-4">
          <Button variant="outline" onClick={() => placeholder("Change password")}>Change password</Button>
          <Button variant="outline" onClick={() => placeholder("Two-factor authentication")}>Enable two-factor authentication</Button>
        </div>
      </Section>
    </div>
  );
}
