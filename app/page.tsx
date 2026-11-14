import { Suspense } from "react";
import { TodoApp } from "@/components/TodoApp";

export default function Home() {
  return (
    <Suspense fallback={<div className="app-loading">Loading your tasks…</div>}>
      <TodoApp />
    </Suspense>
  );
}