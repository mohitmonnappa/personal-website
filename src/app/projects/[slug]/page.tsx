import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Prose } from "@/components/Prose";
import { getProjects } from "@/lib/content";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjects().find((p) => p.slug === slug);
  return { title: project?.title ?? "Project" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjects().find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <Container>
      <div className="pb-16 pt-14 sm:pt-20">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-pine"
        >
          <ArrowLeft size={15} /> All projects
        </Link>

        <Eyebrow className="mt-8">{project.category}</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {project.title}
        </h1>
        <p className="mt-2 text-lg font-medium text-clay">
          {project.subtitle}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-stone"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="pb-24">
        <Prose source={project.body} />
      </div>
    </Container>
  );
}
