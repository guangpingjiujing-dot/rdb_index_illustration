import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LevelBadge } from "@/components/ui/Badge";
import { MentorCTA } from "@/components/cta/MentorCTA";
import { AffiliateBooks } from "@/components/cta/AffiliateBooks";
import { BookSidebar } from "@/components/cta/BookSidebar";
import { RelatedTopics } from "@/components/layout/RelatedTopics";
import { findTopic } from "@/content/topics";
import { sections, dataModelingCategories, type SectionKey } from "@/content/sections";

const RDB_GROUP_LABEL = {
  prereq: "前提知識",
  "index-type": "インデックスの種類",
  related: "関連トピック",
} as const;

export function TopicLayout({
  section,
  slug,
  children,
}: {
  section: SectionKey;
  slug: string;
  children: React.ReactNode;
}) {
  const topic = findTopic(section, slug);
  if (!topic) throw new Error(`Topic not found: ${section}/${slug}`);
  const sectionMeta = sections[section];

  const subLabel =
    topic.section === "rdb-index"
      ? RDB_GROUP_LABEL[topic.group]
      : dataModelingCategories[topic.category].label;

  return (
    <Container size="wide" className="py-8 md:py-12">
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1fr_15rem]">
        <article className="min-w-0">
          <nav
            aria-label="パンくず"
            className="mb-6 text-xs text-[var(--muted-foreground)]"
          >
            <Link href={sectionMeta.path} className="hover:text-[var(--foreground)]">
              {sectionMeta.shortLabel}
            </Link>
            <span className="mx-2">/</span>
            <span>{topic.shortTitle}</span>
          </nav>

          <div className="mb-4 flex items-center gap-3">
            <LevelBadge level={topic.level} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {subLabel}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {topic.title}
          </h1>

          <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              定義
            </div>
            <p
              data-speakable="definition"
              className="mt-1 text-[var(--foreground)] leading-relaxed"
            >
              {topic.definition}
            </p>
          </div>

          <div className="prose-jp mt-10 max-w-none">{children}</div>

          <RelatedTopics section={section} currentSlug={slug} />

          <AffiliateBooks topicSlug={slug} />

          <MentorCTA />
        </article>

        <BookSidebar topicSlug={slug} />
      </div>
    </Container>
  );
}
