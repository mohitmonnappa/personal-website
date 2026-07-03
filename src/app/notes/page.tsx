import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";
import { noteSections } from "@/lib/notes-data";

export const metadata: Metadata = { title: "Notes" };

export default function NotesIndexPage() {
  return (
    <div>
      <Eyebrow>Methodology</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Notes
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone">
        A running reference of pentesting methodology, organised by phase.
        Pick a topic from the sidebar, or browse by section below.
      </p>

      <div className="mt-14 space-y-12">
        {noteSections.map((section) => (
          <div key={section.slug}>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              {section.title}
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {section.notes.map((note) => (
                <li key={note.slug}>
                  <Link
                    href={`/notes/${section.slug}/${note.slug}`}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span>
                      <span className="block font-medium text-ink">
                        {note.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-stone">
                        {note.summary}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-stone transition-all group-hover:translate-x-0.5 group-hover:text-pine"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
