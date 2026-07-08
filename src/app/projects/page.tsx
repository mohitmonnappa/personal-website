import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <Container wide>
      <PageHeader
        eyebrow="Selected work"
        title="Projects"
        description="Stuff I've built to figure out how things actually work - mostly security and AI."
      />

      <div className="mb-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Container>
  );
}
