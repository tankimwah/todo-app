"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { loadPrefs, loadTodos, savePrefs, saveTodos } from "@/lib/storage";
import type {
  Category,
  CategoryFilter,
  DueSort,
  StatusFilter,
  Todo,
  TodoDraft,
  TodoFilters,
} from "@/lib/types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filters, setFilters] = useState<TodoFilters>({
    search: "",
    status: "all",
    category: "all",
    sort: "manual",
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    const prefs = loadPrefs();
    setTodos(loadTodos());
    setFilters((prev) => ({
      ...prev,
      pageSize: prefs.pageSize,
      sort: prefs.sort,
      status: prefs.status,
      category: prefs.category,
    }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveTodos(todos);
  }, [todos, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    savePrefs({
      pageSize: filters.pageSize,
      sort: filters.sort,
      status: filters.status,
      category: filters.category,
    });
  }, [
    hydrated,
    filters.pageSize,
    filters.sort,
    filters.status,
    filters.category,
  ]);

  const updateFilters = useCallback((patch: Partial<TodoFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (
        patch.search !== undefined ||
        patch.status !== undefined ||
        patch.category !== undefined ||
        patch.sort !== undefined ||
        patch.pageSize !== undefined
      ) {
        next.page = patch.page ?? 1;
      }
      return next;
    });
  }, []);

  const addTodo = useCallback((draft: TodoDraft) => {
    const stamp = nowIso();
    setTodos((prev) => {
      const order =
        prev.length === 0 ? 0 : Math.max(...prev.map((todo) => todo.order)) + 1;
      const next: Todo = {
        id: createId(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        completed: false,
        dueDate: draft.dueDate,
        category: draft.category,
        order,
        createdAt: stamp,
        updatedAt: stamp,
      };
      return [...prev, next];
    });
  }, []);

  const updateTodo = useCallback(
    (id: string, draft: Partial<TodoDraft> & { completed?: boolean }) => {
      const stamp = nowIso();
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id !== id) return todo;
          return {
            ...todo,
            title: draft.title !== undefined ? draft.title.trim() : todo.title,
            description:
              draft.description !== undefined
                ? draft.description.trim()
                : todo.description,
            dueDate: draft.dueDate !== undefined ? draft.dueDate : todo.dueDate,
            category: draft.category ?? todo.category,
            completed:
              draft.completed !== undefined ? draft.completed : todo.completed,
            updatedAt: stamp,
          };
        }),
      );
    },
    [],
  );

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const toggleTodo = useCallback((id: string) => {
    const stamp = nowIso();
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: stamp }
          : todo,
      ),
    );
  }, []);

  const importTodos = useCallback(
    (
      rows: Array<TodoDraft & { completed?: boolean; order?: number }>,
      mode: "append" | "replace" = "append",
    ) => {
      const stamp = nowIso();
      setTodos((prev) => {
        const base = mode === "replace" ? [] : prev;
        let order =
          base.length === 0 ? -1 : Math.max(...base.map((todo) => todo.order));
        const incoming = rows.map((row) => {
          order += 1;
          return {
            id: createId(),
            title: row.title.trim(),
            description: row.description.trim(),
            completed: Boolean(row.completed),
            dueDate: row.dueDate,
            category: row.category,
            order: typeof row.order === "number" ? row.order : order,
            createdAt: stamp,
            updatedAt: stamp,
          } satisfies Todo;
        });

        if (mode === "replace") {
          return incoming
            .map((todo, index) => ({ ...todo, order: index }))
            .sort((a, b) => a.order - b.order);
        }

        return [...base, ...incoming];
      });
    },
    [],
  );

  const replaceTodos = useCallback(
    (rows: Array<TodoDraft & { completed?: boolean }>) => {
      importTodos(rows, "replace");
    },
    [importTodos],
  );

  const bulkSetCompleted = useCallback((ids: string[], completed: boolean) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const stamp = nowIso();
    setTodos((prev) =>
      prev.map((todo) =>
        idSet.has(todo.id) ? { ...todo, completed, updatedAt: stamp } : todo,
      ),
    );
  }, []);

  const bulkDelete = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setTodos((prev) => prev.filter((todo) => !idSet.has(todo.id)));
  }, []);

  const bulkSetCategory = useCallback((ids: string[], category: Category) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const stamp = nowIso();
    setTodos((prev) =>
      prev.map((todo) =>
        idSet.has(todo.id) ? { ...todo, category, updatedAt: stamp } : todo,
      ),
    );
  }, []);

  const reorderTodos = useCallback((activeId: string, overId: string) => {
    setTodos((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const fromIndex = sorted.findIndex((todo) => todo.id === activeId);
      const toIndex = sorted.findIndex((todo) => todo.id === overId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;

      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);

      const stamp = nowIso();
      return sorted.map((todo, index) => ({
        ...todo,
        order: index,
        updatedAt: stamp,
      }));
    });
  }, []);

  const filteredTodos = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    let list = todos.filter((todo) => {
      if (filters.status === "completed" && !todo.completed) return false;
      if (filters.status === "incomplete" && todo.completed) return false;
      if (filters.category !== "all" && todo.category !== filters.category) {
        return false;
      }
      if (!query) return true;
      return (
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query)
      );
    });

    list = [...list].sort((a, b) => {
      if (filters.sort === "manual") return a.order - b.order;
      if (a.dueDate === b.dueDate) return a.order - b.order;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      const cmp = a.dueDate.localeCompare(b.dueDate);
      return filters.sort === "asc" ? cmp : -cmp;
    });

    return list;
  }, [
    todos,
    filters.search,
    filters.status,
    filters.category,
    filters.sort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTodos.length / filters.pageSize) || 1,
  );

  const safePage = Math.min(filters.page, totalPages);

  const pagedTodos = useMemo(() => {
    const start = (safePage - 1) * filters.pageSize;
    return filteredTodos.slice(start, start + filters.pageSize);
  }, [filteredTodos, safePage, filters.pageSize]);

  useEffect(() => {
    if (filters.page !== safePage) {
      setFilters((prev) => ({ ...prev, page: safePage }));
    }
  }, [filters.page, safePage]);

  return {
    todos,
    hydrated,
    filters,
    updateFilters,
    setSearch: (search: string) => updateFilters({ search }),
    setStatus: (status: StatusFilter) => updateFilters({ status }),
    setCategory: (category: CategoryFilter) => updateFilters({ category }),
    setSort: (sort: DueSort) => updateFilters({ sort }),
    setPage: (page: number) => updateFilters({ page }),
    setPageSize: (pageSize: number) => updateFilters({ pageSize }),
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    importTodos,
    replaceTodos,
    bulkSetCompleted,
    bulkDelete,
    bulkSetCategory,
    reorderTodos,
    filteredTodos,
    pagedTodos,
    totalPages,
    currentPage: safePage,
    totalFiltered: filteredTodos.length,
    totalAll: todos.length,
  };
}
