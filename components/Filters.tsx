"use client";

import { Input, Radio, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import type { CategoryFilter, DueSort, StatusFilter } from "@/lib/types";

type FiltersProps = {
  search: string;
  status: StatusFilter;
  category: CategoryFilter;
  sort: DueSort;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onSortChange: (value: DueSort) => void;
};

export function Filters({
  search,
  status,
  category,
  sort,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
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

  return (
    <div className="filters-bar">
      <Input.Search
        allowClear
        placeholder="Search by title or description…" aria-label="Search tasks"
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

      {sort !== "manual" ? (
        <Typography.Text type="secondary" className="filters-hint">
          Switch to Manual order to drag and reorder tasks.
        </Typography.Text>
      ) : (
        <Typography.Text type="secondary" className="filters-hint">
          Drag the handle to reorder. Order applies across the whole list, not
          just this page.
        </Typography.Text>
      )}
    </div>
  );
}
