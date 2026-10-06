import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/services/apiClient";
import type { Filters, ListParams, PaginatedResponse, SortDir } from "@/types/common";
import { useDebounce } from "./useDebounce";

/** Thin wrapper so every read goes through TanStack Query with a stable key. */
export function useServiceQuery<T>(key: unknown[], fn: () => Promise<T>, enabled = true) {
  return useQuery({ queryKey: key, queryFn: fn, enabled });
}

/** Mutation helper: success/error toasts + invalidation of the given key roots. */
export function useServiceMutation<TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  opts: { invalidate?: string[]; success?: string | ((r: TResult, v: TVars) => string); onSuccess?: (r: TResult) => void } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r, v) => {
      opts.invalidate?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      if (opts.success) toast.success(typeof opts.success === "function" ? opts.success(r, v) : opts.success);
      opts.onSuccess?.(r);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export interface ListState<T> {
  params: ListParams;
  searchInput: string;
  setSearch: (s: string) => void;
  setFilter: (key: string, value: string | undefined) => void;
  setSort: (key: string) => void;
  setPage: (p: number) => void;
  setPageSize: (n: number) => void;
  resetFilters: () => void;
  hasActiveQuery: boolean;
  query: ReturnType<typeof useQuery<PaginatedResponse<T>>>;
}

/** Paginated list state (search w/ debounce, filters, sort, paging) bound to a service list fn. */
export function useList<T>(
  key: string[],
  fetcher: (p: ListParams) => Promise<PaginatedResponse<T>>,
  opts: { baseFilters?: Filters; pageSize?: number; initialSort?: { key: string; dir: SortDir } } = {},
): ListState<T> {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSortState] = useState(opts.initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(opts.pageSize ?? 10);

  const params: ListParams = useMemo(
    () => ({ search, filters: { ...filters, ...opts.baseFilters }, sort, page, pageSize }),
    [search, filters, sort, page, pageSize, opts.baseFilters],
  );

  const query = useQuery({
    queryKey: [...key, params],
    queryFn: () => fetcher(params),
    placeholderData: keepPreviousData,
  });

  const hasActiveQuery = !!search || Object.values(filters).some((v) => v && v !== "all");

  return {
    params,
    searchInput,
    setSearch: (s) => {
      setSearchInput(s);
      setPage(1);
    },
    setFilter: (k, v) => {
      setFilters((f) => ({ ...f, [k]: v }));
      setPage(1);
    },
    setSort: (k) => setSortState((s) => (s?.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" })),
    setPage,
    setPageSize: (n) => {
      setPageSize(n);
      setPage(1);
    },
    resetFilters: () => {
      setSearchInput("");
      setFilters({});
      setPage(1);
    },
    hasActiveQuery,
    query,
  };
}
