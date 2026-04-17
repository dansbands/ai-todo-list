"use client";

import RequireAuth from "../../src/components/require-auth";
import Tasks from "../../src/views/tasks";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <RequireAuth>
      <Tasks />
    </RequireAuth>
  );
}
