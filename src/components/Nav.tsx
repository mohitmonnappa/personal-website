"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import { Container } from "./Container";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/writeups", label: "Writeups" },
  { href: "/notes", label: "Notes" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <Container wide>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-ink"
            onClick={() => setOpen(false)}
          >
            Mohit Monnappa
          </Link>

          <nav className="hidden items-center gap-8 sm:flex">
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "relative py-1 text-sm font-medium transition-colors",
                    active ? "text-pine" : "text-stone hover:text-ink"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-pine" />
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-ink sm:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {open && (
        <nav className="border-t border-line bg-paper sm:hidden">
          <Container wide className="flex flex-col py-3">
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "border-b border-line py-3 text-sm font-medium last:border-none",
                    active ? "text-pine" : "text-stone"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </Container>
        </nav>
      )}
    </header>
  );
}
