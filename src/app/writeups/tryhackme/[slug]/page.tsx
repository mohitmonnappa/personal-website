import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MachineDetail } from "@/components/MachineDetail";
import { machinesByPlatform, getMachine } from "@/lib/machines-data";

export function generateStaticParams() {
  return machinesByPlatform("TryHackMe").map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const machine = getMachine(slug);
  return { title: machine?.name ?? "TryHackMe" };
}

export default async function TryHackMeMachinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const machine = getMachine(slug);
  if (!machine || machine.platform !== "TryHackMe") notFound();

  return (
    <MachineDetail
      machine={machine}
      backHref="/writeups/tryhackme"
      backLabel="All TryHackMe"
    />
  );
}
