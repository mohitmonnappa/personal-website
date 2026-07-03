import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Prose } from "@/components/Prose";
import { getBanditLevels, getBanditLevel } from "@/lib/content";

export function generateStaticParams() {
  return getBanditLevels().map((lvl) => ({ level: lvl.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  const lvl = getBanditLevel(level);
  return { title: lvl ? `Bandit ${lvl.title}` : "Bandit" };
}

export default async function BanditLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const current = getBanditLevel(level);
  if (!current) notFound();

  const levels = getBanditLevels();
  const idx = levels.findIndex((l) => l.slug === current.slug);
  const prev = idx > 0 ? levels[idx - 1] : null;
  const next = idx < levels.length - 1 ? levels[idx + 1] : null;

  return (
    <Container>
      <div className="pb-10 pt-14 sm:pt-20">
        <Link
          href="/writeups/bandit"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-pine"
        >
          <ArrowLeft size={15} /> All levels
        </Link>

        <Eyebrow className="mt-8">
          Bandit &middot; Level {String(current.level).padStart(2, "0")}
        </Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {current.title}
        </h1>
      </div>

      <div className="pb-16">
        <Prose source={current.body} />
      </div>

      <nav className="mb-24 flex items-center justify-between gap-4 border-t border-line pt-8">
        {prev ? (
          <Link
            href={`/writeups/bandit/${prev.slug}`}
            className="group flex flex-col text-sm"
          >
            <span className="text-stone">Previous</span>
            <span className="mt-0.5 flex items-center gap-1.5 font-medium text-ink transition-colors group-hover:text-pine">
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/writeups/bandit/${next.slug}`}
            className="group flex flex-col items-end text-sm"
          >
            <span className="text-stone">Next</span>
            <span className="mt-0.5 flex items-center gap-1.5 font-medium text-ink transition-colors group-hover:text-pine">
              {next.title}
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Container>
  );
}
