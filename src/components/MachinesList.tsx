import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { MachineCard } from "@/components/MachineCard";
import type { Machine } from "@/lib/machines-data";

export function MachinesList({
  title,
  description,
  machines,
}: {
  title: string;
  description: string;
  machines: Machine[];
}) {
  return (
    <Container wide>
      <Link
        href="/writeups"
        className="mt-14 inline-flex items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-pine sm:mt-20"
      >
        <ArrowLeft size={15} /> All writeups
      </Link>

      <PageHeader eyebrow="Machines" title={title} description={description} />

      <div className="mb-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {machines.map((m) => (
          <MachineCard key={m.slug} machine={m} />
        ))}
      </div>
    </Container>
  );
}
