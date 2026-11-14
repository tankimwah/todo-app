"use client";

import { DatePicker, Form, Input, Modal, Select, Switch } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect } from "react";
import { CATEGORIES } from "@/lib/constants";
import type { Category, Todo, TodoDraft } from "@/lib/types";

type FormValues = {
  title: string;
  description?: string;
  dueDate?: Dayjs | null;
  category: Category;
  completed: boolean;
};

type EditDraft = TodoDraft & { completed: boolean };

type EditTodoProps = {
  todo: Todo | null;
  open: boolean;
  onCancel: () => void;
  onSave: (id: string, draft: EditDraft) => void;
};

export function EditTodo({ todo, open, onCancel, onSave }: EditTodoProps) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (!todo) return;
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate ? dayjs(todo.dueDate) : null,
      category: todo.category,
      completed: todo.completed,
    });
  }, [todo, form]);

  const handleOk = async () => {
    if (!todo) return;
    const values = await form.validateFields();
    onSave(todo.id, {
      title: values.title,
      description: values.description ?? "",
      dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
      category: values.category,
      completed: values.completed,
    });
  };

  return (
    <Modal
      title="Edit task"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Save changes"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label="Completed"
          name="completed"
          valuePropName="checked"
        >
          <Switch checkedChildren="Done" unCheckedChildren="Open" />
        </Form.Item>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Enter a task title" }]}
        >
          <Input maxLength={120} showCount />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} maxLength={500} showCount />
        </Form.Item>
        <Form.Item label="Due date" name="dueDate">
          <DatePicker
            allowClear
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
            placeholder="No due date"
          />
        </Form.Item>
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true }]}
        >
          <Select
            options={CATEGORIES.map((category) => ({
              value: category,
              label: category,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}