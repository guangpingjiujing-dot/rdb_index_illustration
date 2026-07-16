import { ImageResponse } from "next/og";
import { sections } from "@/content/sections";
import { site } from "@/lib/site";
import type { Topic } from "@/content/topics";

export const topicOGSize = { width: 1200, height: 630 };
export const topicOGContentType = "image/png" as const;

/**
 * トピックページ用の OG 画像を生成する。
 *
 * Next.js の opengraph-image.tsx ファイル規約はセグメント単位で機能し、
 * 親セグメントの opengraph-image.tsx は子ルートに継承されない。
 * そのため各トピック配下 (例: /data-modeling/normalization/why) に
 * このヘルパーを呼び出す opengraph-image.tsx を配置する必要がある。
 */
export function renderTopicOGImage(topic: Topic) {
  const section = sections[topic.section];
  const keywordLine = topic.keywords.slice(0, 5).join(" / ");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 88px",
          background: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#6b6b68",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {section.label}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.25,
            color: "#0a0a0a",
            display: "flex",
          }}
        >
          {topic.title}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 24,
            color: "#6b6b68",
            display: "flex",
            borderTop: "1px solid #d9d9d5",
            paddingTop: 24,
          }}
        >
          {keywordLine}
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 20,
            color: "#6b6b68",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          by {site.author.name}（{site.author.role}）· taitech.dev
        </div>
      </div>
    ),
    { ...topicOGSize },
  );
}