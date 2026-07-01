import type { Metadata } from "next";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FullScanViz } from "@/components/viz/FullScanViz";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "why-index";
const topic = findTopic(slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "フルスキャンとインデックスは何が違いますか？",
    a: "フルスキャンはテーブルの先頭から最後まで全行を順に読む方式で、件数に比例して遅くなります。インデックスはあらかじめキー順に並んだ小さな構造で、目的の位置を対数時間で特定できます。",
  },
  {
    q: "インデックスを貼れば必ず速くなりますか？",
    a: "いいえ。テーブルの多くの行に該当するようなクエリではインデックスを使ってもテーブルアクセスの繰り返しが発生し、フルスキャンの方が速い場合があります。オプティマイザは統計情報を見てどちらが有利かを判断します。",
  },
];

export default function Page() {
  return (
    <TopicLayout slug={slug}>
      <TopicJsonLd slug={slug} faq={faq} />
      <h2>そもそも「探す」というのはコンピュータにとって重い処理</h2>
      <p>
        テーブルに1万件、100万件、1億件のデータがあるとき、条件に合う行を見つけるのに何が起きるのかを考えたことはありますか？
        インデックスを貼っていない場合、DBは<strong>先頭から1行ずつ順に全部読む</strong>という素朴な方法を取ります。
        これがフルテーブルスキャン（あるいはシーケンシャルスキャン）です。
      </p>

      <FullScanViz />

      <h2>件数が増えると線形に遅くなる</h2>
      <p>
        フルスキャンの計算量は
        <code>O(N)</code>
        （データ件数に比例）です。100万件で我慢できても、1億件になると単純計算で100倍遅くなります。
        インデックスはこの問題を「対数時間」<code>O(log N)</code> に近い形に置き換える仕組みです。
      </p>

      <h2>次に読むとよいトピック</h2>
      <ul>
        <li>
          <a href="/basics/data-structure">ページと行ID</a> — フルスキャンで「1行ずつ読む」の実態は「ページ単位で読む」こと。物理的な仕組みを一段深く理解する。
        </li>
        <li>
          <a href="/btree">B-treeインデックス</a> — 最も使われる索引構造。フルスキャンとの差を体感できる。
        </li>
        <li>
          <a href="/hash">ハッシュインデックス</a> — 等価検索なら究極に速い方式。
        </li>
      </ul>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
