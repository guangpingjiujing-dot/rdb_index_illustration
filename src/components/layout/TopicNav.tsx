import Link from "next/link";
import { rdbTopicsBy, dataModelingTopicsIn } from "@/content/topics";
import { sections, dataModelingCategories, type SectionKey } from "@/content/sections";
import { cn } from "@/lib/utils";

const RDB_GROUPS = [
  { key: "prereq", label: "前提知識" },
  { key: "index-type", label: "インデックスの種類" },
  { key: "related", label: "関連トピック" },
] as const;

type Group = {
  key: string;
  label: string;
  items: { slug: string; path: string; shortTitle: string }[];
};

export function TopicNav({
  section,
  currentSlug,
}: {
  section: SectionKey;
  currentSlug?: string;
}) {
  const groups: Group[] =
    section === "rdb-index"
      ? RDB_GROUPS.map((g) => ({
          key: g.key,
          label: g.label,
          items: rdbTopicsBy(g.key),
        }))
      : Object.values(dataModelingCategories).map((c) => ({
          key: c.key,
          label: c.label,
          items: dataModelingTopicsIn(c.key),
        }));

  const otherSection: SectionKey =
    section === "rdb-index" ? "data-modeling" : "rdb-index";
  const otherMeta = sections[otherSection];

  return (
    <nav aria-label="トピック一覧" className="text-sm">
      {groups.map((g) => (
        <div key={g.key} className="mb-6">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            {g.label}
          </div>
          <ul className="border-l border-[var(--border)]">
            {g.key === "er-diagram" && (
              <li>
                <Link
                  href="/data-modeling/er-diagram"
                  className="group flex items-center gap-2 border-l-2 -ml-px border-transparent px-3 py-1.5 leading-snug text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)]/60 transition-colors"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                    旗艦
                  </span>
                  <span className="font-semibold group-hover:underline underline-offset-4">
                    変なER図
                  </span>
                </Link>
              </li>
            )}
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

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          他のシリーズ
        </div>
        <Link
          href={otherMeta.path}
          className="block px-3 py-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60"
        >
          {otherMeta.shortLabel} →
        </Link>
      </div>
    </nav>
  );
}
