import Link from "next/link";
import { AppLogo } from "./app-logo";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-2 px-3 sm:h-14 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="mr-1 flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppLogo className="size-8 shrink-0 sm:size-9" />
          <span className="text-sm font-semibold tracking-tight sm:text-base">Azadari</span>
        </Link>

        <NavLinks className="hidden sm:flex" />

        <div className="ml-auto flex items-center gap-1">
          <OfflineIndicator />
          <ThemeToggle />
        </div>
      </div>
      <NavLinks className="flex gap-0.5 border-t px-2 py-1 sm:hidden" />
    </header>
  );
}
