import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getBanditLevels } from "@/lib/content";
import { machines } from "@/lib/machines-data";

export const metadata: Metadata = { title: "Writeups" };

export default function WriteupsPage() {
  const banditCount = getBanditLevels().length;

  return (
    <Container wide>
      <PageHeader
        eyebrow="Field notes"
        title="Writeups"
        description="Challenges and machines I've worked through, written up as I go."
      />

      <div className="mb-24 grid gap-5 sm:grid-cols-2">
        <Link
          href="/writeups/bandit"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-raised p-7 transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-[0_8px_24px_-12px_rgba(27,29,26,0.18)]"
        >
          <div>
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                OverTheWire: Bandit
              </h2>
              <ArrowUpRight
                size={18}
                className="text-stone transition-colors group-hover:text-pine"
              />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-stone">
              A challenge that builds Linux and command-line fundamentals one
              level at a time &mdash; each level unlocks the password for the
              next.
            </p>
          </div>
          <p className="mt-6 font-mono text-xs text-stone">
            {banditCount} levels documented
          </p>
        </Link>

        <Link
          href="/writeups/machines"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-raised p-7 transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-[0_8px_24px_-12px_rgba(27,29,26,0.18)]"
        >
          <div>
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                HackTheBox &amp; TryHackMe machines
              </h2>
              <ArrowUpRight
                size={18}
                className="text-stone transition-colors group-hover:text-pine"
              />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-stone">
              Condensed writeups covering recon, exploitation, and privilege
              escalation for full machines.
            </p>
          </div>
          <p className="mt-6 font-mono text-xs text-stone">
            {machines.length} machine{machines.length === 1 ? "" : "s"}
          </p>
        </Link>
      </div>
    </Container>
  );
}
