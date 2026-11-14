# FocusList — Comprehensive To-Do App

Interview-friendly to-do manager: **Next.js 16** (App Router) + **React 19** + **Ant Design 5** + TypeScript. Single page with List / Calendar tabs, local-only persistence (no backend).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

```bash
npm run lint
```

## Stack

| Area | Choice |
|------|--------|
| UI | Ant Design 5 (`@ant-design/v5-patch-for-react-19`) |
| Calendar | `react-big-calendar` + `date-fns` |
| Forms / dates | Ant Design + `dayjs` |
| Drag-and-drop | `react-dnd` + HTML5 backend (Manual sort) |
| Import / export | `xlsx-js-style` (CSV + Excel) |
| Font | Plus Jakarta Sans (`next/font`) |

## Features

- Add, edit, delete, and complete tasks (list checkbox + edit modal switch)
- Due dates and categories (Work / Personal / Urgent)
- Search by title or description (debounced)
- Filter by status and category; sort by Manual order or due date (asc/desc)
- Pagination (5 / 10 / 15 / 20) with “Showing N–M of T”
- Overdue and due-soon cues; bulk select / complete / incomplete / delete / category
- Sample tasks for demos; CSV import template; append or replace import
- Excel export: **Summary** + styled **Tasks** sheets (`focuslist-report-YYYY-MM-DD.xlsx`)
- Calendar month view: category-colored chips, open-with-due-dates count, Back / Next / Today
- Drag-and-drop reorder when sort is Manual
- Persist todos in `todolist_app_todos_v1`; UI prefs in `todolist_app_prefs_v1`

Demo files:

- In-app **Sample tasks** and **CSV template**
- [`public/sample-todos.csv`](public/sample-todos.csv)

## Architecture

```text
components/     UI (TodoApp, list, filters, calendar, import/export, forms)
hooks/          useTodos — CRUD, filter, sort, pagination, bulk, prefs
lib/            types, storage, importExport, dates, seed, form rules
app/            Next.js layout + page shell
```

- **`useTodos`** is the single source of truth shared by List and Calendar (tabs, not separate routes).
- All data stays in the browser via `localStorage` (schema validation / migration on load).
- Import prefers a `Tasks` sheet when present so Excel Summary sheets are not misread.
