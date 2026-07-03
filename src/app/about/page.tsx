import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, Flag, Shield } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Eyebrow } from "@/components/Eyebrow";
import { Button } from "@/components/Button";
import { GithubGlyph, LinkedinGlyph } from "@/components/icons";
import { certifications } from "@/lib/about-data";

export const metadata: Metadata = { title: "About" };

const SOCIALS = [
  {
    href: "https://github.com/mohitmonnappa",
    label: "GitHub",
    node: <GithubGlyph size={17} />,
  },
  {
    href: "https://linkedin.com/in/mohit-monnappa",
    label: "LinkedIn",
    node: <LinkedinGlyph size={17} />,
  },
  {
    href: "https://tryhackme.com/p/bobchamp",
    label: "TryHackMe",
    node: <Flag size={17} strokeWidth={1.75} />,
  },
  {
    href: "https://app.hackthebox.com/users/1984837",
    label: "HackTheBox",
    node: <Shield size={17} strokeWidth={1.75} />,
  },
];

export default function AboutPage() {
  return (
    <Container>
      <PageHeader eyebrow="About" title="Hello, I'm Mohit" />

      <div className="max-w-xl space-y-5 text-lg leading-relaxed text-ink">
        <p>
          I&rsquo;m a final-year Information Science student, and I started
          writing here to document my path into cybersecurity &mdash; what
          I&rsquo;m learning, what I&rsquo;m building, and the machines and
          challenges I work through along the way.
        </p>
        <p className="text-stone">
          Outside of coursework, most of my time goes into CTFs and practical
          security tooling: LLM firewalls, agent frameworks, and small
          systems that are more interesting to take apart than to use.
        </p>
      </div>

      <div className="mt-6">
        <Button href="mailto:monnappamohit@gmail.com" external variant="secondary">
          <Mail size={15} /> Email me
        </Button>
      </div>

      <div className="mt-16">
        <Eyebrow>Certifications</Eyebrow>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {certifications.map((cert) => (
            <li key={cert.title}>
              <Link
                href={cert.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 py-4"
              >
                <span>
                  <span className="block font-medium text-ink">
                    {cert.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-stone">
                    {cert.issuer}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-stone transition-colors group-hover:text-pine">
                  Verify
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 mb-20">
        <Eyebrow>Elsewhere</Eyebrow>
        <div className="mt-5 flex flex-wrap gap-3">
          {SOCIALS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-pine hover:text-pine"
            >
              {s.node}
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
