import dayjs from "dayjs";
import { DUE_SOON_DAYS } from "./constants";

export type DueUrgency = "none" | "overdue" | "due-soon" | "upcoming";

export function getDueUrgency(
  dueDate: string | null,
  completed: boolean,
): DueUrgency {
  if (!dueDate || completed) return "none";

  const today = dayjs().startOf("day");
  const due = dayjs(dueDate).startOf("day");
  if (!due.isValid()) return "none";

  if (due.isBefore(today)) return "overdue";

  const diff = due.diff(today, "day");
  if (diff <= DUE_SOON_DAYS) return "due-soon";

  return "upcoming";
}

export function formatDueLabel(dueDate: string | null, completed: boolean): string {
  if (!dueDate) return "No due date";

  const urgency = getDueUrgency(dueDate, completed);
  if (urgency === "overdue") return `Overdue · ${dueDate}`;
  if (urgency === "due-soon") return `Due soon · ${dueDate}`;
  return `Due ${dueDate}`;
}
