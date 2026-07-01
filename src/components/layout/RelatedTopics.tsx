import Link from "next/link";
import { topics, findTopic } from "@/content/topics";
import { LevelBadge } from "@/components/ui/Badge";

export function RelatedTopics({ currentSlug }: { currentSlug: string }) {
  const current = findTopic(currentSlug);
  if (!current) return null;
  const related = topics
    .filter((t) => t.slug !== currentSlug && t.group === current.group)
    .slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-20 border-t border-[var(--border)] pt-8">
      <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
        関連トピック
      </h2>
      <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {related.map((t) => (
          <li key={t.slug}>
            <Link
              href={t.path}
              className="group flex items-start justify-between gap-4 py-4 hover:bg-[var(--muted)]/60 px-2 -mx-2 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-semibold group-hover:underline underline-offset-4">
                  {t.shortTitle}
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2">
                  {t.summary}
                </p>
              </div>
              <LevelBadge level={t.level} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
