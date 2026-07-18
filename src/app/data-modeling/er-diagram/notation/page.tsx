import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { NotationCompare } from "@/components/viz/er/NotationCompare";
import { findTopic } from "@/content/topics";

const slug = "notation";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "実務ではどの記法を選ぶべきですか？",
    a: "新規プロジェクトなら IE 記法 (crow's foot) が既定推奨。dbdiagram / DrawSQL / Draw.io / Miro / Lucidchart など主要ツールの既定。既存の官公庁ドキュメントを読む必要があれば IDEF1X、大学の講義資料や論文なら Chen も読めるようにしておく。",
  },
  {
    q: "3 記法を混ぜて使ってもよいですか？",
    a: "同じ図の中では混ぜない。読者が同じ記号を違う意味で誤読する原因になる。プロジェクトごとに 1 記法を選び、そのプロジェクトの ER 図はすべて統一する。プロジェクトを横断するときは記法を明示するのが望ましい。",
  },
  {
    q: "Chen 記法は今も使われますか？",
    a: "実務ではほぼ絶滅、学術文献では現役。データベース理論の教科書や論文で「関連は菱形、属性は楕円」の図を見たら Chen 記法を思い出すために本ページを参照するのがよい。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 同じ内容を 3 つの言語で書き分けるようなもの</h2>
      <p>
        ER 図の記法は 3 種類 (IE / IDEF1X / Chen) が代表的で、
        <strong>「同じ ER モデルを違う視覚言語で書き分ける」</strong> と考えるのが分かりやすい。
        内容 (エンティティ / 関連 / カーディナリティ / 参加制約) は共通で、記号が違うだけ。
      </p>

      <h2>3 記法で同じ ER 図を描き分ける</h2>
      <p>
        同じ「顧客 / 注文 / 注文明細」の ER モデルを、3 記法でそれぞれ描いてみる。
        並べて見比べることで、記号の対応が視覚的に理解できる。
      </p>

      <NotationCompare />

      <h2>記号の対応表</h2>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="min-w-full border border-[var(--border-strong)] text-sm">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="border-b border-[var(--border)] px-3 py-2 text-left font-bold">要素</th>
              <th className="border-b border-[var(--border)] px-3 py-2 text-left font-bold">IE (crow&apos;s foot)</th>
              <th className="border-b border-[var(--border)] px-3 py-2 text-left font-bold">IDEF1X</th>
              <th className="border-b border-[var(--border)] px-3 py-2 text-left font-bold">Chen</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">エンティティ</td>
              <td className="border-b border-[var(--border)] px-3 py-2">四角</td>
              <td className="border-b border-[var(--border)] px-3 py-2">角丸四角</td>
              <td className="border-b border-[var(--border)] px-3 py-2">四角</td>
            </tr>
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">弱エンティティ</td>
              <td className="border-b border-[var(--border)] px-3 py-2">二重四角</td>
              <td className="border-b border-[var(--border)] px-3 py-2">実線識別関係で判別</td>
              <td className="border-b border-[var(--border)] px-3 py-2">二重四角</td>
            </tr>
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">関連</td>
              <td className="border-b border-[var(--border)] px-3 py-2">線</td>
              <td className="border-b border-[var(--border)] px-3 py-2">線</td>
              <td className="border-b border-[var(--border)] px-3 py-2">菱形</td>
            </tr>
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">1 (必須)</td>
              <td className="border-b border-[var(--border)] px-3 py-2">縦棒 |</td>
              <td className="border-b border-[var(--border)] px-3 py-2">●</td>
              <td className="border-b border-[var(--border)] px-3 py-2">1</td>
            </tr>
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">0..1 (任意)</td>
              <td className="border-b border-[var(--border)] px-3 py-2">| ○</td>
              <td className="border-b border-[var(--border)] px-3 py-2">◯ Z</td>
              <td className="border-b border-[var(--border)] px-3 py-2">0,1</td>
            </tr>
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">N (多)</td>
              <td className="border-b border-[var(--border)] px-3 py-2">鳥足 &lt;</td>
              <td className="border-b border-[var(--border)] px-3 py-2">P</td>
              <td className="border-b border-[var(--border)] px-3 py-2">N</td>
            </tr>
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">識別関係</td>
              <td className="border-b border-[var(--border)] px-3 py-2">主キー継承で判別</td>
              <td className="border-b border-[var(--border)] px-3 py-2">実線</td>
              <td className="border-b border-[var(--border)] px-3 py-2">二重線</td>
            </tr>
            <tr>
              <td className="border-b border-[var(--border)] px-3 py-2">非識別関係</td>
              <td className="border-b border-[var(--border)] px-3 py-2">主キー独立で判別</td>
              <td className="border-b border-[var(--border)] px-3 py-2">破線</td>
              <td className="border-b border-[var(--border)] px-3 py-2">単線</td>
            </tr>
            <tr>
              <td className="px-3 py-2">属性</td>
              <td className="px-3 py-2">エンティティ内に列挙</td>
              <td className="px-3 py-2">エンティティ内に列挙</td>
              <td className="px-3 py-2">楕円で外に描く</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>実務でどれを選ぶか</h2>
      <ul>
        <li>
          <strong>新規プロジェクト / スタートアップ</strong> → <strong>IE 記法</strong>。
          dbdiagram / DrawSQL / Draw.io / Miro / Lucidchart の既定
        </li>
        <li>
          <strong>既存の官公庁 / 防衛 / 大規模基幹系ドキュメント</strong> → <strong>IDEF1X</strong>
        </li>
        <li>
          <strong>大学の講義資料 / 論文</strong> → <strong>Chen 記法</strong>
        </li>
      </ul>
      <p>
        本サイトは <strong>IE 記法</strong> を採用している。
        現代の作図ツールの既定であり、実務で目にする機会がもっとも多いから。
      </p>

      <h2>変なER図 との対応: 違和感 #9 記法混在</h2>
      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> では、
        ほとんどの関連が IE 記法 (鳥足と縦棒) で描かれているのに、
        <strong>「家賃履歴 —紐付く— 契約書」の関連だけ IDEF1X 記法 (● / P)</strong> で描かれている。
      </p>
      <p>
        図の中で記法を混在させると、読み手は同じ記号を違う意味で誤読する。
        1 枚の ER 図に登場する記法は 1 種類に統一するのが基本ルール。
        違う記法で書かれたドキュメントを比較したい場合は、注釈で「この図は IDEF1X 記法」と明示するのが望ましい。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
