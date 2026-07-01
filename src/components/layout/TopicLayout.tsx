import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LevelBadge } from "@/components/ui/Badge";
import { TopicNav } from "@/components/layout/TopicNav";
import { MentorCTA } from "@/components/cta/MentorCTA";
import { AffiliateBooks } from "@/components/cta/AffiliateBooks";
import { RelatedTopics } from "@/components/layout/RelatedTopics";
import { findTopic } from "@/content/topics";

export function TopicLayout({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const topic = findTopic(slug);
  if (!topic) throw new Error(`Topic not found: ${slug}`);

  return (
    <Container size="wide" className="py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <TopicNav currentSlug={slug} />
        </aside>

        <article>
          <nav
            aria-label="パンくず"
            className="mb-6 text-xs text-[var(--muted-foreground)]"
          >
            <Link href="/" className="hover:text-[var(--foreground)]">
              トップ
            </Link>
            <span className="mx-2">/</span>
            <span>{topic.shortTitle}</span>
          </nav>

          <div className="mb-4 flex items-center gap-3">
            <LevelBadge level={topic.level} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {topic.group === "prereq"
                ? "前提知識"
                : topic.group === "index-type"
                ? "インデックスの種類"
                : "関連トピック"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {topic.title}
          </h1>

          <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              定義
            </div>
            <p className="mt-1 text-[var(--foreground)] leading-relaxed">
              {topic.definition}
            </p>
          </div>

          <div className="prose-jp mt-10 max-w-none">{children}</div>

          <RelatedTopics currentSlug={slug} />

          <AffiliateBooks topicSlug={slug} />

          <MentorCTA />
        </article>
      </div>
    </Container>
  );
}
