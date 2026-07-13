import type { Metadata } from "next";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { KeyHierarchyDiagram } from "@/components/viz/datamodel/KeyHierarchyDiagram";
import { findTopic } from "@/content/topics";

const slug = "keys";
const topic = findTopic("data-modeling", slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "候補キーとスーパーキーの違いは？",
    a: "スーパーキーは行を一意に特定できる属性集合の総称、候補キーはそのうち「極小」なもの (一つでも属性を減らすと一意性が失われる) です。",
  },
  {
    q: "主キーはどうやって決めるべき？",
    a: "候補キーの中から、値が変わらない・NULLにならない・短くて扱いやすいものを選びます。業務キーが不安定な場合は代理キー (サロゲートキー) を導入します。",
  },
  {
    q: "複合キーは避けるべき？",
    a: "避けるべきではありません。関連テーブル (中間テーブル) では複合キーが本質的に必要です。ただし外部キーで参照される主キーは代理キーにすることが多いです。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>キーの階層</h2>
      <p>
        リレーショナルデータベースで「行を一意に特定する属性集合」は 1 通りではない。
        性質の強さの順に <strong>スーパーキー ⊃ 候補キー ⊃ 主キー</strong> という階層で整理される。
      </p>

      <KeyHierarchyDiagram />

      <h2>複合キーと外部キー</h2>
      <p>
        候補キーが 2 つ以上の属性の組で成立するとき、これを <strong>複合キー</strong> (composite key) と呼ぶ。
        代表例は関連テーブル (多対多を解決する中間テーブル) で、
        <code>(注文ID, 商品ID)</code> のような 2 属性の組が主キーになる。
      </p>
      <p>
        他のテーブルの主キーを参照するために持つ属性 (または属性の組) を <strong>外部キー</strong> (foreign key) と呼ぶ。
        外部キーは正規化そのものの要件ではないが、テーブルを分割した結果として自然に生まれる参照関係を保つ役割を持つ。
      </p>

      <h2>「非キー属性」という用語</h2>
      <p>
        以降の <Link href="/data-modeling/normalization/2nf">第2正規形</Link>・
        <Link href="/data-modeling/normalization/3nf">第3正規形</Link>
        の議論では <strong>非キー属性</strong> (non-key attribute) という言い方が頻出する。
        これは <strong>どの候補キーにも含まれない属性</strong> のことを指す。
      </p>
      <p>
        たとえば従業員テーブル <code>(社員ID, 氏名, 部署ID, 部署名)</code> の候補キーが <code>{"{"}社員ID{"}"}</code> だけなら、
        氏名・部署ID・部署名の 3 つがすべて非キー属性になる。
        正規化では「非キー属性がどう関数従属しているか」を分析することで、正規形の判定を行う。
      </p>

      <h2>主キーの選び方 (実務のガイドライン)</h2>
      <ul>
        <li>
          <strong>不変であること</strong>: 主キーの値は将来にわたって変わらない属性が望ましい。
          変更されると外部キー側との整合を全て取り直す必要が生じる。
        </li>
        <li>
          <strong>NULL にならないこと</strong>: 一意性を保証できない NULL は主キーに含められない。
        </li>
        <li>
          <strong>短く扱いやすいこと</strong>: 長い文字列や複合キーは、他のテーブルからの参照コストを上げる。
        </li>
        <li>
          <strong>業務キーが不安定なら代理キー</strong>: 上記を満たす業務属性が無い場合、
          サロゲートキー (連番 ID など、業務的意味を持たない代理主キー) を導入する。
        </li>
      </ul>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
