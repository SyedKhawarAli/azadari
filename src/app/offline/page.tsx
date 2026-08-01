import Link from "next/link";
import { WifiOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-3 py-12 text-center sm:gap-4 sm:px-4 sm:py-16">
      <WifiOff className="size-8 text-muted-foreground sm:size-10" />
      <h1 className="text-lg font-semibold sm:text-xl">You are offline</h1>
      <p className="text-xs text-muted-foreground sm:text-sm">
        This page has not been opened on this device yet, so it is not available offline. Anything
        you have already visited — along with your favourites and Majlis plans — still works.
      </p>
      <div className="flex gap-2">
        <Link href="/favorites" className={buttonVariants({ variant: "outline" })}>
          Favourites
        </Link>
        <Link href="/planner" className={buttonVariants()}>
          Majlis Planner
        </Link>
      </div>
    </div>
  );
}
