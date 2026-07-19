import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";
import { findTopic } from "@/content/topics";

const slug = "identifying";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "識別関係の子エンティティは必ず弱エンティティですか？",
    a: "実質的にほぼ同じ意味。「親のキーが子の主キーに継承される」= 弱エンティティの定義そのもの。教科書によっては「弱エンティティ = 識別関係で親と繋がるエンティティ」と定義していることも多い。",
  },
  {
    q: "顧客と注文は識別関係ですか、非識別関係ですか？",
    a: "非識別関係。注文は独自の注文IDだけで一意に識別できる (顧客IDは属性として持つが主キーではない)。顧客が消えても注文は履歴として残せる (実装上は SET NULL や履歴保持のルールを別途決める)。",
  },
  {
    q: "IE 記法では識別関係をどう見分けますか？",
    a: "IE 記法自体には識別関係専用の視覚記号は原則ない。判別は「子の主キーが親の主キーを含んでいるか」で行う。IDEF1X 記法だと実線 (識別) vs 破線 (非識別) の区別があるので視覚的にはっきり分かる。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 出席名簿の書き方</h2>
      <p>
        子供の名前を書いた出席名簿を想像する。同じ学年に「山田くん」が 2 人いたらどうする？
      </p>
      <ul>
        <li>
          <strong>選択肢 A</strong>: 「田中クラスの山田くん」「佐藤クラスの山田くん」と、
          <strong>クラス名を頭に付ける</strong>。クラスなしには山田くんが一意にならない
        </li>
        <li>
          <strong>選択肢 B</strong>: 「山田太郎 (学籍番号 20250001)」「山田次郎 (学籍番号 20250002)」と、
          <strong>子供側で独立の学籍番号を持つ</strong>。クラスの情報がなくても山田くんは一意
        </li>
      </ul>
      <p>
        A が <strong>識別関係 (identifying relationship)</strong>、B が <strong>非識別関係 (non-identifying relationship)</strong>。
        親のキーが子の識別に必須かどうかで区別する。
      </p>

      <h2>ER 図での違い</h2>
      <p>
        <strong>IE 記法 (crow&apos;s foot)</strong> では、線の見た目 (実線 or 破線) では識別関係を区別しない。
        代わりに <strong>子エンティティの主キーが親の主キーを含むか</strong> で判別する:
      </p>
      <ul>
        <li><strong>識別関係</strong>: 子の PK に親の PK が含まれる複合キー → 弱エンティティ</li>
        <li><strong>非識別関係</strong>: 子の PK は独立、親の PK は FK として属性欄に持つだけ</li>
      </ul>
      <p>
        <strong>IDEF1X</strong> では 実線 (識別) と 破線 (非識別) で視覚的に区別する。
        <strong>Chen 記法</strong> では 二重菱形 (識別) と 単菱形 (非識別)。
        記法比較の詳細は <Link href="/data-modeling/er-diagram/notation">記法比較ページ</Link>。
      </p>

      <ERDiagram
        title="識別関係 — 注文と注文明細 (IE 記法)"
        width={800}
        height={260}
        entities={[
          {
            id: "order",
            label: "注文",
            x: 60,
            y: 80,
            width: 220,
            attributes: ["注文ID", "注文日"],
            primaryKey: ["注文ID"],
          },
          {
            id: "line",
            label: "注文明細",
            x: 480,
            y: 80,
            width: 260,
            attributes: ["注文ID", "明細番号", "商品名"],
            primaryKey: ["注文ID", "明細番号"],
            isWeak: true,
          },
        ]}
        relationships={[
          {
            from: "order",
            to: "line",
            fromCardinality: "one",
            toCardinality: "one-many",
            isIdentifying: true,
          },
        ]}
        caption="注文明細の主キーは (注文ID, 明細番号) の複合キーで、親の 注文ID を含んでいる = 識別関係。IE 記法では見た目 (線の種類) では区別せず、この PK 構造で判別する。"
      />

      <ERDiagram
        title="非識別関係 — 顧客と注文 (IE 記法)"
        width={800}
        height={260}
        entities={[
          {
            id: "cust",
            label: "顧客",
            x: 60,
            y: 80,
            width: 220,
            attributes: ["顧客ID", "氏名"],
            primaryKey: ["顧客ID"],
          },
          {
            id: "ord",
            label: "注文",
            x: 480,
            y: 80,
            width: 260,
            attributes: ["注文ID", "顧客ID", "注文日"],
            primaryKey: ["注文ID"],
          },
        ]}
        relationships={[
          {
            from: "cust",
            to: "ord",
            fromCardinality: "one",
            toCardinality: "zero-many",
          },
        ]}
        caption="注文の主キーは 注文ID 単独で、顧客ID は FK として属性欄に持つだけ = 非識別関係。IE 記法では線の種類で区別しない (IDEF1X では破線で描く慣習)。"
      />

      <h2>判定チェックリスト</h2>
      <ul>
        <li>
          <strong>子の PK に親の PK が含まれるか</strong> — Yes なら識別、No なら非識別
        </li>
        <li>
          <strong>子は親なしに存在しうるか</strong> — 存在できないなら識別 (弱エンティティ)、
          存在できるなら非識別
        </li>
        <li>
          <strong>親を消したときの子の運命</strong> — 一緒に消える (CASCADE) 相性なら識別、
          残すのが自然なら非識別
        </li>
      </ul>

      <h2>変なER図 との対応: 違和感 #4 識別関係の PK 非継承</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([4])} />
      </div>

      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> の「注文明細」は、
        設計意図としては <strong>注文に従属する識別関係</strong> (親のPKを継承する関連) として描かれている。
        にもかかわらず、注文明細の主キーは <strong>「明細ID」単独</strong> になっており、親の 注文ID が主キーに入っていない。
      </p>
      <p>
        識別関係で親と繋がっている以上、注文明細の主キーは
        <strong>(注文ID, 明細番号) の複合キー</strong>
        になるべき。
        設計意図 (識別関係) と主キー構成 (独立キー) が矛盾している状態は、読み手が「どっちが正しい？」と迷う原因になる。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
