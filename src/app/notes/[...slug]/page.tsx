import type { Metadata } from "next";
import Link from "next/link";
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
  return { title: found?.node.title ?? "Notes" };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const found = findNote(slug);
  if (!found) notFound();

  const ancestors = found.path.slice(0, -1);
  // Only direct children that are themselves routable (have a body) -
  // a child that's a pure sub-category (no body of its own) still shows
  // up in the sidebar's full nested tree, just not as a link here.
  const children = (found.node.children ?? []).filter((child) => child.body);

  return (
    <div>
      <Eyebrow>{ancestors.map((n) => n.title).join(" / ")}</Eyebrow>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {found.node.title}
      </h1>
      {children.length > 0 && (
        <div className="mt-8 border-b border-line pb-8">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-clay">
            In this section
          </p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {children.map((child) => (
              <li key={child.slug}>
                <Link
                  href={`/notes/${slug.join("/")}/${child.slug}`}
                  className="block py-3 font-medium text-ink transition-colors hover:text-pine"
                >
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <Prose source={found.node.body!} />
      </div>
    </div>
  );
}
