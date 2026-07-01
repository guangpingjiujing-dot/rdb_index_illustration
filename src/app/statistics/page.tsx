import type { Metadata } from "next";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { StatisticsViz } from "@/components/viz/StatisticsViz";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "statistics";
const topic = findTopic(slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "統計情報はいつ更新される？",
    a: "多くのRDBMSは自動更新の仕組みを持っていますが、大量のバルクロードやデータ分布が急変した直後は手動で統計情報の更新コマンドを実行した方が安全です。",
  },
  {
    q: "カーディナリティとは？",
    a: "そのカラムに含まれる異なる値の数のこと。カーディナリティが高いほどインデックスが効きやすく、低い（例: is_deleted のような真偽値）と部分インデックスの方が有効なことが多い。",
  },
  {
    q: "ヒストグラムは何のため？",
    a: "値の分布を段階的に表現したもの。データが偏っている場合（例: 特定のstatusに9割集中）、単純な平均だけでは判断できないため、ヒストグラムを見て「どの値なら少ないか」を推定します。",
  },
];

export default function Page() {
  return (
    <TopicLayout slug={slug}>
      <TopicJsonLd slug={slug} faq={faq} />

      <h2>インデックスを使うかどうかは統計情報が決める</h2>
      <p>
        DBの中では「クエリオプティマイザ」がSQLを見て、複数の実行計画候補の中からコスト最小のものを選びます。
        このコスト見積りは統計情報（各カラムの値の分布、行数、NULL率など）に基づきます。
      </p>

      <StatisticsViz />

      <h2>インデックスを使わない判断もある</h2>
      <p>
        テーブルの多くの行が該当するクエリでは、インデックス経由でランダムアクセスを繰り返すよりもフルスキャンの方が速い。
        オプティマイザはこれを見積りコストで判断します。
        <strong>「インデックスを貼ったのに使われない」の原因</strong>のほとんどは、この見積りで「使わない方が速い」と判断されているか、統計情報が古くて誤った判断が下されているかのどちらかです。
      </p>

      <h2>統計情報が古いとどうなるか</h2>
      <ul>
        <li>大量INSERT直後: 実際にはインデックスが効かない量なのにインデックスを選んでしまう</li>
        <li>大量DELETE直後: インデックスが有効なのに、統計上「多くの行が該当する」と誤認して使わない</li>
        <li>データ分布の変化: 元は偏っていたstatusが均等になったのに古い分布で判断してしまう</li>
      </ul>
      <p>
        こうした場合は、統計情報を更新するコマンドを実行して最新の分布に合わせます（コマンド名はRDBMSごとに異なる）。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
