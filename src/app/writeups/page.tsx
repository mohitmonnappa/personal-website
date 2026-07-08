import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getBanditLevels } from "@/lib/content";
import { machinesByPlatform } from "@/lib/machines-data";

export const metadata: Metadata = { title: "Writeups" };

function CollectionCard({
  href,
  title,
  description,
  count,
}: {
  href: string;
  title: string;
  description: string;
  count: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-raised p-7 transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-[0_8px_24px_-12px_rgba(27,29,26,0.18)]"
    >
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-stone">
          {description}
        </p>
      </div>
      <p className="mt-6 font-mono text-xs text-clay">{count}</p>
    </Link>
  );
}

export default function WriteupsPage() {
  const banditCount = getBanditLevels().length;
  const tryhackmeCount = machinesByPlatform("TryHackMe").length;
  const hacktheboxCount = machinesByPlatform("HackTheBox").length;

  return (
    <Container wide>
      <PageHeader
        eyebrow="Field notes"
        title="Writeups"
        description="Challenges, CTFs and machines I've worked on throughout my journey."
      />

      <div className="mb-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <CollectionCard
          href="/writeups/bandit"
          title="OverTheWire: Bandit"
          description="A challenge that builds Linux and command-line fundamentals one level at a time — each level unlocks the password for the next."
          count={`${banditCount} levels documented`}
        />

        <CollectionCard
          href="/writeups/tryhackme"
          title="TryHackMe"
          description="Condensed writeups covering recon, exploitation, and privilege escalation for full machines."
          count={`${tryhackmeCount} machine${tryhackmeCount === 1 ? "" : "s"}`}
        />

        <CollectionCard
          href="/writeups/hackthebox"
          title="HackTheBox"
          description="Condensed writeups covering recon, exploitation, and privilege escalation for full machines."
          count={`${hacktheboxCount} machine${hacktheboxCount === 1 ? "" : "s"}`}
        />
      </div>
    </Container>
  );
}
