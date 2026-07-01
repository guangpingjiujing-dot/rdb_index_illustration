import { booksForTopic } from "@/content/books";

export function AffiliateBooks({ topicSlug }: { topicSlug: string }) {
  const items = booksForTopic(topicSlug);
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
        もっと学びたい方へ（おすすめ書籍）
      </h2>
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
        本セクションはAmazonアソシエイトのリンクを含みます。購入いただくと運営者に紹介料が入る場合があります。
      </p>
      <ul className="mt-4 border-y border-[var(--border)] divide-y divide-[var(--border)]">
        {items.map((b) => (
          <li key={b.id}>
            <a
              href={b.amazonUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="group flex items-start justify-between gap-4 py-4 px-2 -mx-2 hover:bg-[var(--muted)]/60 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-semibold group-hover:underline underline-offset-4">
                  {b.title}
                </div>
                <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {b.author}
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                  {b.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-[var(--muted-foreground)] pt-1">
                Amazon →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
