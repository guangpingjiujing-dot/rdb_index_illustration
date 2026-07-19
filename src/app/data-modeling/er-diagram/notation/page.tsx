import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { NotationCompare } from "@/components/viz/er/NotationCompare";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";
import { findTopic } from "@/content/topics";

const slug = "notation";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "3 記法を混ぜて使ってもよいですか？",
    a: "同じ図の中では混ぜない。読者が同じ記号を違う意味で誤読する原因になる。プロジェクトごとに 1 記法を選び、そのプロジェクトの ER 図はすべて統一する。プロジェクトを横断するときは記法を明示するのが望ましい。",
  },
  {
    q: "Chen 記法は今も使われますか？",
    a: "実務ではほぼ絶滅、学術文献では現役。データベース理論の教科書や論文で「関連は菱形、属性は楕円」の図を見たら Chen 記法を思い出すために本ページを参照するのがよい。",
  },
];

const NOTATION_ROWS: Array<{
  element: string;
  ie: string;
  idef1x: string;
  chen: string;
}> = [
  { element: "エンティティ", ie: "四角", idef1x: "角丸四角", chen: "四角" },
  {
    element: "弱エンティティ",
    ie: "二重四角",
    idef1x: "実線識別関係で判別",
    chen: "二重四角",
  },
  { element: "関連", ie: "線", idef1x: "線", chen: "菱形" },
  {
    element: "1 (必須、max=min=1)",
    ie: "縦棒 |",
    idef1x: "親端: 無印 (default)",
    chen: "1",
  },
  {
    element: "0..1 (任意、max=1, min=0)",
    ie: "| ○",
    idef1x: "子端: ● + Z",
    chen: "0,1",
  },
  {
    element: "0..N (任意 + 多、min=0)",
    ie: "○ 鳥足",
    idef1x: "子端: ● 単独 (子端の default)",
    chen: "0,N",
  },
  {
    element: "1..N (必須 + 多、min=1)",
    ie: "| 鳥足",
    idef1x: "子端: ● + P",
    chen: "1,N",
  },
  {
    element: "識別関係",
    ie: "主キー継承で判別",
    idef1x: "実線",
    chen: "二重線",
  },
  {
    element: "非識別関係",
    ie: "主キー独立で判別",
    idef1x: "破線",
    chen: "単線",
  },
  {
    element: "属性",
    ie: "エンティティ内に列挙",
    idef1x: "エンティティ内に列挙",
    chen: "楕円で外に描く",
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
      {/* デスクトップ: 通常の 4 列 table */}
      <div className="not-prose my-6 hidden md:block">
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
            {NOTATION_ROWS.map((row, i) => {
              const isLast = i === NOTATION_ROWS.length - 1;
              const cellCls = isLast
                ? "px-3 py-2"
                : "border-b border-[var(--border)] px-3 py-2";
              return (
                <tr key={row.element}>
                  <td className={cellCls}>{row.element}</td>
                  <td className={cellCls}>{row.ie}</td>
                  <td className={cellCls}>{row.idef1x}</td>
                  <td className={cellCls}>{row.chen}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* モバイル: 各要素を stacked card として縦に並べる */}
      <div className="not-prose my-6 md:hidden space-y-3">
        {NOTATION_ROWS.map((row) => (
          <div
            key={row.element}
            className="border border-[var(--border-strong)] bg-[var(--card)] p-3"
          >
            <div className="text-sm font-bold mb-2">{row.element}</div>
            <dl className="space-y-1 text-xs font-mono">
              <div className="flex gap-2">
                <dt className="text-[var(--muted-foreground)] font-sans font-bold min-w-[5em]">
                  IE
                </dt>
                <dd>{row.ie}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[var(--muted-foreground)] font-sans font-bold min-w-[5em]">
                  IDEF1X
                </dt>
                <dd>{row.idef1x}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[var(--muted-foreground)] font-sans font-bold min-w-[5em]">
                  Chen
                </dt>
                <dd>{row.chen}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <p className="text-sm text-[var(--muted-foreground)]">
        <strong>IDEF1X の記号は親端と子端で非対称</strong>。子端 (many 側) には
        {" "}<strong>● (solid dot)</strong> が常に置かれ、必要に応じて
        {" "}<strong>P (1..N)</strong> / <strong>Z (0..1)</strong> / 数字 (exactly N) の文字を付記する
        (原典: FIPS PUB 184)。親端は既定で「必ず 1」を意味するため通常は無印。
        本サイト内の変なER図の #6 対比図では、視覚差を強調する目的で ● / ○ / P / M を
        混在させた簡易表現を採用しており、厳密な IDEF1X ではない (ツール Erwin / ER/Studio 等では
        本節の表の記号が標準)。
      </p>

      <h2>変なER図 との対応: 違和感 #6 記法混在</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([6])} />
      </div>

      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> では、
        ほとんどの関連が IE 記法 (鳥足と縦棒) で描かれているのに、
        <strong>「レビュー —対象— 商品」の関連だけ IDEF1X 記法 (● / P)</strong> で描かれている。
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
