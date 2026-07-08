"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { noteTree, type NoteNode } from "@/lib/notes-data";

function NoteTreeItem({
  node,
  parentSlugs,
  pathname,
  depth,
}: {
  node: NoteNode;
  parentSlugs: string[];
  pathname: string;
  depth: number;
}) {
  const slugs = [...parentSlugs, node.slug];
  const href = `/notes/${slugs.join("/")}`;
  const active = pathname === href;
  const hasChildren = !!node.children && node.children.length > 0;

  return (
    <li>
      {node.body ? (
        <Link
          href={href}
          className={clsx(
            "-ml-px block border-l py-1.5 pl-4 transition-colors",
            active
              ? "border-pine font-medium text-pine"
              : hasChildren && depth === 0
                ? "border-transparent text-clay hover:border-line hover:text-ink"
                : hasChildren && depth === 1
                  ? "border-transparent text-clay-deep hover:border-line hover:text-ink"
                  : "border-transparent text-stone hover:border-line hover:text-ink"
          )}
        >
          {node.title}
        </Link>
      ) : (
        <span
          className={clsx(
            "-ml-px block border-l border-transparent py-1.5 pl-4",
            hasChildren && depth === 0
              ? "text-clay/70"
              : hasChildren && depth === 1
                ? "text-clay-deep/70"
                : "text-stone/70"
          )}
        >
          {node.title}
        </span>
      )}
      {node.children && node.children.length > 0 && (
        <ul className="ml-3 space-y-0.5 border-l border-line">
          {node.children.map((child) => (
            <NoteTreeItem
              key={child.slug}
              node={child}
              parentSlugs={slugs}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function NotesSidebar() {
  const pathname = usePathname();

  return (
    <nav className="text-sm">
      <ul className="space-y-6">
        {noteTree.map((section) => (
          <li key={section.slug}>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              {section.title}
            </p>
            {section.children && section.children.length > 0 && (
              <ul className="mt-2.5 space-y-0.5 border-l border-line">
                {section.children.map((child) => (
                  <NoteTreeItem
                    key={child.slug}
                    node={child}
                    parentSlugs={[section.slug]}
                    pathname={pathname}
                    depth={0}
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
