import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="border-b border-[var(--border)]">
        <Container size="wide">
          <div className="flex h-14 items-center justify-between gap-2">
            <Link
              href="/"
              className="font-bold tracking-tight text-[var(--foreground)]"
            >
              {site.author.name}
            </Link>
            <nav className="flex items-center gap-1 text-sm">
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
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
