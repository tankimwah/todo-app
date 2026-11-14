import type { Category } from "./types";

export const STORAGE_KEY = "todolist_app_todos_v1";

export const CATEGORIES: Category[] = ["Work", "Personal", "Urgent"];

export const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

export const CATEGORY_COLORS: Record<Category, string> = {
  Work: "#0D9488",
  Personal: "#2563EB",
  Urgent: "#EA580C",
};

export const DEFAULT_PAGE_SIZE = 10;