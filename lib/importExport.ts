import * as XLSX from "xlsx";
import { CATEGORIES } from "./constants";
import type { Category, Todo, TodoDraft } from "./types";

type ImportRow = {
  title?: string;
  description?: string;
  dueDate?: string;
  category?: string;
  completed?: string | boolean | number;
};

export function parseTodoFile(file: ArrayBuffer): TodoDraft[] {
  const workbook = XLSX.read(file, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: "" });

  return rows
    .map((row) => normalizeRow(row))
    .filter((row): row is TodoDraft & { completed?: boolean } => Boolean(row?.title))
    .map(({ title, description, dueDate, category }) => ({
      title,
      description,
      dueDate,
      category,
    }));
}

export function parseTodoFileWithStatus(
  file: ArrayBuffer,
): Array<TodoDraft & { completed: boolean }> {
  const workbook = XLSX.read(file, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: "" });

  return rows
    .map((row) => {
      const draft = normalizeRow(row);
      if (!draft) return null;
      return {
        ...draft,
        completed: parseCompleted(row.completed),
      };
    })
    .filter((row): row is TodoDraft & { completed: boolean } => row !== null);
}

export function exportTodosToExcel(todos: Todo[], filename = "todo-report.xlsx"): void {
  const rows = todos.map((todo) => ({
    title: todo.title,
    description: todo.description,
    dueDate: todo.dueDate ?? "",
    category: todo.category,
    completed: todo.completed ? "yes" : "no",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Todos");
  XLSX.writeFile(workbook, filename);
}

function normalizeRow(row: ImportRow): TodoDraft | null {
  const title = String(row.title ?? "").trim();
  if (!title) return null;

  const description = String(row.description ?? "").trim();
  const dueDate = normalizeDueDate(row.dueDate);
  const category = normalizeCategory(row.category);

  return { title, description, dueDate, category };
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