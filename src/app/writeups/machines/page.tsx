import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Eyebrow } from "@/components/Eyebrow";
import { MachineCard } from "@/components/MachineCard";
import { machinesByPlatform } from "@/lib/machines-data";

export const metadata: Metadata = { title: "Machines" };

export default function MachinesIndexPage() {
  const tryhackme = machinesByPlatform("TryHackMe");
  const hackthebox = machinesByPlatform("HackTheBox");

  return (
    <Container wide>
      <Link
        href="/writeups"
        className="mt-14 inline-flex items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-pine sm:mt-20"
      >
        <ArrowLeft size={15} /> All writeups
      </Link>

      <PageHeader
        eyebrow="Machines"
        title="HackTheBox & TryHackMe"
        description="Condensed writeups from full-machine engagements, covering recon through privilege escalation."
      />

      <div className="mb-24 space-y-14">
        <div>
          <Eyebrow>TryHackMe</Eyebrow>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tryhackme.map((m) => (
              <MachineCard key={m.slug} machine={m} />
            ))}
          </div>
        </div>

        <div>
          <Eyebrow>HackTheBox</Eyebrow>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hackthebox.map((m) => (
              <MachineCard key={m.slug} machine={m} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
