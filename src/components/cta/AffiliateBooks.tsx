import { booksForTopic } from "@/content/books";

export function AffiliateBooks({ topicSlug }: { topicSlug: string }) {
  const items = booksForTopic(topicSlug);
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
        もっと学びたい方へ（おすすめ書籍）
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <a
            key={b.id}
            href={b.amazonUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="group flex flex-col rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--muted)]/40"
          >
            <div className="font-semibold leading-snug group-hover:underline underline-offset-4">
              {b.title}
            </div>
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">
              {b.author}
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
              {b.description}
            </p>
            <div className="mt-auto pt-4 text-xs font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
              Amazon で見る →
            </div>
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        本セクションはAmazonアソシエイトのリンクを含みます。
      </p>
    </section>
  );
}
