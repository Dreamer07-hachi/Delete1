import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Download, MoreHorizontal, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListState } from "@/hooks/useServiceQuery";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/apiClient";
import type { Option } from "@/types/common";
import { exportPlaceholder } from "@/utils/export";
import { EmptyState, ErrorState, LoadingSkeleton, NoResultsState } from "./States";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
  hidden?: boolean;
}

export interface FilterDef {
  key: string;
  label: string;
  options: Option[] | readonly string[];
}

export interface RowAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
  destructive?: boolean;
}

export function SearchBar({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-8 pr-8" aria-label={placeholder} />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function FilterBar({ filters, values, onChange }: { filters: FilterDef[]; values: Record<string, string | undefined>; onChange: (k: string, v: string) => void }) {
  return (
    <>
      {filters.map((f) => (
        <Select key={f.key} value={values[f.key] ?? "all"} onValueChange={(v) => onChange(f.key, v)}>
          <SelectTrigger className="w-full sm:w-44" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {f.label}</SelectItem>
            {f.options.map((o) => {
              const opt = typeof o === "string" ? { label: o, value: o } : o;
              return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>;
            })}
          </SelectContent>
        </Select>
      ))}
    </>
  );
}

export function Pagination({ page, totalPages, total, pageSize, onPage, onPageSize }: {
  page: number; totalPages: number; total: number; pageSize: number; onPage: (p: number) => void; onPageSize: (n: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:flex-row">
      <p className="text-muted-foreground">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
          <SelectTrigger className="h-8 w-[90px]" aria-label="Rows per page"><SelectValue /></SelectTrigger>
          <SelectContent>{[5, 10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="tabular-nums">{page} / {totalPages}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export interface DataTableProps<T extends { id: string }> {
  list: ListState<T>;
  columns: Column<T>[];
  filters?: FilterDef[];
  actions?: RowAction<T>[];
  toolbar?: ReactNode;
  searchPlaceholder?: string;
  exportName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  list, columns, filters = [], actions = [], toolbar, searchPlaceholder, exportName, emptyTitle, emptyDescription, emptyAction, onRowClick,
}: DataTableProps<T>) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(columns.filter((c) => c.hidden).map((c) => c.key)));
  const visible = columns.filter((c) => !hidden.has(c.key));
  const { query, params } = list;
  const data = query.data;

  let body: ReactNode;
  if (query.isLoading) body = <LoadingSkeleton />;
  else if (query.isError) body = <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />;
  else if (!data || data.total === 0) {
    body = list.hasActiveQuery ? <NoResultsState onClear={list.resetFilters} /> : <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  } else {
    body = (
      <div className="overflow-x-auto">
        <table className={cn("w-full min-w-[640px] text-sm", query.isFetching && "opacity-60 transition-opacity")}>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {visible.map((c) => (
                <th key={c.key} className={cn("whitespace-nowrap px-4 py-2.5 font-medium", c.className)}>
                  {c.sortable ? (
                    <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => list.setSort(c.key)}>
                      {c.header}
                      {params.sort?.key === c.key ? (params.sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  ) : c.header}
                </th>
              ))}
              {actions.length > 0 && <th className="w-12 px-4 py-2.5"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {data.data.map((row) => {
              const rowActions = actions.filter((a) => !a.hidden?.(row));
              return (
                <tr key={row.id} className={cn("border-t hover:bg-muted/40", onRowClick && "cursor-pointer")} onClick={() => onRowClick?.(row)}>
                  {visible.map((c) => (
                    <td key={c.key} className={cn("whitespace-nowrap px-4 py-2.5", c.className)}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      {rowActions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions.map((a) => (
                              <DropdownMenuItem key={a.label} onClick={() => a.onClick(row)} className={a.destructive ? "text-destructive focus:text-destructive" : undefined}>
                                {a.icon}{a.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SearchBar value={list.searchInput} onChange={list.setSearch} placeholder={searchPlaceholder} />
          <FilterBar filters={filters} values={params.filters ?? {}} onChange={list.setFilter} />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Columns3 className="h-4 w-4" />Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={!hidden.has(c.key)}
                  onCheckedChange={(v) => setHidden((h) => { const n = new Set(h); if (v) n.delete(c.key); else n.add(c.key); return n; })}
                  onSelect={(e) => e.preventDefault()}
                >
                  {c.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {exportName && <Button variant="outline" size="sm" onClick={() => exportPlaceholder(exportName)}><Download className="h-4 w-4" />Export</Button>}
          {toolbar}
        </div>
      </div>
      {body}
      {data && data.total > 0 && !query.isError && (
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPage={list.setPage} onPageSize={list.setPageSize} />
      )}
    </div>
  );
}
