import type { Rule } from "antd/es/form";

export const titleRules: Rule[] = [
  { required: true, message: "Enter a task title" },
  {
    validator: async (_, value: unknown) => {
      if (typeof value !== "string" || value.length === 0) return;
      if (value.trim().length === 0) {
        return Promise.reject(new Error("Title can’t be only spaces"));
      }
    },
  },
];

export const categoryRules: Rule[] = [
  { required: true, message: "Select a category" },
];

export function normalizeTodoText(value: string | undefined | null): string {
  return String(value ?? "").trim();
}
