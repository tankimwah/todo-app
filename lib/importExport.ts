import * as XLSX from "xlsx";
import { CATEGORIES } from "./constants";
import type { Category, Todo, TodoDraft } from "./types";

type LooseRow = Record<string, unknown>;

const TITLE_KEYS = ["title", "task", "name"];
const DESCRIPTION_KEYS = ["description", "details", "notes", "note"];
const DUE_KEYS = ["duedate", "due date", "due", "deadline"];
const CATEGORY_KEYS = ["category", "type", "tag"];
const COMPLETED_KEYS = ["completed", "status", "done"];
const ORDER_KEYS = ["order", "position", "sort"];

export type ImportedTodo = TodoDraft & {
  completed: boolean;
  order?: number;
};

export function parseTodoFile(file: ArrayBuffer): TodoDraft[] {
  return parseTodoFileWithStatus(file).map(
    ({ title, description, dueDate, category }) => ({
      title,
      description,
      dueDate,
      category,
    }),
  );
}

export function parseTodoFileWithStatus(file: ArrayBuffer): ImportedTodo[] {
  const workbook = XLSX.read(file, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<LooseRow>(sheet, { defval: "" });

  return rows
    .map((row) => normalizeLooseRow(row))
    .filter((row): row is ImportedTodo => row !== null);
}

export function exportTodosToExcel(
  todos: Todo[],
  filename?: string,
): void {
  const stamp = new Date().toISOString().slice(0, 10);
  const name = filename ?? `focuslist-report-${stamp}.xlsx`;

  const rows = todos.map((todo) => ({
    title: todo.title,
    description: todo.description,
    dueDate: todo.dueDate ?? "",
    category: todo.category,
    completed: todo.completed ? "yes" : "no",
    order: todo.order,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Todos");
  XLSX.writeFile(workbook, name);
}

export function downloadCsvTemplate(): void {
  const header = "title,description,dueDate,category,completed,order\n";
  const sample =
    "Prepare demo,Walk through FocusList,2026-11-14,Work,no,0\n" +
    "Buy groceries,Milk and eggs,2026-11-16,Personal,no,1\n";
  const blob = new Blob([header + sample], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "focuslist-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeLooseRow(row: LooseRow): ImportedTodo | null {
  const mapped = mapKeys(row);
  const title = String(mapped.title ?? "").trim();
  if (!title) return null;

  const description = String(mapped.description ?? "").trim();
  const dueDate = normalizeDueDate(mapped.dueDate);
  const category = normalizeCategory(mapped.category);
  const completed = parseCompleted(mapped.completed);
  const order = parseOrder(mapped.order);

  return {
    title,
    description,
    dueDate,
    category,
    completed,
    ...(order !== undefined ? { order } : {}),
  };
}

function mapKeys(row: LooseRow): {
  title?: unknown;
  description?: unknown;
  dueDate?: unknown;
  category?: unknown;
  completed?: unknown;
  order?: unknown;
} {
  const entries = Object.entries(row).map(([key, value]) => [
    key.trim().toLowerCase().replace(/[_-]+/g, " "),
    value,
  ]);

  const pick = (aliases: string[]) => {
    for (const [key, value] of entries) {
      if (aliases.includes(key as string)) return value;
    }
    return undefined;
  };

  return {
    title: pick(TITLE_KEYS),
    description: pick(DESCRIPTION_KEYS),
    dueDate: pick(DUE_KEYS),
    category: pick(CATEGORY_KEYS),
    completed: pick(COMPLETED_KEYS),
    order: pick(ORDER_KEYS),
  };
}

function normalizeCategory(value: unknown): Category {
  const raw = String(value ?? "").trim();
  const match = CATEGORIES.find(
    (category) => category.toLowerCase() === raw.toLowerCase(),
  );
  return match ?? "Personal";
}

function normalizeDueDate(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const month = String(parsed.m).padStart(2, "0");
    const day = String(parsed.d).padStart(2, "0");
    return `${parsed.y}-${month}-${day}`;
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function parseCompleted(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  return ["yes", "true", "1", "completed", "done"].includes(text);
}

function parseOrder(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return Math.trunc(num);
}
