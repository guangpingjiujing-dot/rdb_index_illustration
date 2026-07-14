import Link from "next/link";
import type { SectionKey } from "@/content/sections";
import { rdbTopics, dataModelingTopicsIn, type Topic } from "@/content/topics";

const DATA_MODELING_ORDER = [
  "why",
  "functional-dependency",
  "keys",
  "1nf",
  "2nf",
  "3nf",
  "denormalization",
] as const;

function getOrderedTopics(section: SectionKey): Topic[] {
  if (section === "rdb-index") {
    return rdbTopics;
  }
  const normalization = dataModelingTopicsIn("normalization");
  const ordered: Topic[] = [];
  for (const slug of DATA_MODELING_ORDER) {
    const t = normalization.find((n) => n.slug === slug);
    if (t) ordered.push(t);
  }
  return ordered;
}

/**
 * 前後トピックへのナビゲーション。
 * 学習順序に沿った prev / next リンクを表示する。
 */
export function PrevNext({
  section,
  currentSlug,
}: {
  section: SectionKey;
  currentSlug: string;
}) {
  const ordered = getOrderedTopics(section);
  const idx = ordered.findIndex((t) => t.slug === currentSlug);
  if (idx === -1) return null;
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx < ordered.length - 1 ? ordered[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="前後のトピック"
      className="not-prose mt-16 border-t border-[var(--border)] pt-8"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {prev ? (
          <Link
            href={prev.path}
            className="group flex flex-col justify-center items-center text-center border border-[var(--border-strong)] bg-[var(--card)] px-5 py-4 hover:bg-[var(--muted)]/60 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              ← 前へ
            </span>
            <span className="mt-1 text-sm font-bold text-[var(--foreground)] group-hover:underline underline-offset-4">
              {prev.shortTitle}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={next.path}
            className="group flex flex-col justify-center items-center text-center border border-[var(--border-strong)] bg-[var(--card)] px-5 py-4 hover:bg-[var(--muted)]/60 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              次へ →
            </span>
            <span className="mt-1 text-sm font-bold text-[var(--foreground)] group-hover:underline underline-offset-4">
              {next.shortTitle}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
