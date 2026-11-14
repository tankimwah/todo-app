"use client";

import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Popconfirm, Space, Tag, Typography } from "antd";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatDueLabel, getDueUrgency } from "@/lib/dates";
import type { Todo } from "@/lib/types";

export const TODO_DND_TYPE = "TODO_ITEM";

type DragItem = {
  id: string;
  index: number;
};

type TodoItemProps = {
  todo: Todo;
  index: number;
  selected: boolean;
  canDrag: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
};

export function TodoItem({
  todo,
  index,
  selected,
  canDrag,
  onToggleSelect,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
}: TodoItemProps) {
  const rowRef = useRef<HTMLElement | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const urgency = getDueUrgency(todo.dueDate, todo.completed);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: TODO_DND_TYPE,
      item: { id: todo.id, index } satisfies DragItem,
      canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [todo.id, index, canDrag],
  );

  const [, drop] = useDrop(
    () => ({
      accept: TODO_DND_TYPE,
      canDrop: () => canDrag,
      hover: (item: DragItem) => {
        if (!canDrag || !rowRef.current || item.index === index) return;
        onReorder(item.id, todo.id);
        item.index = index;
      },
    }),
    [index, todo.id, onReorder, canDrag],
  );

  preview(drop(rowRef));
  drag(handleRef);

  return (
    <article
      ref={rowRef}
      className={`todo-item${todo.completed ? " is-complete" : ""}${isDragging ? " is-dragging" : ""}${urgency === "overdue" ? " is-overdue" : ""}${urgency === "due-soon" ? " is-due-soon" : ""}`}
      role="listitem"
    >
      <Checkbox
        checked={selected}
        onChange={(event) => onToggleSelect(todo.id, event.target.checked)}
        aria-label={`Select ${todo.title}`}
      />

      <button
        type="button"
        ref={handleRef}
        className={`drag-handle${!canDrag ? " is-disabled" : ""}`}
        aria-label={
          canDrag
            ? `Reorder ${todo.title}`
            : "Reordering requires Manual order"
        }
        disabled={!canDrag}
        title={
          canDrag
            ? "Drag to reorder"
            : "Switch to Manual order to reorder"
        }
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

        <Typography.Text
          className={`todo-due${urgency === "overdue" ? " todo-due-overdue" : ""}${urgency === "due-soon" ? " todo-due-soon" : ""}`}
          type={urgency === "none" || urgency === "upcoming" ? "secondary" : undefined}
        >
          {formatDueLabel(todo.dueDate, todo.completed)}
        </Typography.Text>
      </div>

      <Space className="todo-actions">
        <Button
          type="text"
          icon={<EditOutlined />}
          aria-label={`Edit ${todo.title}`}
          onClick={() => onEdit(todo)}
        />
        <Popconfirm
          title="Delete this task?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(todo.id)}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete ${todo.title}`}
          />
        </Popconfirm>
      </Space>
    </article>
  );
}
