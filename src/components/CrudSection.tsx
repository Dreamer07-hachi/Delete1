import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ZodTypeAny } from "zod";
import { Button } from "@/components/ui/button";
import type { ModuleKey } from "@/config/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useList, useServiceMutation } from "@/hooks/useServiceQuery";
import type { Entity, Filters, ResourceService } from "@/types/common";
import { DataTable, type Column, type FilterDef, type RowAction } from "./DataTable";
import { EntityFormModal, type FieldDef } from "./FormField";
import { ConfirmDialog } from "./Modal";

/**
 * Full list + add/edit/delete flow for one resource: DataTable, zod form modal,
 * ConfirmDialog naming the item, toasts and permission-aware actions.
 */
export function CrudSection<T extends Entity>({
  queryKey, service, module, entityName, nameOf, columns, filters, fields, schema, defaults,
  toForm, fromForm, extraActions = [], toolbar, baseFilters, onView, exportName, searchPlaceholder,
  allowCreate = true, allowEdit = true, allowDelete = true, emptyDescription, createLabel,
}: {
  queryKey: string;
  service: ResourceService<T>;
  module: ModuleKey;
  entityName: string;
  nameOf: (row: T) => string;
  columns: Column<T>[];
  filters?: FilterDef[];
  fields?: FieldDef[];
  schema?: ZodTypeAny;
  defaults?: Record<string, unknown>;
  toForm?: (row: T) => Record<string, unknown>;
  fromForm?: (values: Record<string, unknown>, row?: T) => Partial<T>;
  extraActions?: RowAction<T>[];
  toolbar?: ReactNode;
  baseFilters?: Filters;
  onView?: (row: T) => void;
  exportName?: string;
  searchPlaceholder?: string;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  emptyDescription?: string;
  createLabel?: string;
}) {
  const perms = usePermissions();
  const list = useList<T>([queryKey], service.list, { baseFilters });
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);

  const canCreate = allowCreate && !!fields && perms.can(module, "create");
  const canEdit = allowEdit && !!fields && perms.can(module, "edit");
  const canDelete = allowDelete && perms.can(module, "delete");

  const save = useServiceMutation(
    (v: { id?: string; values: Partial<T> }) => (v.id ? service.update(v.id, v.values) : service.create(v.values as Omit<T, "id">)),
    {
      invalidate: [queryKey],
      success: (_r, v) => (v.id ? `${entityName} updated` : `${entityName} added`),
      onSuccess: () => { setEditing(null); setCreating(false); },
    },
  );
  const del = useServiceMutation((row: T) => service.remove(row.id), {
    invalidate: [queryKey],
    success: (_r, row) => `${entityName} "${nameOf(row)}" deleted`,
    onSuccess: () => setDeleting(null),
  });

  const actions: RowAction<T>[] = [
    ...(onView ? [{ label: "View", icon: <Eye className="h-4 w-4" />, onClick: onView }] : []),
    ...(canEdit ? [{ label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: (r: T) => setEditing(r) }] : []),
    ...extraActions,
    ...(canDelete ? [{ label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: (r: T) => setDeleting(r), destructive: true }] : []),
  ];

  const open = creating || !!editing;
  const addButton = canCreate && (
    <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />{createLabel ?? `Add ${entityName}`}</Button>
  );

  return (
    <>
      <DataTable
        list={list}
        columns={columns}
        filters={filters}
        actions={actions}
        exportName={exportName}
        searchPlaceholder={searchPlaceholder ?? `Search ${entityName.toLowerCase()}s…`}
        toolbar={<>{toolbar}{addButton}</>}
        emptyTitle={`No ${entityName.toLowerCase()} records`}
        emptyDescription={emptyDescription ?? (canCreate ? `Click "Add ${entityName}" to create the first one.` : "Nothing has been recorded yet.")}
        emptyAction={addButton || undefined}
      />
      {fields && schema && (
        <EntityFormModal
          open={open}
          onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
          title={editing ? `Edit ${entityName}` : `Add ${entityName}`}
          schema={schema}
          fields={fields}
          defaultValues={editing ? (toForm ? toForm(editing) : (editing as Record<string, unknown>)) : (defaults ?? {})}
          loading={save.isPending}
          onSubmit={(values) => save.mutate({ id: editing?.id, values: fromForm ? fromForm(values, editing ?? undefined) : (values as Partial<T>) })}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${entityName.toLowerCase()}?`}
        description={<>This will permanently delete <strong>{deleting ? nameOf(deleting) : ""}</strong>. This action cannot be undone.</>}
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting)}
      />
    </>
  );
}
