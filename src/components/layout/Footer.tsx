import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";
import { topics } from "@/content/topics";

export function Footer() {
  const basics = topics.filter((t) => t.level === "basic");
  const advanced = topics.filter((t) => t.level === "advanced");

  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--background)]">
      <Container size="wide" className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="text-lg font-bold">{site.name}</div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
              {site.description}
            </p>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              運営: {site.author.name}（{site.author.role}）
            </p>
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
              基礎トピック
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {basics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={t.path}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {t.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
              発展トピック
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {advanced.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={t.path}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {t.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted-foreground)] md:flex-row md:justify-between">
          <div>© {new Date().getFullYear()} {site.author.name} / {site.name}</div>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-[var(--foreground)]">
              著者について
            </Link>
            <Link href="/privacy" className="hover:text-[var(--foreground)]">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-[var(--foreground)]">
              利用規約
            </Link>
            <Link href="/contact" className="hover:text-[var(--foreground)]">
              お問い合わせ
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
