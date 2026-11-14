"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import type { EventClickInfo } from "@fullcalendar/react";
import "@fullcalendar/react/skeleton.css";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Todo } from "@/lib/types";

type CalendarViewProps = {
  todos: Todo[];
  onSelectTodo: (todo: Todo) => void;
};

export function CalendarView({ todos, onSelectTodo }: CalendarViewProps) {
  const events = todos
    .filter((todo) => todo.dueDate)
    .map((todo) => ({
      id: todo.id,
      title: todo.title,
      date: todo.dueDate as string,
      backgroundColor: CATEGORY_COLORS[todo.category],
      borderColor: CATEGORY_COLORS[todo.category],
      textColor: "#ffffff",
      extendedProps: { todo },
    }));

  const handleEventClick = (info: EventClickInfo) => {
    const todo = info.event.extendedProps.todo as Todo | undefined;
    if (todo) onSelectTodo(todo);
  };

  return (
    <div className="calendar-shell">
      <div className="calendar-legend">
        {(
          Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>
        ).map((category) => (
          <span key={category} className="legend-item">
            <span
              className="legend-swatch"
              style={{ backgroundColor: CATEGORY_COLORS[category] }}
            />
            {category}
          </span>
        ))}
      </div>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
      />
    </div>
  );
}
