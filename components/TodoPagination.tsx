"use client";

import { Pagination, Select, Space, Typography } from "antd";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";

type TodoPaginationProps = {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function TodoPagination({
  current,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: TodoPaginationProps) {
  const rangeStart = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const rangeEnd = Math.min(current * pageSize, total);

  return (
    <div className="pagination-bar">
      <Space wrap size="middle" align="center">
        <Typography.Text type="secondary">Tasks per page</Typography.Text>
        <Select
          value={pageSize}
          style={{ width: 88 }}
          onChange={onPageSizeChange}
          options={PAGE_SIZE_OPTIONS.map((size) => ({
            value: size,
            label: String(size),
          }))}
        />
        <Typography.Text>
          {total === 0
            ? "0 tasks"
            : `Showing ${rangeStart}–${rangeEnd} of ${total} · Page ${current} of ${totalPages}`}
        </Typography.Text>
      </Space>

      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onPageChange}
        showSizeChanger={false}
        hideOnSinglePage={false}
        disabled={total === 0}
        itemRender={(page, type, original) => {
          if (type === "prev") return <button type="button">Previous</button>;
          if (type === "next") return <button type="button">Next</button>;
          if (type === "page") return <button type="button">{page}</button>;
          return original;
        }}
      />
    </div>
  );
}
