import { allLyricIds } from "@/lib/db/queries";
import { ReciteRedirect } from "@/components/lyrics/recite-redirect";

interface RecitePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return allLyricIds().map((id) => ({ id }));
}

/** Old /recite bookmarks redirect to the unified lyric page. */
export default async function ReciteRedirectPage({ params }: RecitePageProps) {
  const { id } = await params;
  return <ReciteRedirect id={id} />;
}
