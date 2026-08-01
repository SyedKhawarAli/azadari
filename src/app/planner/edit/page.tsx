"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EventEditor } from "@/components/planner/event-editor";
import { listLyrics } from "@/lib/db/queries";

function EditorBody() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const catalogue = listLyrics();

  if (!id) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">No programme selected</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a programme from the planner list.
        </p>
      </div>
    );
  }

  return <EventEditor eventId={id} catalogue={catalogue} />;
}

export default function PlannerEditPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading programme…</p>}>
        <EditorBody />
      </Suspense>
    </div>
  );
}
