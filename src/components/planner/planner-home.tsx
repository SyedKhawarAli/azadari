"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { CalendarPlus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLocalEvent,
  db,
  deleteLocalEvent,
  saveLocalEvent,
} from "@/lib/offline/db";
import { cn } from "@/lib/utils";

export function PlannerHome() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [pending, startTransition] = useTransition();

  const events = useLiveQuery(
    async () => (db ? db.events.orderBy("updatedAt").reverse().toArray() : []),
    [],
    [],
  );

  const createEvent = () => {
    const trimmed = title.trim() || "Untitled Majlis";
    startTransition(async () => {
      const event = createLocalEvent(trimmed, date || null);
      await saveLocalEvent(event);
      toast.success("Programme created.");
      setTitle("");
      setDate("");
      router.push(`/planner/edit?id=${encodeURIComponent(event.id)}`);
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium">New programme</h2>
        <p className="mt-1 text-[0.7rem] text-muted-foreground sm:text-xs">
          <span className="sm:hidden">Saved on this device. Share via link anytime.</span>
          <span className="hidden sm:inline">
            Plans are saved on this device. Share a link anytime — the agenda lives in the URL.
          </span>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Majlis-e-Aza — 8th Muharram"
              onKeyDown={(event) => {
                if (event.key === "Enter") createEvent();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-date">Date</Label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createEvent} disabled={pending} className="w-full sm:w-auto">
              <CalendarPlus className="size-3.5" />
              Create
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">Your programmes</h2>
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No programmes yet. Create one above, then drag lyrics into the agenda.
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {events.map((event) => (
              <li key={event.id} className="flex items-center gap-3 px-3 py-3">
                <Link
                  href={`/planner/edit?id=${encodeURIComponent(event.id)}`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.items.length} {event.items.length === 1 ? "item" : "items"}
                    {event.eventDate ? ` · ${event.eventDate}` : ""}
                  </p>
                </Link>
                <Link
                  href={`/planner/edit?id=${encodeURIComponent(event.id)}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Edit
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${event.title}`}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteLocalEvent(event.id);
                      toast.success("Programme deleted.");
                    })
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
