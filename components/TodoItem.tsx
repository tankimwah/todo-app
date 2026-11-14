"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Space, Tag, Typography } from "antd";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Todo } from "@/lib/types";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`todo-item${todo.completed ? " is-complete" : ""}${isDragging ? " is-dragging" : ""}`}
    >
      <button
        type="button"
        className="drag-handle"
        aria-label={`Reorder ${todo.title}`}
        {...attributes}
        {...listeners}
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