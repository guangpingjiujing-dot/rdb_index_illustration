import { booksForTopic } from "@/content/books";
import { MentorSidebarCTA } from "@/components/cta/MentorSidebarCTA";

export function BookSidebar({ topicSlug }: { topicSlug: string }) {
  const items = booksForTopic(topicSlug);

  return (
    <aside className="hidden lg:flex lg:sticky lg:top-20 lg:self-start lg:flex-col lg:gap-3 lg:max-h-[calc(100vh-6rem)]">
      {items.length > 0 && (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            関連書籍
          </h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {items.map((b) => (
              <li key={b.id} className="py-3 first:pt-0 last:pb-0">
                <a
                  href={b.amazonUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="group block"
                >
                  <div className="text-sm font-semibold leading-snug group-hover:underline underline-offset-4">
                    {b.title}
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {b.author}
                  </div>
                  <div className="mt-1.5 text-[10px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                    Amazon で見る →
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <MentorSidebarCTA />
    </aside>
  );
}
