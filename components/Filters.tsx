"use client";

import { Input, Radio, Select, Space } from "antd";
import type { DueSort, StatusFilter } from "@/lib/types";

type FiltersProps = {
  search: string;
  status: StatusFilter;
  sort: DueSort;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: DueSort) => void;
};

export function Filters({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: FiltersProps) {
  return (
    <div className="filters-bar">
      <Input.Search
        allowClear
        placeholder="Search by title or description"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
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
    </div>
  );
}