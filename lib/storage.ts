import { STORAGE_KEY } from "./constants";
import type { Todo } from "./types";

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTodo);
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") return false;
  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    typeof todo.description === "string" &&
    typeof todo.completed === "boolean" &&
    (todo.dueDate === null || typeof todo.dueDate === "string") &&
    (todo.category === "Work" ||
      todo.category === "Personal" ||
      todo.category === "Urgent") &&
    typeof todo.order === "number"
  );
}