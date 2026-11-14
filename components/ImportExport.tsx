"use client";

import {
  DownloadOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { App, Button, Dropdown, Space, Upload } from "antd";
import {
  downloadCsvTemplate,
  exportTodosToExcel,
  parseTodoFileWithStatus,
} from "@/lib/importExport";
import type { Todo, TodoDraft } from "@/lib/types";

type ImportExportProps = {
  filteredTodos: Todo[];
  allTodos: Todo[];
  onImport: (
    rows: Array<TodoDraft & { completed?: boolean; order?: number }>,
    mode: "append" | "replace",
  ) => void;
  onLoadSample: (mode: "append" | "replace") => void;
};

export function ImportExport({
  filteredTodos,
  allTodos,
  onImport,
  onLoadSample,
}: ImportExportProps) {
  const { message, modal } = App.useApp();

  const runImport = async (file: File, mode: "append" | "replace") => {
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseTodoFileWithStatus(buffer);
      if (rows.length === 0) {
        message.warning("No valid tasks found in that file.");
        return;
      }
      onImport(rows, mode);
      message.success(
        `${mode === "replace" ? "Replaced with" : "Imported"} ${rows.length} task${rows.length === 1 ? "" : "s"}.`,
      );
    } catch {
      message.error("Could not read that file. Use CSV or Excel.");
    }
  };

  const confirmReplaceThen = (action: () => void) => {
    if (allTodos.length === 0) {
      action();
      return;
    }
    modal.confirm({
      title: "Replace all tasks?",
      content: "This removes your current list and loads the new data.",
      okText: "Replace all",
      okButtonProps: { danger: true },
      onOk: action,
    });
  };

  return (
    <Space wrap>
      <Button
        icon={<FileTextOutlined />}
        onClick={() => {
          downloadCsvTemplate();
          message.success("CSV template downloaded.");
        }}
      >
        CSV template
      </Button>

      <Dropdown
        menu={{
          items: [
            {
              key: "append",
              label: "Append sample tasks",
              onClick: () => {
                onLoadSample("append");
                message.success("Sample tasks added.");
              },
            },
            {
              key: "replace",
              label: "Replace with sample tasks",
              onClick: () =>
                confirmReplaceThen(() => {
                  onLoadSample("replace");
                  message.success("Sample tasks loaded.");
                }),
            },
          ],
        }}
      >
        <Button>Sample tasks</Button>
      </Dropdown>

      <Upload
        accept=".csv,.xlsx,.xls"
        showUploadList={false}
        beforeUpload={async (file) => {
          await runImport(file, "append");
          return false;
        }}
      >
        <Button icon={<UploadOutlined />}>Import (append)</Button>
      </Upload>

      <Upload
        accept=".csv,.xlsx,.xls"
        showUploadList={false}
        beforeUpload={async (file) => {
          confirmReplaceThen(() => {
            void runImport(file, "replace");
          });
          return false;
        }}
      >
        <Button icon={<UploadOutlined />} danger>
          Import (replace)
        </Button>
      </Upload>

      <Dropdown
        menu={{
          items: [
            {
              key: "filtered",
              label: `Export filtered (${filteredTodos.length})`,
              onClick: () => {
                if (filteredTodos.length === 0) {
                  message.info("Nothing to export with current filters.");
                  return;
                }
                exportTodosToExcel(filteredTodos, { scope: "filtered" });
                message.success(
                  `Excel report downloaded (${filteredTodos.length} task${filteredTodos.length === 1 ? "" : "s"}).`,
                );
              },
            },
            {
              key: "all",
              label: `Export all (${allTodos.length})`,
              onClick: () => {
                if (allTodos.length === 0) {
                  message.info("Nothing to export yet.");
                  return;
                }
                exportTodosToExcel(allTodos, { scope: "all" });
                message.success(
                  `Excel report downloaded (${allTodos.length} task${allTodos.length === 1 ? "" : "s"}).`,
                );
              },
            },
          ],
        }}
      >
        <Button icon={<DownloadOutlined />}>Export Excel</Button>
      </Dropdown>
    </Space>
  );
}
