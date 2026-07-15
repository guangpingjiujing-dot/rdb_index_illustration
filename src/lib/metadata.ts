import type { Metadata } from "next";
import type { Topic } from "@/content/topics";

/**
 * トピックページ用の Metadata を組み立てる。
 *
 * - title / description は metaTitle ?? shortTitle / metaDescription ?? summary
 * - OG title / description は title / description と同じ値をページ固有として明示上書き
 *   （root layout の openGraph はサイト共通値なので、上書きしないと全ページで同じ OG カードが出てしまう）
 * - twitter title / description も同様に上書き
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
      title,
      description,
    },
  };
}
