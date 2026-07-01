import type { Metadata } from "next";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { ExplainViz } from "@/components/viz/ExplainViz";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "explain";
const topic = findTopic(slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "EXPLAINとEXPLAIN ANALYZEの違いは？",
    a: "EXPLAINは見積り（コスト・行数）だけを返しますが、EXPLAIN ANALYZEは実際にクエリを実行して実測時間・実測行数も表示します。本番でANALYZEを実行するとデータの更新も走るので注意（SELECTなら基本的に問題なし）。",
  },
  {
    q: "計画の中で見るべきポイントは？",
    a: "アクセス方法（Seq/Index/Hash）、コスト、推定行数と実行数の乖離、結合方法、行の増減が起きる場所。特に「推定と実測の乖離が大きい」場所は統計情報が古い or 相関を捉えられていない可能性が高い。",
  },
  {
    q: "全表スキャンが出たら必ずインデックスを貼るべき？",
    a: "件数が少ないテーブルや、対象行の割合が高いクエリでは全表スキャンの方が速いこともあります。EXPLAINは判断材料であって、コストと行数を見て総合判断します。",
  },
];

export default function Page() {
  return (
    <TopicLayout slug={slug}>
      <TopicJsonLd slug={slug} faq={faq} />

      <h2>EXPLAINは「オプティマイザの計画表」</h2>
      <p>
        EXPLAIN はクエリオプティマイザが選んだ実行計画を表示するコマンドです。
        「どのテーブルにどうアクセスして、どの順で結合して、どうソートするか」──これがツリー状に出力されます。
        パフォーマンスチューニングはEXPLAIN を読むところから始まります。
      </p>

      <ExplainViz />

      <h2>典型的なアクセス方法</h2>
      <ul>
        <li>
          <strong>Seq Scan / Full Table Scan</strong>: 全行を読む。件数が多いと重い
        </li>
        <li>
          <strong>Index Scan</strong>: インデックスを引いて該当行だけを取る
        </li>
        <li>
          <strong>Index Only Scan</strong>: インデックスだけで結果が完結（カバリング）
        </li>
        <li>
          <strong>Bitmap Index Scan</strong>: 複数条件のインデックスをビットマップで結合してからアクセス
        </li>
      </ul>

      <h2>読む順番</h2>
      <p>
        実行計画は基本的に<strong>ツリーの内側（葉）から外側（ルート）</strong>に向けて実行されます。
        インデントが深いほど先に実行されるので、末端のノードから追っていくと理解しやすいです。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
