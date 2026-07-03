import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getBanditLevels } from "@/lib/content";

export const metadata: Metadata = { title: "OverTheWire: Bandit" };

export default function BanditIndexPage() {
  const levels = getBanditLevels();

  return (
    <Container>
      <Link
        href="/writeups"
        className="mt-14 inline-flex items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-pine sm:mt-20"
      >
        <ArrowLeft size={15} /> All writeups
      </Link>

      <PageHeader
        eyebrow="Challenge"
        title="OverTheWire: Bandit"
        description="Each level unlocks the SSH password for the next. Solved in order, documented as I went."
      />

      <ol className="mb-24 divide-y divide-line border-y border-line">
        {levels.map((lvl) => (
          <li key={lvl.slug}>
            <Link
              href={`/writeups/bandit/${lvl.slug}`}
              className="group flex items-center justify-between gap-4 py-4"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-stone">
                  {String(lvl.level).padStart(2, "0")}
                </span>
                <span className="font-medium text-ink">{lvl.title}</span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-stone transition-all group-hover:translate-x-0.5 group-hover:text-pine"
              />
            </Link>
          </li>
        ))}
      </ol>
    </Container>
  );
}
