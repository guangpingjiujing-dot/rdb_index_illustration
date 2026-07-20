import Link from "next/link";
import { TopicNav } from "@/components/layout/TopicNav";
import { sections } from "@/content/sections";

/**
 * トップページ (Hub) 用のサイドバー。
 * RDB インデックス / データモデリング の両セクションのトピックを縦に並べて表示する。
 */
export function HubTopicNav() {
  return (
    <div className="text-sm">
      <SectionHeading href={sections["rdb-index"].path}>
        {sections["rdb-index"].label}
      </SectionHeading>
      <TopicNav section="rdb-index" hideOtherSection />

      <div className="mt-10">
        <SectionHeading href={sections["data-modeling"].path}>
          {sections["data-modeling"].label}
        </SectionHeading>
        <TopicNav section="data-modeling" hideOtherSection />
      </div>
    </div>
  );
}

function SectionHeading({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mb-4 block border-b border-[var(--foreground)] pb-2 text-xs font-bold uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--muted-foreground)]"
    >
      {children}
    </Link>
  );
}
