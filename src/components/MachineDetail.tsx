import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Prose } from "@/components/Prose";
import { StickySectionTabs } from "@/components/StickySectionTabs";
import type { Machine } from "@/lib/machines-data";

export function MachineDetail({
  machine,
  backHref,
  backLabel,
}: {
  machine: Machine;
  backHref: string;
  backLabel: string;
}) {
  return (
    <Container>
      <div className="pb-14 pt-14 sm:pt-20">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-pine"
        >
          <ArrowLeft size={15} /> {backLabel}
        </Link>

        <Eyebrow className="mt-8">{machine.platform}</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {machine.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-medium text-clay">{machine.difficulty}</span>
          <span className="text-line">&middot;</span>
          <span className="text-stone">{machine.os}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {machine.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-stone"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-24">
        <StickySectionTabs topOffset="4rem">
          {machine.phases.map((phase, i) => (
            <StickySectionTabs.Item
              key={phase.title}
              id={phase.title}
              title={
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-stone">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg font-semibold tracking-tight text-ink">
                    {phase.title}
                  </span>
                </span>
              }
            >
              <Prose source={phase.body} />
            </StickySectionTabs.Item>
          ))}
        </StickySectionTabs>
      </div>
    </Container>
  );
}
