/**
 * useAdminTable — Shared hook for admin table patterns.
 * Provides search, pagination, and filter state management.
 */
import { useState, useMemo } from "react";

interface UseAdminTableOptions<T> {
  data: T[] | undefined;
  searchFn?: (item: T, query: string) => boolean;
  filterFns?: Record<string, (item: T, value: string) => boolean>;
  sortFn?: (a: T, b: T) => number;
  pageSize?: number;
}

export function useAdminTable<T>({
  data,
  searchFn,
  filterFns = {},
  sortFn,
  pageSize = 15,
}: UseAdminTableOptions<T>) {
  const [search, setSearchRaw] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const setSearch = (value: string) => {
    setSearchRaw(value);
    setPage(1);
  };

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const getFilter = (key: string) => filters[key] || "all";

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = [...data];

    // Apply search
    if (search && searchFn) {
      const q = search.toLowerCase();
      result = result.filter((item) => searchFn(item, q));
    }

    // Apply filters
    Object.entries(filterFns).forEach(([key, fn]) => {
      const value = filters[key];
      if (value && value !== "all") {
        result = result.filter((item) => fn(item, value));
      }
    });

    // Apply sort
    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  }, [data, search, searchFn, filters, filterFns, sortFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    search,
    setSearch,
    page,
    setPage,
    filters,
    setFilter,
    getFilter,
    filtered,
    paged,
    totalPages,
    totalCount: filtered.length,
    isEmpty: paged.length === 0,
  };
}
