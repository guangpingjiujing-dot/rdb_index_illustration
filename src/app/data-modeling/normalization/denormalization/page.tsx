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

      <h2>非正規化を選ぶ理由</h2>
      <p>
        <Link href="/data-modeling/normalization/3nf">第3正規形</Link> まで進めると、
        マスタが独立したテーブルに分かれ、更新時異常が構造的に排除されるという恩恵が得られる。
        一方で、参照時には <strong>JOIN のコスト</strong> と <strong>実行計画の複雑化</strong> という代償を払う。
      </p>
      <p>
        非正規化は「JOIN コストが実運用上のボトルネックになる、かつ更新時異常のリスクを別の仕組みで吸収できる」
        場合に、意図的に正規形を崩して読み取り効率を得る設計手法。
        主な理由は次の 3 つ:
      </p>
      <ul>
        <li>
          <strong>JOIN 回数の削減</strong>: 3〜5 テーブル JOIN が高頻度で発生する参照パスがある時、
          関連属性を親テーブルに持たせて JOIN を減らす。
        </li>
        <li>
          <strong>参照 &gt;&gt; 更新のワークロード</strong>: 記事の閲覧数のように「ほとんど読まれ、たまに書かれる」
          データでは、読み取りの単純さを優先する。
        </li>
        <li>
          <strong>集計値のキャッシュ</strong>: リアルタイムに集計 (COUNT, SUM) を行うコストが高い時、
          事前集計した結果をテーブルに持たせる。
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

      <h2>非正規化とインデックス側の解決の棲み分け</h2>
      <p>
        「参照が遅い」時にまず検討すべきは、テーブル構造を変える非正規化ではなく、
        インデックス側での解決だ。特に <Link href="/rdb-index/covering">カバリングインデックス</Link>
        は、テーブル本体を読まずにインデックスだけでクエリを完結させる仕組みで、
        テーブル構造は正規化したまま参照性能を上げられる。
      </p>
      <ul>
        <li>
          <strong>カバリングインデックス</strong>: SELECT する列を全てインデックスに含めて index-only scan に持ち込む。
          単一テーブルの検索なら大抵はこれで足りる。
        </li>
        <li>
          <strong>複合インデックス</strong>: JOIN 側の外部キーに <Link href="/rdb-index/composite">複合インデックス</Link>
          を貼るだけで JOIN のコストが劇的に下がることも多い。
        </li>
        <li>
          <strong>クラスタ化インデックス</strong>: 主キー順の物理配置 (<Link href="/rdb-index/clustered">クラスタ化</Link>)
          で、レンジ検索の I/O を最小化する。
        </li>
      </ul>
      <p>
        これらの手段を試しきった上でなお足りない、かつ更新の頻度・整合維持のコストを含めて総合的に得だと判断できる時に、
        初めてテーブル構造の非正規化を検討する順序が安全。
      </p>

      <h2>マテリアライズドビュー / サマリテーブル</h2>
      <p>
        テーブル本体は正規化したまま、参照用の別実体だけを冗長化する選択肢もある。
      </p>
      <ul>
        <li>
          <strong>マテリアライズドビュー</strong>: JOIN や集計の結果を実体化 (キャッシュ) したもの。
          リフレッシュポリシー (即時 / 定期) を選べる。DBMS の機能として整合を保つ仕組みが付いてくる場合が多い。
        </li>
        <li>
          <strong>サマリテーブル</strong>: 明示的に「集計結果を格納するテーブル」を作り、
          バッチや ETL で定期更新する。分析用途で多用される。
        </li>
      </ul>
      <p>
        これらは「読み取り用の冗長」を <strong>本体テーブルから物理的に分離</strong> できるため、
        本体側の正規化を保ちながら参照性能を得られる中間解として有用。
      </p>

      <h2>意思決定チェックリスト</h2>
      <ol>
        <li>まず 3NF まで正規化する</li>
        <li>実際の参照パスで <code>EXPLAIN</code> を取り、どこが遅いかを特定する</li>
        <li>
          インデックス側で解決できないか検討する
          (<Link href="/rdb-index/covering">カバリング</Link> / <Link href="/rdb-index/composite">複合</Link>)
        </li>
        <li>マテリアライズドビュー / サマリテーブルで解決できないか検討する</li>
        <li>それでも足りない場合に、限定した箇所で非正規化 (冗長カラム追加) を検討する</li>
        <li>非正規化を採用したら、整合を保つ仕組み (トリガー / アプリ側ロジック / バッチ検証) を必ずセットで用意する</li>
      </ol>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
