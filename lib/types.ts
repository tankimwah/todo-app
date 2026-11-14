export type Category = "Work" | "Personal" | "Urgent";

export type StatusFilter = "all" | "completed" | "incomplete";

export type DueSort = "manual" | "asc" | "desc";

export type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  category: Category;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type TodoDraft = {
  title: string;
  description: string;
  dueDate: string | null;
  category: Category;
};

export type TodoFilters = {
  search: string;
  status: StatusFilter;
  sort: DueSort;
  page: number;
  pageSize: number;
};