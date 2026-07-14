import type { Metadata } from "next";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { TableBeforeAfter } from "@/components/viz/datamodel/TableBeforeAfter";
import { findTopic } from "@/content/topics";

const slug = "denormalization";
const topic = findTopic("data-modeling", slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "非正規化はいつやるべきですか？",
    a: "読み取りの頻度と結合コストが更新頻度を大きく上回り、かつ更新時異常を運用や制約で吸収できる見込みがある時です。まず正規化した上で計測してから判断します。",
  },
  {
    q: "非正規化とカバリングインデックスの違いは？",
    a: "非正規化はテーブル構造自体を冗長化する設計変更、カバリングインデックスはテーブル本体はそのままに参照高速化のためインデックスに列を含める手法です。多くのケースでインデックス側で解決できます。",
  },
  {
    q: "正規化しすぎるとどうなる？",
    a: "参照時に多くの JOIN が必要になり、実行計画が複雑化してオプティマイザが失敗しやすくなります。ただしまず正規化してから必要な部分だけ崩す方が安全です。",
  },
  {
    q: "マテリアライズドビューは非正規化ですか？",
    a: "広義には非正規化の一種と言えます。ただしテーブル本体は正規化したまま、参照用の別実体を持つため、更新時異常のリスクを局所化できる利点があります。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>正規化した後にわざと崩す?</h2>
      <p>
        <Link href="/data-modeling/normalization/3nf">第3正規形</Link> まで進めれば、
        マスタが独立したテーブルに分かれて更新時異常が消える。
        その代わり、データを取り出すときには複数のテーブルを結合 (JOIN) する必要がある。
        テーブルが増えるほど JOIN も増える。
      </p>
      <p>
        <strong>非正規化</strong> は、この JOIN のコストが実運用で問題になった時に、
        あえて「正規化した状態を一部だけ崩す」設計手法。
        「わざと同じ情報を複数の場所に書く」ことで JOIN を減らし、読み取りを速くする。
        代わりに更新時異常のリスクは戻ってくるので、それを別の仕組み (トリガー / アプリ側ロジック) で防ぐ責任も負う。
      </p>
      <p>
        非正規化を選ぶ動機は主にこの 3 つ:
      </p>
      <ul>
        <li>
          <strong>JOIN 回数を減らしたい</strong>: 一つの参照でいくつものテーブルを JOIN する必要がある画面で、
          関連情報を親テーブルにコピーしておいて JOIN を減らす。
        </li>
        <li>
          <strong>読み取りが圧倒的に多い</strong>: 記事の閲覧数のように「読まれるのが多くて、書き換えは少ない」データでは、
          読み取り時のシンプルさを優先する。
        </li>
        <li>
          <strong>集計値の再計算が重い</strong>: リアルタイムに <code>COUNT</code> や <code>SUM</code> を毎回計算するコストが高いなら、
          事前に集計した数字を保存しておく。
        </li>
      </ul>

      <h2>典型例: 記事とコメント数</h2>

      <TableBeforeAfter
        title="3NF → 非正規化 (集計値の埋め込み)"
        before={{
          name: "記事",
          columns: ["記事ID", "タイトル", "投稿日"],
          rows: [
            ["A001", "SQL入門", "2026-06-01"],
            ["A002", "インデックス設計", "2026-06-15"],
          ],
          primaryKey: ["記事ID"],
        }}
        after={[
          {
            name: "記事 (非正規化)",
            columns: ["記事ID", "タイトル", "投稿日", "コメント数"],
            rows: [
              ["A001", "SQL入門", "2026-06-01", "23"],
              ["A002", "インデックス設計", "2026-06-15", "45"],
            ],
            primaryKey: ["記事ID"],
            highlightColumns: ["コメント数"],
          },
        ]}
        legend={
          <>
            「コメント数」は本来 <code>コメント</code> テーブルから <code>COUNT(*)</code> で毎回集計するのが正規化された姿。
            しかし記事一覧を大量表示する画面ではその集計が重荷になる。
            そこで <code>記事</code> テーブルに <strong>コメント数</strong> 列を持たせ、コメント追加/削除のたびに更新する。
          </>
        }
      />

      <p>
        この場合、更新時異常のリスクは「コメントを追加/削除した時に必ずコメント数を +1/-1 する」ことを
        アプリケーション層またはトリガーで保証することで吸収する。
      </p>

      <h2>「参照が遅い」時にまず試すのはインデックス</h2>
      <p>
        「参照が遅い」を解決する手段は非正規化だけではない。むしろ最初に試すのはインデックス側での対処で、
        テーブル構造を触らずに済むぶん影響範囲が小さくて安全。
      </p>
      <ul>
        <li>
          <strong><Link href="/rdb-index/covering">カバリングインデックス</Link></strong>:
          SELECT で欲しい列を全部インデックスに含めれば、テーブル本体を読まずに済む。単一テーブルの検索ならたいていこれで足りる。
        </li>
        <li>
          <strong><Link href="/rdb-index/composite">複合インデックス</Link></strong>:
          JOIN で使う外部キー列に複合インデックスを貼るだけで JOIN のコストが劇的に下がることも多い。
        </li>
        <li>
          <strong><Link href="/rdb-index/clustered">クラスタ化インデックス</Link></strong>:
          テーブルの物理配置を主キー順にすることで、レンジ検索の I/O を減らせる。
        </li>
      </ul>
      <p>
        これらを試した上でなお足りない、かつ更新側のコストも含めて総合的に得だと判断できる時に、
        初めてテーブル構造の非正規化に踏み込むのが安全な順序。
      </p>

      <h2>非正規化の中間解: 本体テーブルは正規化のまま、参照用の別テーブルを作る</h2>
      <p>
        「本体テーブルは正規化のまま維持しつつ、参照専用の別テーブルを冗長に持つ」というやり方もある。
        こちらは本体の更新時異常リスクを触らずに済むので、非正規化の中では比較的安全。
      </p>
      <ul>
        <li>
          <strong>マテリアライズドビュー</strong>: JOIN や集計の結果を実体としてキャッシュしたもの。
          即時更新か定期更新か、DBMS が用意する仕組みに乗って整合を保てる。
        </li>
        <li>
          <strong>サマリテーブル</strong>: 集計結果を専用のテーブルに保存し、バッチや ETL で定期的に更新する。
          分析用途で多用される。
        </li>
      </ul>

      <h2>非正規化するかどうかの判断手順</h2>
      <ol>
        <li>まずは <strong>3NF まで正規化</strong> する (これが基本形)</li>
        <li>実際の参照パスで <code>EXPLAIN</code> を取って、本当にどこが遅いのかを特定する</li>
        <li>
          <strong>インデックス側で解決</strong> できないか検討する
          (<Link href="/rdb-index/covering">カバリング</Link> / <Link href="/rdb-index/composite">複合</Link>)
        </li>
        <li>マテリアライズドビュー / サマリテーブルで解決できないか検討する</li>
        <li>それでも足りない場合に、限定した箇所で非正規化 (列の冗長化) を検討する</li>
        <li>非正規化するなら、整合を保つ仕組み (トリガー / アプリ側ロジック / バッチ検証) を必ずセットで用意する</li>
      </ol>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
