import { Container } from "@/components/Container";
import { NotesSidebar } from "@/components/NotesSidebar";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container wide>
      <div className="flex flex-col gap-10 pb-24 pt-14 sm:pt-20 lg:flex-row lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:w-56 lg:shrink-0 lg:overflow-y-auto">
          <NotesSidebar />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
