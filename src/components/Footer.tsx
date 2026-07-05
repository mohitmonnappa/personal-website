import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "./Container";
import {
  GithubGlyph,
  HackTheBoxGlyph,
  LinkedinGlyph,
  TryHackMeGlyph,
} from "./icons";

const SOCIALS = [
  {
    href: "https://github.com/mohitmonnappa",
    label: "GitHub",
    node: <GithubGlyph size={18} />,
  },
  {
    href: "https://linkedin.com/in/mohit-monnappa",
    label: "LinkedIn",
    node: <LinkedinGlyph size={18} />,
  },
  {
    href: "https://tryhackme.com/p/bobchamp",
    label: "TryHackMe",
    node: <TryHackMeGlyph size={18} />,
  },
  {
    href: "https://app.hackthebox.com/users/1984837",
    label: "HackTheBox",
    node: <HackTheBoxGlyph size={18} />,
  },
  {
    href: "mailto:monnappamohit@gmail.com",
    label: "Email",
    node: <Mail size={18} strokeWidth={1.75} />,
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container
        wide
        className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-stone">
          Mohit Monnappa &middot; {new Date().getFullYear()}
        </p>

        <div className="flex items-center gap-5">
          {SOCIALS.map(({ href, label, node }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-stone transition-colors hover:text-pine"
            >
              {node}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
