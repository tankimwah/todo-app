"use client";

import { Card, Tabs, Typography } from "antd";
import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import type { Todo } from "@/lib/types";
import { AddTodo } from "./AddTodo";
import { CalendarView } from "./CalendarView";
import { EditTodo } from "./EditTodo";
import { Filters } from "./Filters";
import { ImportExport } from "./ImportExport";
import { TodoList } from "./TodoList";
import { TodoPagination } from "./TodoPagination";

export function TodoApp() {
  const {
    hydrated,
    filters,
    setSearch,
    setStatus,
    setSort,
    setPage,
    setPageSize,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    importTodos,
    reorderTodos,
    filteredTodos,
    pagedTodos,
    totalPages,
    currentPage,
    totalFiltered,
  } = useTodos();

  const [editing, setEditing] = useState<Todo | null>(null);

  if (!hydrated) {
    return <div className="app-loading">Loading your tasks…</div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <Typography.Title level={1} className="brand">
            FocusList
          </Typography.Title>
          <Typography.Paragraph className="tagline">
            Plan, prioritize, and clear your day without losing track.
          </Typography.Paragraph>
        </div>
        <ImportExport todos={filteredTodos} onImport={importTodos} />
      </header>

      <AddTodo onAdd={addTodo} />

      <Card className="panel-card main-panel" variant="borderless">
        <Tabs
          items={[
            {
              key: "list",
              label: "List",
              children: (
                <>
                  <Filters
                    search={filters.search}
                    status={filters.status}
                    sort={filters.sort}
                    onSearchChange={setSearch}
                    onStatusChange={setStatus}
                    onSortChange={setSort}
                  />
                  <TodoList
                    todos={pagedTodos}
                    onToggle={toggleTodo}
                    onEdit={setEditing}
                    onDelete={deleteTodo}
                    onReorder={reorderTodos}
                  />
                  <TodoPagination
                    current={currentPage}
                    pageSize={filters.pageSize}
                    total={totalFiltered}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </>
              ),
            },
            {
              key: "calendar",
              label: "Calendar",
              children: (
                <CalendarView
                  todos={filteredTodos}
                  onSelectTodo={setEditing}
                />
              ),
            },
          ]}
        />
      </Card>

      <EditTodo
        todo={editing}
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        onSave={(id, draft) => {
          updateTodo(id, draft);
          setEditing(null);
        }}
      />
    </div>
  );
}