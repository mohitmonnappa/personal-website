"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { noteSections } from "@/lib/notes-data";

export function NotesSidebar() {
  const pathname = usePathname();

  return (
    <nav className="text-sm">
      <ul className="space-y-6">
        {noteSections.map((section) => (
          <li key={section.slug}>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-stone">
              {section.title}
            </p>
            <ul className="mt-2.5 space-y-0.5 border-l border-line">
              {section.notes.map((note) => {
                const href = `/notes/${section.slug}/${note.slug}`;
                const active = pathname === href;
                return (
                  <li key={note.slug}>
                    <Link
                      href={href}
                      className={clsx(
                        "-ml-px block border-l py-1.5 pl-4 transition-colors",
                        active
                          ? "border-pine font-medium text-pine"
                          : "border-transparent text-stone hover:border-line hover:text-ink"
                      )}
                    >
                      {note.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
