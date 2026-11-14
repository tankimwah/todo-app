"use client";

import { Button, Card, DatePicker, Form, Input, Select, Space } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { CATEGORIES } from "@/lib/constants";
import type { Category, TodoDraft } from "@/lib/types";

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

  const handleFinish = (values: FormValues) => {
    onAdd({
      title: values.title,
      description: values.description ?? "",
      dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
      category: values.category,
    });
    form.resetFields();
    form.setFieldsValue({ category: "Personal" });
  };

  return (
    <Card className="panel-card" title="Add task" variant="borderless">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ category: "Personal" as Category }}
        requiredMark={false}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Enter a task title" }]}
        >
          <Input placeholder="What needs doing?" maxLength={120} showCount />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            placeholder="Optional details"
            rows={2}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Space wrap size="middle" style={{ width: "100%" }} className="form-row">
          <Form.Item label="Due date" name="dueDate" style={{ marginBottom: 0 }}>
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: 180 }}
              disabledDate={(current) =>
                Boolean(current && current.isBefore(dayjs().startOf("day")))
              }
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true }]}
            style={{ marginBottom: 0, minWidth: 160 }}
          >
            <Select
              options={CATEGORIES.map((category) => ({
                value: category,
                label: category,
              }))}
            />
          </Form.Item>

          <Form.Item label=" " style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit">
              Add task
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </Card>
  );
}