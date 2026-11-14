"use client";

import { Empty } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/types";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
};

export function TodoList({
  todos,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <Empty
        className="todo-empty"
        description="No tasks match these filters"
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="todo-list" role="list">
        {todos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            index={index}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onReorder}
          />
        ))}
      </div>
    </DndProvider>
  );
}
