import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { platformSlug, type Machine } from "@/lib/machines-data";

export function MachineCard({ machine }: { machine: Machine }) {
  return (
    <Link
      href={`/writeups/${platformSlug(machine.platform)}/${machine.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-raised p-6 transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-[0_8px_24px_-12px_rgba(27,29,26,0.18)]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            {machine.name}
          </h3>
          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-stone transition-colors group-hover:text-pine"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-medium text-clay">{machine.difficulty}</span>
          <span className="text-line">&middot;</span>
          <span className="text-stone">{machine.os}</span>
        </div>

        <p className="mt-3 text-[15px] leading-relaxed text-stone">
          {machine.summary}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {machine.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-stone"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
