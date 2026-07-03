import type { Metadata } from "next";
import { MachinesList } from "@/components/MachinesList";
import { machinesByPlatform } from "@/lib/machines-data";

export const metadata: Metadata = { title: "TryHackMe" };

export default function TryHackMeIndexPage() {
  return (
    <MachinesList
      title="TryHackMe"
      description="Condensed writeups from TryHackMe machines, covering recon through privilege escalation."
      machines={machinesByPlatform("TryHackMe")}
    />
  );
}
