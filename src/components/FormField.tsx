import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, type Control, type FieldValues, type Path } from "react-hook-form";
import type { ZodTypeAny } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Option } from "@/types/common";
import { Modal } from "./Modal";

export type FieldType = "text" | "email" | "tel" | "number" | "date" | "time" | "select" | "textarea" | "checkbox" | "password";

export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType;
  options?: Option[] | readonly string[];
  required?: boolean;
  placeholder?: string;
  full?: boolean;
  disabled?: boolean;
}

const toOptions = (o: FieldDef["options"]): Option[] =>
  (o ?? []).map((x) => (typeof x === "string" ? { label: x, value: x } : x));

export function FormField<T extends FieldValues>({ control, field }: { control: Control<T>; field: FieldDef }) {
  const id = `f-${field.name}`;
  return (
    <Controller
      control={control}
      name={field.name as Path<T>}
      render={({ field: f, fieldState }) => (
        <div className={cn("space-y-1.5", field.full && "md:col-span-2")}>
          {field.type !== "checkbox" && (
            <Label htmlFor={id}>
              {field.label}
              {field.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
          )}
          {field.type === "select" ? (
            <Select value={f.value ? String(f.value) : undefined} onValueChange={f.onChange} disabled={field.disabled}>
              <SelectTrigger id={id} aria-invalid={!!fieldState.error}><SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} /></SelectTrigger>
              <SelectContent>
                {toOptions(field.options).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : field.type === "textarea" ? (
            <Textarea id={id} {...f} value={f.value ?? ""} placeholder={field.placeholder} disabled={field.disabled} aria-invalid={!!fieldState.error} />
          ) : field.type === "checkbox" ? (
            <label htmlFor={id} className="flex items-center gap-2 text-sm">
              <Checkbox id={id} checked={!!f.value} onCheckedChange={(v) => f.onChange(!!v)} />
              {field.label}
            </label>
          ) : (
            <Input
              id={id}
              type={field.type ?? "text"}
              {...f}
              value={f.value ?? ""}
              onChange={(e) => f.onChange(field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              aria-invalid={!!fieldState.error}
            />
          )}
          {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
        </div>
      )}
    />
  );
}

/** Modal form generated from field definitions + zod schema. Single column on mobile, two on md+. */
export function EntityFormModal<T extends FieldValues>({
  open, onOpenChange, title, description, schema, fields, defaultValues, onSubmit, submitLabel = "Save", loading,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string;
  schema: ZodTypeAny; fields: FieldDef[]; defaultValues: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>; submitLabel?: string; loading?: boolean;
}) {
  const form = useForm<T>({ resolver: zodResolver(schema), defaultValues: defaultValues as never });
  useEffect(() => {
    if (open) form.reset(defaultValues as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description} size="lg">
      <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((f) => <FormField key={f.name} control={form.control} field={f} />)}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}
