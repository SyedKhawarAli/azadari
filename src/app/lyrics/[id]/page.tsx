import { notFound } from "next/navigation";
import { LyricReader } from "@/components/lyrics/lyric-reader";
import { allLyricIds, getLyric } from "@/lib/db/queries";

interface LyricPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return allLyricIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: LyricPageProps) {
  const { id } = await params;
  const lyric = getLyric(id);
  if (!lyric) return { title: "Lyric not found" };

  const byline = [lyric.poet_name, lyric.reciter_name].filter(Boolean).join(" · ");
  return {
    title: lyric.title,
    description: byline ? `${lyric.type} — ${byline}` : lyric.type,
  };
}

export default async function LyricPage({ params }: LyricPageProps) {
  const { id } = await params;
  const lyric = getLyric(id);
  if (!lyric) notFound();

  return <LyricReader lyric={lyric} />;
}
