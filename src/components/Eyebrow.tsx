import { clsx } from "clsx";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={clsx(
        "font-display text-xs font-semibold uppercase tracking-[0.18em] text-pine",
        className
      )}
    >
      {children}
    </p>
  );
}
