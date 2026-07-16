import type { Metadata } from "next";
import type { Topic } from "@/content/topics";

/**
 * トピックページ用の Metadata を組み立てる。
 *
 * - title / description は metaTitle ?? shortTitle / metaDescription ?? summary
 * - OG title / description は title / description と同じ値をページ固有として明示上書き
 *   （root layout の openGraph はサイト共通値なので、上書きしないと全ページで同じ OG カードが出てしまう）
 * - twitter title / description / card も同様に上書き。
 *   card を再指定しないと、root layout の `summary_large_image` が上書きで消えて `summary`
 *   にフォールバックし、X 上で小さい画像なしカードになる。
 * - og:image / twitter:image はトピック配下の opengraph-image.tsx (file convention) が
 *   自動で提供する。
 */
export function buildTopicMetadata(topic: Topic): Metadata {
  const title = topic.metaTitle ?? topic.shortTitle;
  const description = topic.metaDescription ?? topic.summary;

  return {
    title,
    description,
    alternates: { canonical: topic.path },
    openGraph: {
      title,
      description,
      url: topic.path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
