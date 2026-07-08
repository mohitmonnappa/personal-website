"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Command, CornerDownLeft, Search } from "lucide-react";
import { noteSearchEntries } from "@/lib/notes-data";

const SNIPPET_RADIUS = 60;

type Result = {
  title: string;
  url: string;
  breadcrumb: string;
  snippet: string | null;
};

function buildSnippet(text: string, query: string): string | null {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return null;
  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(text.length, index + query.length + SNIPPET_RADIUS);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

function highlight(text: string, query: string) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-clay-tint text-clay-deep">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo(() => noteSearchEntries(), []);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const titleMatches: Result[] = [];
    const bodyMatches: Result[] = [];

    for (const entry of entries) {
      if (entry.title.toLowerCase().includes(q)) {
        titleMatches.push({
          title: entry.title,
          url: entry.url,
          breadcrumb: entry.breadcrumb,
          snippet: null,
        });
      } else if (entry.text.toLowerCase().includes(q)) {
        bodyMatches.push({
          title: entry.title,
          url: entry.url,
          breadcrumb: entry.breadcrumb,
          snippet: buildSnippet(entry.text, q),
        });
      }
    }

    return [...titleMatches, ...bodyMatches].slice(0, 9);
  }, [entries, query]);

  // Reset the highlighted result whenever the query changes. Adjusted
  // during render (React's recommended pattern for derived state) rather
  // than in an effect, which would otherwise trigger an extra render pass.
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
      if (!isOpen) return;

      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[activeIndex];
        if (target) {
          router.push(target.url);
          close();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, activeIndex, router]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleResultClick(url: string) {
    router.push(url);
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={clsx(
          "flex w-full items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm sm:w-64",
          "text-stone transition-colors hover:border-pine/40 hover:text-ink"
        )}
      >
        <Search className="h-4 w-4" />
        <span>Search notes</span>
        <kbd className="ml-auto inline-flex items-center gap-1 rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] font-medium text-stone">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed left-1/2 top-24 w-full max-w-xl -translate-x-1/2 px-4"
            >
              <div className="rounded-lg border border-line bg-paper-raised shadow-2xl">
                <div className="flex items-center gap-2 border-b border-line px-3">
                  <Search className="h-4 w-4 shrink-0 text-stone" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search notes by title or content…"
                    className="h-12 w-full bg-transparent px-2 text-sm text-ink outline-none placeholder:text-stone"
                  />
                  <kbd className="shrink-0 rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] font-medium text-stone">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {query.trim() === "" ? (
                    <p className="px-2 py-3 text-sm text-stone">
                      Type to search titles and content…
                    </p>
                  ) : results.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-stone">
                      No notes match &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    <ul>
                      {results.map((result, i) => (
                        <li key={result.url}>
                          <button
                            type="button"
                            onClick={() => handleResultClick(result.url)}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={clsx(
                              "block w-full rounded-md px-3 py-2 text-left transition-colors",
                              i === activeIndex ? "bg-pine-tint" : "hover:bg-pine-tint/60"
                            )}
                          >
                            <p className="text-sm font-medium text-ink">
                              {highlight(result.title, query)}
                            </p>
                            <p className="mt-0.5 text-xs text-clay">
                              {result.breadcrumb}
                            </p>
                            {result.snippet && (
                              <p className="mt-1 line-clamp-2 text-xs text-stone">
                                {highlight(result.snippet, query)}
                              </p>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-line px-3 py-2 text-[11px] text-stone">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" /> to select
                  </span>
                  <span>↑↓ to navigate</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
