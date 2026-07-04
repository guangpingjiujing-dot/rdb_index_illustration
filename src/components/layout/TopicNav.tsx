import Link from "next/link";
import { topics, type Topic } from "@/content/topics";
import { cn } from "@/lib/utils";

const GROUP_LABEL: Record<Topic["group"], string> = {
  prereq: "前提知識",
  "index-type": "インデックスの種類",
  related: "関連トピック",
};

export function TopicNav({ currentSlug }: { currentSlug?: string }) {
  const groups = (
    ["prereq", "index-type", "related"] as const
  ).map((g) => ({
    key: g,
    label: GROUP_LABEL[g],
    items: topics.filter((t) => t.group === g),
  }));

  return (
    <nav aria-label="トピック一覧" className="text-sm">
      {groups.map((g) => (
        <div key={g.key} className="mb-6">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            {g.label}
          </div>
          <ul className="border-l border-[var(--border)]">
            {g.items.map((t) => {
              const active = t.slug === currentSlug;
              return (
                <li key={t.slug}>
                  <Link
                    href={t.path}
                    className={cn(
                      "block border-l-2 -ml-px px-3 py-1.5 leading-snug transition-colors",
                      active
                        ? "border-[var(--foreground)] text-[var(--foreground)] font-semibold bg-[var(--muted)]/60"
                        : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {t.shortTitle}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
