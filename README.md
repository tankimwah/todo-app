# FocusList — Comprehensive To-Do App

Next.js (App Router) + Ant Design to-do manager with local persistence, search/filter/sort, pagination, CSV/Excel import, Excel export, calendar view, and drag-and-drop reordering.

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

## Features

- Add, edit, delete, and complete tasks
- Due dates and categories (Work / Personal / Urgent)
- Search by title or description
- Filter by completion status
- Sort by manual order or due date (asc/desc)
- Pagination with page size 5 / 10 / 15 / 20
- Persist tasks in `localStorage` across reloads
- Import CSV or Excel; export Excel report
- Calendar view colored by category
- Drag-and-drop reorder (Manual order sort)

Sample import file: [`public/sample-todos.csv`](public/sample-todos.csv).
