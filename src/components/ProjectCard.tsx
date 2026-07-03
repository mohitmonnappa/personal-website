import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/content";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-raised p-6 transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-[0_8px_24px_-12px_rgba(27,29,26,0.18)]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            {project.title}
          </h3>
          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-stone transition-colors group-hover:text-pine"
          />
        </div>
        <p className="mt-1 text-sm font-medium text-clay">{project.subtitle}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-stone">
          {project.summary}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tech.map((t) => (
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
