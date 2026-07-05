import { clsx } from "clsx";

export function Container({
  className,
  children,
  wide = false,
  article = false,
}: {
  className?: string;
  children: React.ReactNode;
  wide?: boolean;
  article?: boolean;
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-6 sm:px-10",
        wide ? "max-w-6xl" : article ? "max-w-5xl" : "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}
