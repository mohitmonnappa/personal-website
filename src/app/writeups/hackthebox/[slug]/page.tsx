import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MachineDetail } from "@/components/MachineDetail";
import { machinesByPlatform, getMachine } from "@/lib/machines-data";

export function generateStaticParams() {
  return machinesByPlatform("HackTheBox").map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const machine = getMachine(slug);
  return { title: machine?.name ?? "HackTheBox" };
}

export default async function HackTheBoxMachinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const machine = getMachine(slug);
  if (!machine || machine.platform !== "HackTheBox") notFound();

  return (
    <MachineDetail
      machine={machine}
      backHref="/writeups/hackthebox"
      backLabel="All HackTheBox"
    />
  );
}
