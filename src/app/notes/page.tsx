import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";
import { noteTree, type NoteNode } from "@/lib/notes-data";

export const metadata: Metadata = { title: "Notes" };

function NoteOutlineItem({
  node,
  parentSlugs,
}: {
  node: NoteNode;
  parentSlugs: string[];
}) {
  const slugs = [...parentSlugs, node.slug];
  const href = `/notes/${slugs.join("/")}`;

  return (
    <li>
      {node.body ? (
        <Link
          href={href}
          className="group flex items-center justify-between gap-4 py-3"
        >
          <span className="font-medium text-ink">{node.title}</span>
          <ArrowRight
            size={16}
            className="shrink-0 text-stone transition-all group-hover:translate-x-0.5 group-hover:text-pine"
          />
        </Link>
      ) : (
        <p className="py-3 text-sm font-medium text-stone">{node.title}</p>
      )}
      {node.children && node.children.length > 0 && (
        <ul className="ml-4 divide-y divide-line border-l border-line pl-4">
          {node.children.map((child) => (
            <NoteOutlineItem
              key={child.slug}
              node={child}
              parentSlugs={slugs}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function NotesIndexPage() {
  return (
    <div>
      <Eyebrow>Methodology</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Notes
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone">
        A running reference of pentesting methodology, organised by phase.
        Pick a topic from the sidebar, or browse the full outline below.
      </p>

      <div className="mt-14 space-y-12">
        {noteTree.map((section) => (
          <div key={section.slug}>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              {section.title}
            </h2>
            {section.children && section.children.length > 0 && (
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {section.children.map((child) => (
                  <NoteOutlineItem
                    key={child.slug}
                    node={child}
                    parentSlugs={[section.slug]}
                  />
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
