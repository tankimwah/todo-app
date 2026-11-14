"use client";

import { Button, Input, Radio, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import type { CategoryFilter, DueSort, StatusFilter } from "@/lib/types";

type FiltersProps = {
  search: string;
  status: StatusFilter;
  category: CategoryFilter;
  sort: DueSort;
  isReordering: boolean;
  canEnterReorder: boolean;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onSortChange: (value: DueSort) => void;
  onStartReorder: () => void;
  onDoneReorder: () => void;
};

export function Filters({
  search,
  status,
  category,
  sort,
  isReordering,
  canEnterReorder,
  filteredCount,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onStartReorder,
  onDoneReorder,
}: FiltersProps) {
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== search) onSearchChange(searchDraft);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, search, onSearchChange]);

  let hint: string;
  if (sort !== "manual") {
    hint = "Switch to Manual order to drag and reorder tasks.";
  } else if (isReordering) {
    hint = `Showing all ${filteredCount} matching tasks in compact rows — drag to set order.`;
  } else if (canEnterReorder) {
    hint =
      "Drag on this page, or use Reorder to arrange the full filtered list.";
  } else {
    hint = "Drag the handle to reorder.";
  }

  return (
    <div className="filters-bar">
      <Input.Search
        allowClear
        placeholder="Search by title or description…"
        aria-label="Search tasks"
        value={searchDraft}
        onChange={(event) => setSearchDraft(event.target.value)}
        onSearch={onSearchChange}
        className="filters-search"
      />

      <Space wrap size="middle" className="filters-controls">
        <Radio.Group
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: "All", value: "all" },
            { label: "Incomplete", value: "incomplete" },
            { label: "Completed", value: "completed" },
          ]}
        />

        <Select
          value={category}
          style={{ width: 160 }}
          onChange={onCategoryChange}
          options={[
            { value: "all", label: "All categories" },
            ...CATEGORIES.map((item) => ({ value: item, label: item })),
          ]}
        />

        <Select
          value={sort}
          style={{ width: 200 }}
          onChange={onSortChange}
          options={[
            { value: "manual", label: "Manual order" },
            { value: "asc", label: "Due date: earliest" },
            { value: "desc", label: "Due date: latest" },
          ]}
        />
      </Space>

      <div className="filters-hint-row">
        <Typography.Text type="secondary" className="filters-hint">
          {hint}
        </Typography.Text>
        {sort === "manual" && canEnterReorder && !isReordering ? (
          <Button type="default" size="small" onClick={onStartReorder}>
            Reorder
          </Button>
        ) : null}
        {isReordering ? (
          <Button type="primary" size="small" onClick={onDoneReorder}>
            Done
          </Button>
        ) : null}
      </div>
    </div>
  );
}
