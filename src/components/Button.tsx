import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";

export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  className?: string;
}) {
  const shared =
    "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-pine text-paper hover:bg-pine-deep"
      : "border border-line text-ink hover:border-pine hover:text-pine";

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={clsx(shared, styles, className)}
    >
      {children}
      <ArrowRight
        size={15}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
