import type { Metadata } from "next";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { CostViz } from "@/components/viz/CostViz";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "cost";
const topic = findTopic(slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "インデックスはどれくらいまで貼っていい？",
    a: "「よく使うクエリのパターン数」+ 主キー・ユニーク制約分が目安。1テーブルに10個以上あるならほとんどのケースで貼りすぎです。使われていないインデックスは定期的に棚卸ししましょう。",
  },
  {
    q: "使われていないインデックスを見つけるには？",
    a: "多くのRDBMSがインデックスの使用回数を記録する統計ビューを提供しており、それを使うと「一度も使われていないインデックス」を洗い出せます。棚卸しの起点として有効です。",
  },
  {
    q: "書き込み負荷が高いテーブルで気をつけることは？",
    a: "読み取り優位のテーブルよりインデックスを絞る。特にログ・時系列・大量INSERTが想定されるテーブルでは、必要最小限に留めるのが定石。",
  },
];

export default function Page() {
  return (
    <TopicLayout slug={slug}>
      <TopicJsonLd slug={slug} faq={faq} />

      <h2>インデックスはタダではない</h2>
      <p>
        インデックスは検索を速くしますが、その裏で以下のコストが発生します。
      </p>
      <ul>
        <li>
          <strong>ストレージ</strong>: 数百MB〜数GB規模になることも
        </li>
        <li>
          <strong>書き込みオーバーヘッド</strong>: INSERT/UPDATE/DELETE時にインデックス側も更新
        </li>
        <li>
          <strong>統計情報の維持コスト</strong>
        </li>
        <li>
          <strong>オプティマイザの検討コスト</strong>: 候補が増えるほどプランニング時間も伸びる
        </li>
      </ul>

      <CostViz />

      <h2>物理コストは「ページ読み書き回数」で決まる</h2>
      <p>
        インデックスの検索が速い/更新が遅いという議論は、実際には
        <a href="/basics/data-structure">ページI/O</a>
        の回数で決まっています。目安は以下。
      </p>
      <ul>
        <li>
          <strong>連続（シーケンシャル）ページ読み取り</strong>: 1枚あたり数十マイクロ秒〜
        </li>
        <li>
          <strong>ランダムページ読み取り</strong>: 1枚あたり数ミリ秒〜（連続の数十〜数百倍遅い）
        </li>
        <li>
          <strong>ページ書き込み</strong>: WAL / redo log などが絡み、更に重い
        </li>
      </ul>
      <p>
        INSERT 1件でも、対象テーブルのページ1枚 + インデックス n 枚分の葉ノードページ n 枚 = 合計 n+1 ページの書き込みが発生します。インデックスを増やすほど 1行の書き込みコストがリニアに増えるのはこれが理由。
      </p>

      <h2>「貼りすぎ」を防ぐ方針</h2>
      <ul>
        <li>まずEXPLAINで実際に使われているか確認</li>
        <li>重複しているインデックスを統合（例: <code>(A)</code> と <code>(A, B)</code> なら前者は不要になることが多い）</li>
        <li>UPDATE/INSERT が多いカラムに大量のインデックスを貼らない</li>
        <li>定期的に「1年以上使われていないインデックス」を洗い出して削除候補にする</li>
      </ul>

      <h2>まとめ</h2>
      <p>
        インデックス設計は「速くする」だけでなく「トレードオフを設計する」作業。
        検索頻度・書き込み頻度・データサイズ・ビジネス要件を見て、必要最小限に絞りましょう。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
