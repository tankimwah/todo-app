import * as XLSX from "xlsx-js-style";
import { CATEGORIES } from "./constants";
import type { Category, Todo, TodoDraft } from "./types";

type LooseRow = Record<string, unknown>;

const TITLE_KEYS = ["title", "task", "name"];
const DESCRIPTION_KEYS = ["description", "details", "notes", "note"];
const DUE_KEYS = ["duedate", "due date", "due", "deadline"];
const CATEGORY_KEYS = ["category", "type", "tag"];
const COMPLETED_KEYS = ["completed", "status", "done"];
const ORDER_KEYS = ["order", "position", "sort"];

const HEADER_FILL = "0D9488";
const ZEBRA_FILL = "F0FDFA";
const BORDER_COLOR = "99F6E4";
const SUMMARY_HEADER_FILL = "CCFBF1";

const THIN_BORDER = {
  top: { style: "thin" as const, color: { rgb: BORDER_COLOR } },
  bottom: { style: "thin" as const, color: { rgb: BORDER_COLOR } },
  left: { style: "thin" as const, color: { rgb: BORDER_COLOR } },
  right: { style: "thin" as const, color: { rgb: BORDER_COLOR } },
};

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
  fill: { patternType: "solid" as const, fgColor: { rgb: HEADER_FILL } },
  alignment: { horizontal: "center" as const, vertical: "center" as const },
  border: THIN_BORDER,
};

const BODY_STYLE = {
  font: { sz: 11, color: { rgb: "134E4A" } },
  alignment: { vertical: "center" as const, wrapText: true },
  border: THIN_BORDER,
};

const ZEBRA_STYLE = {
  ...BODY_STYLE,
  fill: { patternType: "solid" as const, fgColor: { rgb: ZEBRA_FILL } },
};

const SUMMARY_TITLE_STYLE = {
  font: { bold: true, sz: 16, color: { rgb: "134E4A" } },
};

const SUMMARY_LABEL_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: "134E4A" } },
};

const SUMMARY_TABLE_HEADER_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: "134E4A" } },
  fill: { patternType: "solid" as const, fgColor: { rgb: SUMMARY_HEADER_FILL } },
  border: THIN_BORDER,
};

const SUMMARY_TABLE_CELL_STYLE = {
  font: { sz: 11, color: { rgb: "134E4A" } },
  border: THIN_BORDER,
};

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
  const sheet = pickImportSheet(workbook);
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<LooseRow>(sheet, { defval: "" });

  return rows
    .map((row) => normalizeLooseRow(row))
    .filter((row): row is ImportedTodo => row !== null);
}

export type ExportScope = "filtered" | "all";

export function exportTodosToExcel(
  todos: Todo[],
  options?: { filename?: string; scope?: ExportScope },
): void {
  const stamp = new Date().toISOString().slice(0, 10);
  const name = options?.filename ?? `focuslist-report-${stamp}.xlsx`;
  const scope = options?.scope ?? "all";
  const exportedAt = new Date();

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    buildSummarySheet(todos, scope, exportedAt),
    "Summary",
  );
  XLSX.utils.book_append_sheet(workbook, buildTasksSheet(todos), "Tasks");
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

function pickImportSheet(
  workbook: XLSX.WorkBook,
): XLSX.WorkSheet | null {
  const preferred = ["Tasks", "Todos", "Sheet1"];
  for (const name of preferred) {
    if (workbook.Sheets[name]) return workbook.Sheets[name];
  }

  for (const name of workbook.SheetNames) {
    if (name.toLowerCase() === "summary") continue;
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<LooseRow>(sheet, { defval: "" });
    if (rows.some((row) => normalizeLooseRow(row) !== null)) return sheet;
  }

  const fallback = workbook.SheetNames[0];
  return fallback ? workbook.Sheets[fallback] ?? null : null;
}

function buildSummarySheet(
  todos: Todo[],
  scope: ExportScope,
  exportedAt: Date,
): XLSX.WorkSheet {
  const completed = todos.filter((todo) => todo.completed).length;
  const incomplete = todos.length - completed;

  const sheet = XLSX.utils.aoa_to_sheet([
    ["FocusList Export"],
    [],
    ["Exported at", formatExportTimestamp(exportedAt)],
    ["Scope", scope === "filtered" ? "Current filters" : "All tasks"],
    [],
    ["Metric", "Count"],
    ["Total tasks", todos.length],
    ["Completed", completed],
    ["Incomplete", incomplete],
    [],
    ["Category", "Count"],
    ...CATEGORIES.map((category) => [
      category,
      todos.filter((todo) => todo.category === category).length,
    ]),
  ]);

  styleCell(sheet, "A1", SUMMARY_TITLE_STYLE);
  styleCell(sheet, "A3", SUMMARY_LABEL_STYLE);
  styleCell(sheet, "A4", SUMMARY_LABEL_STYLE);

  for (const cell of ["A6", "B6", "A11", "B11"]) {
    styleCell(sheet, cell, SUMMARY_TABLE_HEADER_STYLE);
  }
  for (const row of [7, 8, 9, 12, 13, 14]) {
    styleCell(sheet, `A${row}`, SUMMARY_TABLE_CELL_STYLE);
    styleCell(sheet, `B${row}`, SUMMARY_TABLE_CELL_STYLE);
  }

  sheet["!cols"] = [{ wch: 18 }, { wch: 28 }];
  return sheet;
}

function buildTasksSheet(todos: Todo[]): XLSX.WorkSheet {
  const headers = [
    "Title",
    "Description",
    "Due Date",
    "Category",
    "Status",
    "Order",
  ];
  const sheet = XLSX.utils.aoa_to_sheet([headers]);

  headers.forEach((_, colIndex) => {
    const ref = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    styleCell(sheet, ref, HEADER_STYLE);
  });

  todos.forEach((todo, index) => {
    const row = index + 1;
    const zebra = index % 2 === 1;
    const base = zebra ? ZEBRA_STYLE : BODY_STYLE;

    setStyledCell(sheet, row, 0, { t: "s", v: todo.title }, base);
    setStyledCell(sheet, row, 1, { t: "s", v: todo.description }, base);
    setStyledCell(
      sheet,
      row,
      2,
      todo.dueDate ? excelDateCell(todo.dueDate) : { t: "s", v: "" },
      {
        ...base,
        alignment: { ...base.alignment, horizontal: "center" as const },
      },
    );
    setStyledCell(sheet, row, 3, { t: "s", v: todo.category }, {
      ...base,
      alignment: { ...base.alignment, horizontal: "center" as const },
    });
    setStyledCell(
      sheet,
      row,
      4,
      { t: "s", v: todo.completed ? "Completed" : "Incomplete" },
      {
        ...base,
        alignment: { ...base.alignment, horizontal: "center" as const },
      },
    );
    setStyledCell(sheet, row, 5, { t: "n", v: todo.order }, {
      ...base,
      alignment: { ...base.alignment, horizontal: "center" as const },
    });
  });

  const lastRow = Math.max(todos.length + 1, 1);
  sheet["!ref"] = `A1:F${lastRow}`;
  sheet["!cols"] = [
    { wch: 32 },
    { wch: 40 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 8 },
  ];
  sheet["!rows"] = [{ hpt: 22 }];
  sheet["!views"] = [
    {
      state: "frozen",
      xSplit: 0,
      ySplit: 1,
      topLeftCell: "A2",
      activePane: "bottomLeft",
    },
  ];

  return sheet;
}

function setStyledCell(
  sheet: XLSX.WorkSheet,
  row: number,
  col: number,
  cell: XLSX.CellObject,
  style: object,
): void {
  const ref = XLSX.utils.encode_cell({ r: row, c: col });
  sheet[ref] = { ...cell, s: style };
}

function styleCell(
  sheet: XLSX.WorkSheet,
  ref: string,
  style: object,
): void {
  const existing = sheet[ref];
  if (!existing || typeof existing !== "object") {
    sheet[ref] = { t: "s", v: "", s: style };
    return;
  }
  sheet[ref] = { ...existing, s: style };
}

function excelDateCell(isoDate: string): XLSX.CellObject {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return { t: "s", v: isoDate };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return {
    t: "d",
    v: date,
    z: "yyyy-mm-dd",
  };
}

function formatExportTimestamp(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
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
  if (["no", "false", "0", "incomplete", "pending", "open"].includes(text)) {
    return false;
  }
  return ["yes", "true", "1", "completed", "done"].includes(text);
}

function parseOrder(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return Math.trunc(num);
}
