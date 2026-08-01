import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This path is not part of the static Azadari library. It may have been removed, or the link
        may be incomplete.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "sm" }), "mt-6")}>
        Back to library
      </Link>
    </div>
  );
}
