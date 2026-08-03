"use client";

import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowLeft,
  GripVertical,
  Link2,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { LyricSearchInput } from "@/components/lyrics/lyric-search-input";
import { EventPdfButton } from "@/components/planner/event-pdf-button";
import { EventQrDialog } from "@/components/planner/event-qr-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROGRAM_SEGMENTS } from "@/lib/taxonomy";
import { isRtlText } from "@/lib/text";
import {
  db,
  saveLocalEvent,
  type LocalEvent,
  type LocalEventItem,
} from "@/lib/offline/db";
import { encodeShareProgramme, shareUrl } from "@/lib/planner/share-codec";
import { matchesLyricQuery } from "@/lib/search/lyrics";
import { cn } from "@/lib/utils";
import type { Lyric } from "@/types";

type CatalogueEntry = Pick<Lyric, "id" | "title" | "type" | "poet_name" | "reciter_name">;

function normalizeEvent(event: LocalEvent): LocalEvent {
  return {
    ...event,
    items: event.items ?? [],
  };
}

export function EventEditor({
  eventId,
  catalogue,
}: {
  eventId: string;
  catalogue: CatalogueEntry[];
}) {
  const stored = useLiveQuery(async () => {
    if (!db) return null;
    const event = await db.events.get(eventId);
    return event ?? null;
  }, [eventId]);

  if (stored === undefined) {
    return <p className="text-sm text-muted-foreground">Loading programme…</p>;
  }

  if (stored === null) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">Programme not found</p>
        <Link href="/planner" className={cn(buttonVariants({ size: "sm" }), "mt-3")}>
          Back to planner
        </Link>
      </div>
    );
  }

  return <EventEditorForm key={stored.id} initial={normalizeEvent(stored)} catalogue={catalogue} />;
}

function EventEditorForm({
  initial,
  catalogue,
}: {
  initial: LocalEvent;
  catalogue: CatalogueEntry[];
}) {
  const [draft, setDraft] = useState(initial);
  const [catalogueQuery, setCatalogueQuery] = useState("");
  const [segmentToAdd, setSegmentToAdd] = useState<string>(PROGRAM_SEGMENTS[0]);
  const [pending, startTransition] = useTransition();
  const [qrOpen, setQrOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const itemIds = useMemo(() => draft.items.map((item) => item.id), [draft.items]);

  const filteredCatalogue = useMemo(
    () => catalogue.filter((lyric) => matchesLyricQuery(lyric.id, catalogueQuery)),
    [catalogue, catalogueQuery],
  );

  const { hash, truncated } = useMemo(
    () =>
      encodeShareProgramme({
        title: draft.title,
        eventDate: draft.eventDate,
        items: draft.items,
      }),
    [draft.title, draft.eventDate, draft.items],
  );

  const shareLink = useMemo(() => shareUrl(hash), [hash]);

  const persist = (next: LocalEvent) => {
    setDraft(next);
    startTransition(async () => {
      await saveLocalEvent(next);
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = draft.items.findIndex((item) => item.id === active.id);
    const newIndex = draft.items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    persist({ ...draft, items: arrayMove(draft.items, oldIndex, newIndex) });
  };

  const addLyric = (lyric: CatalogueEntry) => {
    const item: LocalEventItem = {
      id: crypto.randomUUID(),
      lyricId: lyric.id,
      title: lyric.title,
      note: null,
    };
    persist({ ...draft, items: [...draft.items, item] });
    toast.success("Added to programme.");
  };

  const addSegment = () => {
    const item: LocalEventItem = {
      id: crypto.randomUUID(),
      lyricId: null,
      title: segmentToAdd,
      note: null,
    };
    persist({ ...draft, items: [...draft.items, item] });
    toast.success("Segment added.");
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success(
        truncated
          ? "Link copied (some notes were shortened to fit)."
          : "Share link copied.",
      );
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/planner"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All programmes
      </Link>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="plan-title">Title</Label>
          <Input
            id="plan-title"
            value={draft.title}
            onChange={(event) => persist({ ...draft, title: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="plan-date">Date</Label>
          <Input
            id="plan-date"
            type="date"
            value={draft.eventDate ?? ""}
            onChange={(event) => persist({ ...draft, eventDate: event.target.value || null })}
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Button variant="outline" size="sm" disabled={pending} onClick={copyShareLink}>
            <Link2 className="size-3.5" />
            Copy share link
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
            <QrCode className="size-3.5" />
            QR
          </Button>
          <EventPdfButton event={draft} />
        </div>
      </div>

      <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs break-all text-muted-foreground">
        Share link (anyone with it can view this agenda):{" "}
        <a href={shareLink} className="text-foreground underline">
          {shareLink}
        </a>
      </p>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-lg border p-3">
          <Label htmlFor="catalogue-search" className="text-xs">
            Add from catalogue
          </Label>
          <LyricSearchInput
            id="catalogue-search"
            value={catalogueQuery}
            onChange={setCatalogueQuery}
            size="sm"
            aria-label="Search catalogue"
          />
          <div
            className="max-h-52 overflow-y-auto rounded-md border bg-background"
            role="listbox"
            aria-label="Catalogue results"
          >
            {filteredCatalogue.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No matches. Try another search.
              </p>
            ) : (
              <ul className="divide-y">
                {filteredCatalogue.map((lyric) => {
                  const rtlTitle = isRtlText(lyric.title);
                  return (
                    <li key={lyric.id}>
                      <button
                        type="button"
                        role="option"
                        className="flex w-full items-center gap-2 px-2.5 py-2 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                        onClick={() => addLyric(lyric)}
                      >
                        <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                        <span
                          className={cn(
                            "min-w-0 flex-1 leading-snug",
                            rtlTitle
                              ? "urdu-title text-right text-sm"
                              : "text-sm font-medium",
                          )}
                          dir={rtlTitle ? "rtl" : undefined}
                          lang={rtlTitle ? "ur" : undefined}
                        >
                          {lyric.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <p className="text-[0.7rem] text-muted-foreground">
            {filteredCatalogue.length} of {catalogue.length} — tap a row to add
          </p>
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <Label className="text-xs">Add programme segment</Label>
          <Select
            value={segmentToAdd}
            onValueChange={(value) => setSegmentToAdd(String(value))}
            items={PROGRAM_SEGMENTS.map((segment) => ({ value: segment, label: segment }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRAM_SEGMENTS.map((segment) => (
                <SelectItem key={segment} value={segment}>
                  {segment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={addSegment}>
            <Plus className="size-3.5" />
            Add segment
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium">Agenda ({draft.items.length})</h2>
        {draft.items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Add lyrics or segments, then drag to reorder.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {draft.items.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    index={index}
                    eventId={draft.id}
                    onNoteChange={(note) =>
                      persist({
                        ...draft,
                        items: draft.items.map((entry) =>
                          entry.id === item.id ? { ...entry, note: note || null } : entry,
                        ),
                      })
                    }
                    onRemove={() =>
                      persist({
                        ...draft,
                        items: draft.items.filter((entry) => entry.id !== item.id),
                      })
                    }
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      <EventQrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={draft.title}
        url={shareLink}
      />
    </div>
  );
}

function SortableItem({
  item,
  index,
  eventId,
  onNoteChange,
  onRemove,
}: {
  item: LocalEventItem;
  index: number;
  eventId: string;
  onNoteChange: (note: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const rtlTitle = isRtlText(item.title);

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "rounded-lg border bg-background p-3",
        isDragging && "z-10 shadow-md",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 touch-none rounded p-1 text-muted-foreground hover:bg-muted"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              rtlTitle && "flex-row-reverse justify-end",
            )}
          >
            <span className="text-xs tabular-nums text-muted-foreground">{index + 1}.</span>
            <p
              className={cn(
                "min-w-0",
                rtlTitle ? "urdu-title text-base" : "text-sm font-medium",
              )}
              dir={rtlTitle ? "rtl" : undefined}
              lang={rtlTitle ? "ur" : undefined}
            >
              {item.title}
            </p>
            <Badge variant="outline">{item.lyricId ? "Lyric" : "Segment"}</Badge>
            {item.lyricId && (
              <Link
                href={`/lyrics/${item.lyricId}?from=planner&eid=${encodeURIComponent(eventId)}`}
                className="text-xs text-muted-foreground underline"
              >
                Open
              </Link>
            )}
          </div>
          <Textarea
            rows={2}
            placeholder="Optional note for the organiser…"
            value={item.note ?? ""}
            onChange={(event) => onNoteChange(event.target.value)}
            className="text-sm"
          />
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Remove item" onClick={onRemove}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}
