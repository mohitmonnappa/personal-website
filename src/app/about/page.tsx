import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Eyebrow } from "@/components/Eyebrow";
import {
  GithubGlyph,
  HackTheBoxGlyph,
  LinkedinGlyph,
  TryHackMeGlyph,
} from "@/components/icons";
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
    node: <TryHackMeGlyph size={17} />,
  },
  {
    href: "https://app.hackthebox.com/users/1984837",
    label: "HackTheBox",
    node: <HackTheBoxGlyph size={17} />,
  },
];

export default function AboutPage() {
  return (
    <Container>
      <PageHeader eyebrow="About" title="Hello, I'm Mohit" />

      <div className="max-w-xl space-y-5 text-lg leading-relaxed text-ink">
        <p>
          I started this blog in June 2026 to share my journey into
          cybersecurity and what I&rsquo;ve been up to recently.
        </p>
        <p>
          I&rsquo;m a final-year Information Science student, graduating
          soon.
        </p>
      </div>

      <div className="mt-20">
        <Eyebrow>Credentials</Eyebrow>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
          Certifications
        </h2>

        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper-raised">
          {certifications.map((cert) => (
            <li key={cert.title}>
              <Link
                href={cert.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-pine-tint/40"
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
        <Eyebrow>Socials</Eyebrow>
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
