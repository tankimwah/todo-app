"use client";

import { App, Button, Card, DatePicker, Form, Input, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { CATEGORIES } from "@/lib/constants";
import {
  categoryRules,
  normalizeTodoText,
  titleRules,
} from "@/lib/todoFormRules";
import type { Category, TodoDraft } from "@/lib/types";
import { formRequiredMark } from "./formRequiredMark";

type FormValues = {
  title: string;
  description?: string;
  dueDate?: Dayjs | null;
  category: Category;
};

type AddTodoProps = {
  onAdd: (draft: TodoDraft) => void;
};

export function AddTodo({ onAdd }: AddTodoProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();

  const handleFinish = (values: FormValues) => {
    onAdd({
      title: normalizeTodoText(values.title),
      description: normalizeTodoText(values.description),
      dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
      category: values.category,
    });
    form.resetFields();
    form.setFieldsValue({ category: "Personal" });
    message.success("Task added");
  };

  return (
    <Card className="panel-card" title="Add task" variant="borderless">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ category: "Personal" as Category }}
        requiredMark={formRequiredMark}
      >
        <Form.Item label="Title" name="title" rules={titleRules}>
          <Input placeholder="What needs doing…" maxLength={120} showCount />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            placeholder="Optional details"
            rows={2}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="form-row">
          <Form.Item label="Due date" name="dueDate" className="form-row-due">
            <DatePicker
              allowClear
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              placeholder="No due date"
              disabledDate={(current) =>
                Boolean(current && current.isBefore(dayjs().startOf("day")))
              }
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={categoryRules}
            className="form-row-category"
          >
            <Select
              options={CATEGORIES.map((category) => ({
                value: category,
                label: category,
              }))}
            />
          </Form.Item>

          <Form.Item label=" " className="form-row-submit" colon={false}>
            <Button type="primary" htmlType="submit" block>
              Add task
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Card>
  );
}
