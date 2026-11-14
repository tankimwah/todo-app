import { DEFAULT_PAGE_SIZE, PREFS_STORAGE_KEY, STORAGE_KEY } from "./constants";
import type { Category, Todo, TodoPrefs } from "./types";

const DEFAULT_PREFS: TodoPrefs = {
  pageSize: DEFAULT_PAGE_SIZE,
  sort: "manual",
  status: "all",
  category: "all",
};

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeTodo)
      .filter((todo): todo is Todo => todo !== null);
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function loadPrefs(): TodoPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_PREFS };

  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<TodoPrefs>;
    return {
      pageSize: isPageSize(parsed.pageSize)
        ? parsed.pageSize
        : DEFAULT_PREFS.pageSize,
      sort:
        parsed.sort === "manual" ||
        parsed.sort === "asc" ||
        parsed.sort === "desc"
          ? parsed.sort
          : DEFAULT_PREFS.sort,
      status:
        parsed.status === "all" ||
        parsed.status === "completed" ||
        parsed.status === "incomplete"
          ? parsed.status
          : DEFAULT_PREFS.status,
      category:
        parsed.category === "all" || isCategory(parsed.category)
          ? parsed.category
          : DEFAULT_PREFS.category,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs: TodoPrefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

function normalizeTodo(value: unknown): Todo | null {
  if (!value || typeof value !== "object") return null;
  const todo = value as Record<string, unknown>;

  if (typeof todo.id !== "string" || typeof todo.title !== "string") return null;
  if (typeof todo.completed !== "boolean") return null;
  if (!(todo.dueDate === null || typeof todo.dueDate === "string")) return null;
  if (!isCategory(todo.category)) return null;
  if (typeof todo.order !== "number") return null;

  const stamp =
    typeof todo.updatedAt === "string"
      ? todo.updatedAt
      : typeof todo.createdAt === "string"
        ? todo.createdAt
        : new Date().toISOString();

  return {
    id: todo.id,
    title: todo.title,
    description: typeof todo.description === "string" ? todo.description : "",
    completed: todo.completed,
    dueDate: todo.dueDate,
    category: todo.category,
    order: todo.order,
    createdAt: typeof todo.createdAt === "string" ? todo.createdAt : stamp,
    updatedAt: typeof todo.updatedAt === "string" ? todo.updatedAt : stamp,
  };
}

function isCategory(value: unknown): value is Category {
  return value === "Work" || value === "Personal" || value === "Urgent";
}

function isPageSize(value: unknown): value is number {
  return value === 5 || value === 10 || value === 15 || value === 20;
}
