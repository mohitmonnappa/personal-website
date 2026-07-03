import type { Metadata } from "next";
import { MachinesList } from "@/components/MachinesList";
import { machinesByPlatform } from "@/lib/machines-data";

export const metadata: Metadata = { title: "HackTheBox" };

export default function HackTheBoxIndexPage() {
  return (
    <MachinesList
      title="HackTheBox"
      description="Condensed writeups from HackTheBox machines, covering recon through privilege escalation."
      machines={machinesByPlatform("HackTheBox")}
    />
  );
}
