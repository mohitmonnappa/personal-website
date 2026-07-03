import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Button } from "@/components/Button";
import { ProjectCard } from "@/components/ProjectCard";
import { TraceDivider } from "@/components/TraceDivider";
import { Hero } from "@/components/Hero";
import { getProjects } from "@/lib/content";

export default function Home() {
  const projects = getProjects().slice(0, 3);

  return (
    <>
      <Hero />

      <TraceDivider />

      <Container wide>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Selected work</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="hidden items-center gap-1 text-sm font-medium text-stone transition-colors hover:text-pine sm:flex"
          >
            All projects <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <Link
          href="/projects"
          className="mt-6 flex items-center gap-1 text-sm font-medium text-stone transition-colors hover:text-pine sm:hidden"
        >
          All projects <ArrowUpRight size={15} />
        </Link>
      </Container>

      <TraceDivider />

      <Container wide>
        <Eyebrow>Field notes</Eyebrow>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Writeups &amp; methodology
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href="/writeups"
            className="group rounded-2xl border border-line bg-paper-raised p-7 transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-[0_8px_24px_-12px_rgba(27,29,26,0.18)]"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                Writeups
              </h3>
              <ArrowUpRight
                size={18}
                className="text-stone transition-colors group-hover:text-pine"
              />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-stone">
              OverTheWire Bandit walkthroughs, plus condensed HTB and TryHackMe
              machine writeups as I work through them.
            </p>
          </Link>

          <Link
            href="/notes"
            className="group rounded-2xl border border-line bg-paper-raised p-7 transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-[0_8px_24px_-12px_rgba(27,29,26,0.18)]"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                Notes
              </h3>
              <ArrowUpRight
                size={18}
                className="text-stone transition-colors group-hover:text-pine"
              />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-stone">
              A running reference of pentesting methodology and techniques,
              organised by phase and topic.
            </p>
          </Link>
        </div>
      </Container>

      <Container wide className="mt-24 mb-8">
        <div className="rounded-2xl border border-line bg-paper-raised px-8 py-12 text-center sm:px-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Get in touch
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-stone">
            Open to security-focused internships and collaboration. The
            fastest way to reach me is email.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href="mailto:monnappamohit@gmail.com" external>
              Say hello
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
