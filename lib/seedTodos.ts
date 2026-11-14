import type { TodoDraft } from "./types";

/** Interview walkthrough sample — mixed categories, statuses, and due dates. */
export function getSeedTodoDrafts(): Array<
  TodoDraft & { completed?: boolean }
> {
  const today = new Date();
  const iso = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return [
    {
      title: "Prepare interview demo script",
      description: "Walk through add, filter, calendar, and export.",
      dueDate: iso(0),
      category: "Work",
      completed: false,
    },
    {
      title: "Ship FocusList polish pass",
      description: "Overdue cues, bulk actions, and seed data.",
      dueDate: iso(1),
      category: "Work",
      completed: false,
    },
    {
      title: "Buy groceries",
      description: "Milk, eggs, greens",
      dueDate: iso(2),
      category: "Personal",
      completed: false,
    },
    {
      title: "Call dentist",
      description: "Reschedule cleaning",
      dueDate: iso(-3),
      category: "Personal",
      completed: false,
    },
    {
      title: "Fix production alert",
      description: "Pager duty follow-up",
      dueDate: iso(-1),
      category: "Urgent",
      completed: false,
    },
    {
      title: "Review pull requests",
      description: "Team board — done for the week",
      dueDate: iso(-2),
      category: "Work",
      completed: true,
    },
    {
      title: "Plan weekend hike",
      description: "Check trail conditions",
      dueDate: iso(5),
      category: "Personal",
      completed: false,
    },
    {
      title: "Renew domain",
      description: "focuslist.app",
      dueDate: iso(10),
      category: "Urgent",
      completed: false,
    },
  ];
}
