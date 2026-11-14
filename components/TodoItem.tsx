"use client";

import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Space, Tag, Typography } from "antd";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Todo } from "@/lib/types";

export const TODO_DND_TYPE = "TODO_ITEM";

type DragItem = {
  id: string;
  index: number;
};

type TodoItemProps = {
  todo: Todo;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
};

export function TodoItem({
  todo,
  index,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
}: TodoItemProps) {
  const rowRef = useRef<HTMLElement | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: TODO_DND_TYPE,
      item: { id: todo.id, index } satisfies DragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [todo.id, index],
  );

  const [, drop] = useDrop(
    () => ({
      accept: TODO_DND_TYPE,
      hover: (item: DragItem) => {
        if (!rowRef.current || item.index === index) return;
        onReorder(item.id, todo.id);
        item.index = index;
      },
    }),
    [index, todo.id, onReorder],
  );

  preview(drop(rowRef));
  drag(handleRef);

  return (
    <article
      ref={rowRef}
      className={`todo-item${todo.completed ? " is-complete" : ""}${isDragging ? " is-dragging" : ""}`}
    >
      <button
        type="button"
        ref={handleRef}
        className="drag-handle"
        aria-label={`Reorder ${todo.title}`}
      >
        <HolderOutlined />
      </button>

      <Checkbox
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
      />

      <div className="todo-item-body">
        <div className="todo-item-top">
          <Typography.Text
            strong
            delete={todo.completed}
            className="todo-title"
          >
            {todo.title}
          </Typography.Text>
          <Tag color={CATEGORY_COLORS[todo.category]}>{todo.category}</Tag>
        </div>

        {todo.description ? (
          <Typography.Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            className="todo-description"
          >
            {todo.description}
          </Typography.Paragraph>
        ) : null}

        <Typography.Text type="secondary" className="todo-due">
          {todo.dueDate ? `Due ${todo.dueDate}` : "No due date"}
        </Typography.Text>
      </div>

      <Space className="todo-actions">
        <Button
          type="text"
          icon={<EditOutlined />}
          aria-label={`Edit ${todo.title}`}
          onClick={() => onEdit(todo)}
        />
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          aria-label={`Delete ${todo.title}`}
          onClick={() => onDelete(todo.id)}
        />
      </Space>
    </article>
  );
}
