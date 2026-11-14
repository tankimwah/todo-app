"use client";

import { Card, Tabs, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { getSeedTodoDrafts } from "@/lib/seedTodos";
import type { Category, Todo } from "@/lib/types";
import { AddTodo } from "./AddTodo";
import { BulkBar } from "./BulkBar";
import { CalendarView } from "./CalendarView";
import { EditTodo } from "./EditTodo";
import { Filters } from "./Filters";
import { ImportExport } from "./ImportExport";
import { TodoList } from "./TodoList";
import { TodoPagination } from "./TodoPagination";

export function TodoApp() {
  const {
    todos,
    hydrated,
    filters,
    setSearch,
    setStatus,
    setCategory,
    setSort,
    setPage,
    setPageSize,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    importTodos,
    bulkSetCompleted,
    bulkDelete,
    bulkSetCategory,
    reorderTodos,
    filteredTodos,
    pagedTodos,
    totalPages,
    currentPage,
    totalFiltered,
    totalAll,
  } = useTodos();

  const [editing, setEditing] = useState<Todo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isReordering, setIsReordering] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const canEnterReorder =
    filters.sort === "manual" && totalFiltered > filters.pageSize;

  const listTodos = isReordering ? filteredTodos : pagedTodos;

  useEffect(() => {
    if (filters.sort !== "manual" || activeTab !== "list") {
      setIsReordering(false);
      return;
    }
    if (totalFiltered <= filters.pageSize) {
      setIsReordering(false);
    }
  }, [filters.sort, filters.pageSize, activeTab, totalFiltered]);

  const selectedList = useMemo(() => [...selectedIds], [selectedIds]);

  const visibleIds = useMemo(
    () => listTodos.map((todo) => todo.id),
    [listTodos],
  );

  const allOnPageSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const onToggleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const onToggleSelectAllPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const everySelected = visibleIds.every((id) => next.has(id));
      if (everySelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [visibleIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteTodo(id);
      setSelectedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [deleteTodo],
  );

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
          <Typography.Text type="secondary" className="local-save-hint">
            Saved locally in this browser
          </Typography.Text>
        </div>
        <ImportExport
          filteredTodos={filteredTodos}
          allTodos={todos}
          onImport={(rows, mode) => {
            importTodos(rows, mode);
            clearSelection();
            setPage(1);
          }}
          onLoadSample={(mode) => {
            importTodos(getSeedTodoDrafts(), mode);
            clearSelection();
            setPage(1);
          }}
        />
      </header>

      <AddTodo onAdd={addTodo} />

      <Card className="panel-card main-panel" variant="borderless">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "list",
              label: `List (${totalFiltered}${totalAll !== totalFiltered ? ` / ${totalAll}` : ""})`,
              children: (
                <>
                  <Filters
                    search={filters.search}
                    status={filters.status}
                    category={filters.category}
                    sort={filters.sort}
                    isReordering={isReordering}
                    canEnterReorder={canEnterReorder}
                    filteredCount={totalFiltered}
                    onSearchChange={setSearch}
                    onStatusChange={setStatus}
                    onCategoryChange={setCategory}
                    onSortChange={setSort}
                    onStartReorder={() => setIsReordering(true)}
                    onDoneReorder={() => setIsReordering(false)}
                  />
                  <BulkBar
                    selectedCount={selectedList.length}
                    pageCount={visibleIds.length}
                    allOnPageSelected={allOnPageSelected}
                    onToggleSelectAllPage={onToggleSelectAllPage}
                    onClear={clearSelection}
                    onComplete={() => {
                      bulkSetCompleted(selectedList, true);
                      clearSelection();
                    }}
                    onIncomplete={() => {
                      bulkSetCompleted(selectedList, false);
                      clearSelection();
                    }}
                    onDelete={() => {
                      bulkDelete(selectedList);
                      clearSelection();
                    }}
                    onSetCategory={(category: Category) => {
                      bulkSetCategory(selectedList, category);
                      clearSelection();
                    }}
                  />
                  <TodoList
                    todos={listTodos}
                    hasAnyTodos={totalAll > 0}
                    selectedIds={selectedIds}
                    canDrag={filters.sort === "manual"}
                    compact={isReordering}
                    onToggleSelect={onToggleSelect}
                    onToggle={toggleTodo}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                    onReorder={reorderTodos}
                  />
                  {!isReordering ? (
                    <TodoPagination
                      current={currentPage}
                      pageSize={filters.pageSize}
                      total={totalFiltered}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  ) : null}
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
