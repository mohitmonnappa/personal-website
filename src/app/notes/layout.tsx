import { Container } from "@/components/Container";
import { NotesSidebar } from "@/components/NotesSidebar";
import { CommandPalette } from "@/components/CommandPalette";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container wide>
      <div className="flex flex-col gap-10 pb-24 pt-14 sm:pt-20 lg:flex-row lg:gap-16">
        {/*
          The sticky offset (lg:top-36 = 9rem) matches this row's actual
          static top offset on desktop - the 4rem sticky Nav plus this row's
          own 5rem top padding (sm:pt-20, still in effect at lg) - so the
          sidebar pins immediately instead of co-scrolling with the content
          column until it catches up to a mismatched threshold. Keep these
          two in sync if the Nav height or this row's desktop padding change.
        */}
        <aside className="lg:sticky lg:top-36 lg:h-[calc(100vh-10rem)] lg:w-56 lg:shrink-0 lg:overflow-y-auto">
          <NotesSidebar />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex justify-end">
            <CommandPalette />
          </div>
          {children}
        </div>
      </div>
    </Container>
  );
}
