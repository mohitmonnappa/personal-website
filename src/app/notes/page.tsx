import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";

export const metadata: Metadata = { title: "Notes" };

export default function NotesIndexPage() {
  return (
    <div>
      <Eyebrow>Methodology</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Notes
      </h1>
      <p className="mt-2 text-lg font-medium text-clay">
        A pentest field manual - phase by phase, tool by tool.
      </p>

      <div className="mt-6 max-w-2xl space-y-5 text-lg leading-relaxed text-stone">
        <p>
          These are my personal pentesting notes, written and collected over
          time. They&apos;re designed to be easy to access and to roughly
          follow the order of a pentest - pick a phase from the sidebar and
          work through it.
        </p>
        <p>
          The site is still a work in progress: some notes are incomplete and
          the structure will keep shifting as I learn. I&apos;ll continue
          refining and expanding them over time.
        </p>
        <p>Hope you find some value in them.</p>
        <p className="text-ink">- Mohit</p>
      </div>

      <h2 className="mt-14 font-display text-xl font-semibold tracking-tight text-ink">
        Disclaimer
      </h2>
      <div className="mt-4 max-w-2xl rounded-lg border border-clay/50 bg-clay-tint px-6 py-5 text-clay-deep">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest">
          <TriangleAlert size={16} className="shrink-0" />
          Caution
        </p>
        <div className="mt-3 space-y-2 leading-relaxed">
          <p className="font-semibold">
            The content on this site is for educational and ethical use only.
          </p>
          <p>
            I do not support or condone illegal activity, and I am not liable
            for any misuse of the techniques shared here. Unauthorized access
            to systems is a crime and can carry serious legal consequences.
          </p>
          <p>
            Use this information responsibly, and only on systems you own or
            have explicit permission to test.
          </p>
        </div>
      </div>
    </div>
  );
}
