import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <Container size="wide">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight"
          >
            <LogoMark />
            <span className="hidden sm:inline">{site.name}</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/#topics"
              className="hidden sm:inline-block px-3 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              トピック
            </Link>
            <Link
              href="/about"
              className="hidden sm:inline-block px-3 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              著者について
            </Link>
            <Link
              href={site.author.mentorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center border border-[var(--foreground)] px-3 py-1.5 text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white transition-colors"
            >
              無料相談
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}

function LogoMark() {
  return (
    <svg
      aria-hidden
      width="24"
      height="24"
      viewBox="0 0 32 32"
      className="text-[var(--foreground)]"
    >
      <rect x="4" y="6" width="24" height="4" fill="currentColor" opacity="0.25" />
      <rect x="4" y="14" width="24" height="4" fill="currentColor" opacity="0.55" />
      <rect x="4" y="22" width="24" height="4" fill="currentColor" />
    </svg>
  );
}
