"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EventQrDialog({
  open,
  onOpenChange,
  title,
  url,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share QR code</DialogTitle>
          <DialogDescription>
            Scan to open “{title}”. Guests on this device can open the public link even offline once
            the page has been cached.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="rounded-lg bg-white p-3">
            <QRCodeSVG value={url} size={200} level="M" includeMargin />
          </div>
          <p className="max-w-full break-all text-center text-xs text-muted-foreground">{url}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
