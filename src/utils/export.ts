import { toast } from "sonner";

/** Placeholder: export will call the backend export endpoint once REST is connected. */
export function exportPlaceholder(name: string) {
  toast.info(`Placeholder: "${name}" export to CSV/Excel will be available when the backend is connected.`);
}

/** Generic placeholder toast for actions that need a backend (email, upload, SMS…). */
export function placeholder(action: string) {
  toast.info(`Placeholder: ${action} is not available in the demo yet.`);
}
