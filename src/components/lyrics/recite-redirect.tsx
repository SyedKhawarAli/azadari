"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ReciteRedirect({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/lyrics/${id}`);
  }, [id, router]);

  return (
    <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">
      Opening lyric…
    </p>
  );
}
