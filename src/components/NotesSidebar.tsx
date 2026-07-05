"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { noteTree, type NoteNode } from "@/lib/notes-data";

function NoteTreeItem({
  node,
  parentSlugs,
}: {
  node: NoteNode;
  parentSlugs: string[];
}) {
  const pathname = usePathname();
  const slugs = [...parentSlugs, node.slug];
  const href = `/notes/${slugs.join("/")}`;
  const active = pathname === href;

  return (
    <li>
      {node.body ? (
        <Link
          href={href}
          className={clsx(
            "-ml-px block border-l py-1.5 pl-4 transition-colors",
            active
              ? "border-pine font-medium text-pine"
              : "border-transparent text-stone hover:border-line hover:text-ink"
          )}
        >
          {node.title}
        </Link>
      ) : (
        <span className="-ml-px block border-l border-transparent py-1.5 pl-4 text-stone/70">
          {node.title}
        </span>
      )}
      {node.children && node.children.length > 0 && (
        <ul className="ml-3 space-y-0.5 border-l border-line">
          {node.children.map((child) => (
            <NoteTreeItem key={child.slug} node={child} parentSlugs={slugs} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function NotesSidebar() {
  return (
    <nav className="text-sm">
      <ul className="space-y-6">
        {noteTree.map((section) => (
          <li key={section.slug}>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-stone">
              {section.title}
            </p>
            {section.children && section.children.length > 0 && (
              <ul className="mt-2.5 space-y-0.5 border-l border-line">
                {section.children.map((child) => (
                  <NoteTreeItem
                    key={child.slug}
                    node={child}
                    parentSlugs={[section.slug]}
                  />
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
