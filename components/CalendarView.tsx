"use client";

import {
  format,
  getDay,
  parse,
  parseISO,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Typography } from "antd";
import { useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type EventProps,
  type View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CATEGORY_COLORS } from "@/lib/constants";
import { getDueUrgency } from "@/lib/dates";
import type { Todo } from "@/lib/types";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Todo;
};

type CalendarViewProps = {
  todos: Todo[];
  onSelectTodo: (todo: Todo) => void;
};

function EventChip({ event }: EventProps<CalendarEvent>) {
  return (
    <span
      className={`rbc-event-chip${event.resource.completed ? " is-complete" : ""}`}
      title={event.title}
    >
      {event.title}
    </span>
  );
}

export function CalendarView({ todos, onSelectTodo }: CalendarViewProps) {
  const [date, setDate] = useState(() => new Date());

  const events = useMemo<CalendarEvent[]>(
    () =>
      todos
        .filter((todo) => todo.dueDate)
        .map((todo) => {
          const start = parseISO(todo.dueDate as string);
          return {
            id: todo.id,
            title: todo.title,
            start,
            end: start,
            allDay: true,
            resource: todo,
          };
        }),
    [todos],
  );

  const openWithDueCount = useMemo(
    () => events.filter((event) => !event.resource.completed).length,
    [events],
  );

  const eventPropGetter = (event: CalendarEvent) => {
    const color = CATEGORY_COLORS[event.resource.category];
    const urgency = getDueUrgency(
      event.resource.dueDate,
      event.resource.completed,
    );
    const completed = event.resource.completed;

    return {
      className: [
        completed ? "rbc-event-complete" : "",
        urgency === "overdue" ? "rbc-event-overdue" : "",
      ]
        .filter(Boolean)
        .join(" "),
      style: {
        backgroundColor: completed ? `${color}99` : color,
        borderColor: urgency === "overdue" ? "#b91c1c" : color,
        borderWidth: urgency === "overdue" ? 2 : 0,
        borderStyle: "solid",
        color: "#fff",
        opacity: completed ? 0.7 : 1,
        textDecoration: completed ? "line-through" : undefined,
      },
    };
  };

  return (
    <div className="calendar-shell">
      <div className="calendar-toolbar-row">
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
        <Typography.Text type="secondary" className="calendar-summary">
          {openWithDueCount} open with due date
          {openWithDueCount === 1 ? "" : "s"}
        </Typography.Text>
      </div>

      <div className="calendar-frame">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          date={date}
          onNavigate={setDate}
          defaultView={"month" as View}
          views={["month"]}
          popup
          style={{ height: 560 }}
          eventPropGetter={eventPropGetter}
          components={{ event: EventChip }}
          onSelectEvent={(event) => onSelectTodo(event.resource)}
          tooltipAccessor={(event) =>
            `${event.title} · ${event.resource.category}${event.resource.completed ? " · done" : ""}`
          }
        />
      </div>
    </div>
  );
}
