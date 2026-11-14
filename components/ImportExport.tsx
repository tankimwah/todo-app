"use client";

import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { App, Button, Space, Upload } from "antd";
import {
  exportTodosToExcel,
  parseTodoFileWithStatus,
} from "@/lib/importExport";
import type { Todo, TodoDraft } from "@/lib/types";

type ImportExportProps = {
  todos: Todo[];
  onImport: (rows: Array<TodoDraft & { completed?: boolean }>) => void;
};

export function ImportExport({ todos, onImport }: ImportExportProps) {
  const { message } = App.useApp();

  return (
    <Space wrap>
      <Upload
        accept=".csv,.xlsx,.xls"
        showUploadList={false}
        beforeUpload={async (file) => {
          try {
            const buffer = await file.arrayBuffer();
            const rows = parseTodoFileWithStatus(buffer);
            if (rows.length === 0) {
              message.warning("No valid tasks found in that file.");
              return false;
            }
            onImport(rows);
            message.success(`Imported ${rows.length} task${rows.length === 1 ? "" : "s"}.`);
          } catch {
            message.error("Could not read that file. Use CSV or Excel.");
          }
          return false;
        }}
      >
        <Button icon={<UploadOutlined />}>Import CSV / Excel</Button>
      </Upload>

      <Button
        icon={<DownloadOutlined />}
        onClick={() => {
          if (todos.length === 0) {
            message.info("Nothing to export yet.");
            return;
          }
          exportTodosToExcel(todos);
          message.success("Excel report downloaded.");
        }}
      >
        Export Excel
      </Button>
    </Space>
  );
}