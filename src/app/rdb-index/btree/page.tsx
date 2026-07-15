import { buildTopicMetadata } from "@/lib/metadata";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { BTreeViz } from "@/components/viz/btree/BTreeViz";
import { IndexToRowFlow } from "@/components/viz/IndexToRowFlow";
import { FAQ } from "@/components/layout/FAQ";
import { AmazonLink } from "@/components/cta/AmazonLink";
import { findTopic } from "@/content/topics";

const slug = "btree";
const topic = findTopic("rdb-index", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "なぜB-treeはこんなに速いのですか？",
    a: "1つのノードから複数の子ノードに分岐するので、木の高さがデータ件数の対数（O(log N)）にしかならないためです。1億件でも数段の辿りで済みます。",
  },
  {
    q: "B-treeとB+treeの違いは？",
    a: "B+treeは葉ノードにだけ実データ（へのポインタ）を持ち、葉同士がリンクリストで繋がっている点が特徴です。範囲検索が高速化されるため、実際のRDBMSの多くはB+treeを採用しています。",
  },
  {
    q: "B-treeインデックスが効かないクエリは？",
    a: "先頭ワイルドカードのLIKE検索（例: LIKE '%abc'）、関数を通した比較（WHERE UPPER(name) = ...）、暗黙の型変換を伴う比較などです。これらではソート順に沿った探索ができません。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="rdb-index" slug={slug}>
      <TopicJsonLd section="rdb-index" slug={slug} faq={faq} />

      <p className="!mt-0 !mb-6 text-xs text-[var(--muted-foreground)]">
        本記事はAmazonアソシエイトのリンクを含みます。
      </p>

      <h2>B-treeは「ソートされた分岐する索引」</h2>
      <p>
        B-treeは、キーをソート順に保持しながら1つのノードから複数の子に分岐する木構造です。
        ルートから葉に向けて辿っていくだけで、目的の値に対数時間で到達できます。
        以下のインタラクティブ図解で、実際に探索の動きを見てみましょう。
      </p>

      <BTreeViz />

      <h2>探索の手順</h2>
      <ol>
        <li>ルートノードのキーと目的の値を比較する</li>
        <li>目的の値がキーに一致すれば発見。そうでなければ、どの子に降りるか（値の範囲）を判断する</li>
        <li>子ノードに降りて1〜2を繰り返す</li>
        <li>葉ノードまで来ても見つからなければ「該当なし」</li>
      </ol>

      <h2>ノードあたりのキー数と木の高さ</h2>
      <p>
        本記事の図解はデフォルトでノードあたり最大3キーに設定していますが（上のコントロールで変更可能）、実際のRDBMSではノードあたり数百〜数千キーが入ります。
        そのため、10億件のデータでも木の高さはわずか3〜4段程度で済み、ディスクI/Oが極めて少ない探索が可能です。
      </p>
      <p>
        実務で B-tree インデックスをどう設計するか（カラム順・カーディナリティ・更新コストなど）は、
        <AmazonLink
          href="https://www.amazon.co.jp/dp/4798186627?tag=taitech-22"
          bookId="tatsujin-db-design"
          location="inline"
          topic={slug}
        >
          『達人に学ぶDB設計徹底指南書 第2版』
        </AmazonLink>
        第6章 6-3「B-treeインデックスの設計方針」に体系的にまとまっています。
      </p>

      <h2>挿入とノード分割</h2>
      <p>
        「挿入モード」に切り替えて値を追加してみてください。ノードのキー数が上限を超えると、中央値を親に押し上げて分割する動きが見られます。
        こうして木の高さは最小限に保たれ、常にバランスした状態が維持されます。
      </p>

      <h2>葉ノードにあるのは「キー + 行ID」</h2>
      <p>
        B-treeの葉ノードには、検索キーそのものだけでなく、
        <strong>そのキーが指す実データがどのページにあるか</strong>を示す
        <a href="/rdb-index/basics/data-structure">行ID</a>
        が入っています。
        つまり検索の流れは「B-treeを数段辿る」→「行IDを取得」→「そのページを1回読む」の3ステップ。
      </p>

      <IndexToRowFlow variant="btree" />

      <p>
        なぜ「対数時間」で1件を取り出せるか、これで物理的に見えてきます。
        B-treeを辿るのに数ページ、そこから行IDを得てテーブル本体を1ページ読む。
        合計でも数回のページ読み取りで済むため、1000万件でも数ミリ秒で1件が引ける。
      </p>

      <h2>B-treeが向いていない検索</h2>
      <ul>
        <li>先頭ワイルドカード（<code>LIKE &#39;%foo&#39;</code>）</li>
        <li>関数変換を経た比較（<code>WHERE LOWER(name) = ...</code>）</li>
        <li>暗黙の型変換を伴う比較</li>
      </ul>
      <p>いずれも「ソート順が使えなくなる」ため、B-treeを辿ることができずフルスキャンに落ちます。</p>
      <p>
        「効かないケースを知らずに闇雲にインデックスを追加して、逆に更新が遅くなる」失敗例は、
        <AmazonLink
          href="https://www.amazon.co.jp/dp/4814400748?tag=taitech-22"
          bookId="sql-antipatterns"
          location="inline"
          topic={slug}
        >
          『SQLアンチパターン 第2版』
        </AmazonLink>
        第13章「インデックスショットガン（闇雲インデックス）」で詳しく扱われています。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
