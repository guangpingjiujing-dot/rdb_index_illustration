import type { Metadata } from "next";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { PartialViz } from "@/components/viz/PartialViz";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "partial";
const topic = findTopic(slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "部分インデックスは全てのRDBMSで使える？",
    a: "多くの主要RDBMSがネイティブでサポートしますが、対応していないRDBMSもあります。その場合は生成カラムなど別の仕組みで擬似的に実現するのが一般的です。使いたい場合はまず対象RDBMSの仕様を確認してください。",
  },
  {
    q: "どんなときに部分インデックスが有効？",
    a: "「特定の状態の行だけをよく引く」「NULLでない値だけをユニークにしたい」「大量の履歴データの中でアクティブな一部だけをよく検索する」など、対象が全体の一部に偏っているケース。",
  },
];

export default function Page() {
  return (
    <TopicLayout slug={slug}>
      <TopicJsonLd slug={slug} faq={faq} />

      <h2>「必要なところだけ」の小さいインデックス</h2>
      <p>
        部分インデックスは、WHERE句のような条件を付けて「該当する行だけ」をインデックスに含めます。
        全体のごく一部にしかクエリが刺さらない場合、インデックスをフルサイズで作るのは無駄。
        部分インデックスならサイズも更新コストも大幅に減らせます。
      </p>

      <PartialViz />

      <h2>典型的なユースケース</h2>
      <ul>
        <li>
          <strong>論理削除された行を除外</strong>（最頻）:{" "}
          <code>(email) WHERE deleted_at IS NULL</code> のように、ソフトデリートを採用したテーブルで「アクティブ行だけ」のインデックスを作る
        </li>
        <li>
          <strong>特定ステータスの行だけの検索</strong>:{" "}
          <code>(order_id) WHERE status = &#39;pending&#39;</code> のように、頻繁に引く一部の状態だけをインデックス化
        </li>
        <li>
          <strong>NULLでない値だけのユニーク</strong>:{" "}
          <code>UNIQUE (email) WHERE email IS NOT NULL</code> のように、NULLは許容しつつ入力された値だけ一意にしたいとき
        </li>
      </ul>

      <h2>注意点</h2>
      <ul>
        <li>クエリの条件と部分インデックスの条件が一致する必要がある。少しでも違うと使われない</li>
        <li>統計情報の見え方も変わるので、EXPLAINで実際に使われているか確認する</li>
      </ul>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
