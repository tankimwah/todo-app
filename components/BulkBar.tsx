"use client";

import { Button, Popconfirm, Select, Space, Typography } from "antd";
import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/types";

type BulkBarProps = {
  selectedCount: number;
  pageCount: number;
  allOnPageSelected: boolean;
  onToggleSelectAllPage: () => void;
  onClear: () => void;
  onComplete: () => void;
  onIncomplete: () => void;
  onDelete: () => void;
  onSetCategory: (category: Category) => void;
};

export function BulkBar({
  selectedCount,
  pageCount,
  allOnPageSelected,
  onToggleSelectAllPage,
  onClear,
  onComplete,
  onIncomplete,
  onDelete,
  onSetCategory,
}: BulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-bar" role="region" aria-label="Bulk actions">
      <Typography.Text strong>
        {selectedCount} selected
      </Typography.Text>

      <Space wrap size="small">
        <Button size="small" onClick={onToggleSelectAllPage}>
          {allOnPageSelected ? "Clear page" : `Select page (${pageCount})`}
        </Button>
        <Button size="small" onClick={onClear}>
          Clear selection
        </Button>
        <Button size="small" type="primary" onClick={onComplete}>
          Mark completed
        </Button>
        <Button size="small" onClick={onIncomplete}>
          Mark incomplete
        </Button>
        <Select
          size="small"
          aria-label="Set category for selected tasks"
          placeholder="Set category…"
          style={{ width: 140 }}
          value={undefined}
          onChange={onSetCategory}
          options={CATEGORIES.map((category) => ({
            value: category,
            label: category,
          }))}
        />
        <Popconfirm
          title={`Delete ${selectedCount} task${selectedCount === 1 ? "" : "s"}?`}
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={onDelete}
        >
          <Button size="small" danger>
            Delete
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
}
