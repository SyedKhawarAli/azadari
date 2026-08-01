"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { EventProgrammeDocument } from "@/components/planner/event-pdf-document";
import { Button } from "@/components/ui/button";
import type { LocalEvent } from "@/lib/offline/db";

export function EventPdfButton({ event }: { event: LocalEvent }) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await pdf(<EventProgrammeDocument event={event} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${event.title.replace(/[^\w\u0600-\u06FF\- ]+/g, "").trim() || "majlis"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={() => void download()} disabled={busy}>
      <Download className="size-3.5" />
      {busy ? "Building…" : "PDF"}
    </Button>
  );
}
