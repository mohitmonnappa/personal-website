import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/Eyebrow";
import { Prose } from "@/components/Prose";
import { findNote, allNoteParams } from "@/lib/notes-data";

export function generateStaticParams() {
  return allNoteParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = findNote(slug);
  return { title: found?.note.title ?? "Notes" };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const found = findNote(slug);
  if (!found) notFound();

  return (
    <div>
      <Eyebrow>{found.section.title}</Eyebrow>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {found.note.title}
      </h1>
      <div className="mt-8">
        <Prose source={found.note.body} />
      </div>
    </div>
  );
}
