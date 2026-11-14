"use client";

import {
  format,
  getDay,
  parse,
  parseISO,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type EventProps,
  type View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CATEGORY_COLORS } from "@/lib/constants";
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
    <span className="rbc-event-chip" title={event.title}>
      {event.title}
    </span>
  );
}

export function CalendarView({ todos, onSelectTodo }: CalendarViewProps) {
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

  const eventPropGetter = (event: CalendarEvent) => {
    const color = CATEGORY_COLORS[event.resource.category];
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: "#fff",
      },
    };
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

      <div className="calendar-frame">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          defaultView={"month" as View}
          views={["month"]}
          popup
          style={{ height: 560 }}
          eventPropGetter={eventPropGetter}
          components={{ event: EventChip }}
          onSelectEvent={(event) => onSelectTodo(event.resource)}
          tooltipAccessor={(event) =>
            `${event.title} · ${event.resource.category}`
          }
        />
      </div>
    </div>
  );
}
