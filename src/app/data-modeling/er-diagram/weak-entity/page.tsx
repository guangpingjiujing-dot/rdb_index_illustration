import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
import { findTopic } from "@/content/topics";

const slug = "weak-entity";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "弱エンティティと連関実体は同じですか？",
    a: "似ているが違う。弱エンティティは「親に依存して識別される」性質そのもの、連関実体は「多対多を分解するために挟む第 3 のエンティティ」の役割。連関実体は多くの場合、弱エンティティの一種として実装される。",
  },
  {
    q: "弱エンティティを強エンティティに書き直すこともできますか？",
    a: "できる。注文明細に独自の代理キー (明細ID) を付けて主キーにすれば強エンティティ扱いに近づく。ただし「親を消したら子は無意味」という業務ルールは残るので、実装上は FK に ON DELETE CASCADE を付けるなど、親子関係のライフサイクルは意識する必要がある。",
  },
  {
    q: "IE 記法で二重四角以外の書き方はありますか？",
    a: "IE 記法は視覚的な二重四角の慣習が定着していないツールも多く、「主キーの構成 (親の PK を含むか)」で判別することも多い。IDEF1X 記法では実線 (識別関係) で親と繋げば子は暗黙に弱エンティティ扱い。詳細は [記法比較](/data-modeling/er-diagram/notation)。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 「注文書の 3 行目」だけを見せられたら？</h2>
      <p>
        紙の注文書を思い浮かべる。1 冊の注文書には表紙 (注文番号・注文日・顧客) があって、
        本文に商品明細が何行か書かれている。ここで <strong>「明細の 3 行目」だけを紙から切り取って渡す</strong>
        と、受け取った人は「これはどの注文の 3 行目ですか？」と聞き返したくなる。
      </p>
      <p>
        「明細の 3 行目」は、注文書というコンテキストがないと存在意味を持たない。
        こういう性質のエンティティを <strong>弱エンティティ (weak entity)</strong> と呼ぶ。
        親エンティティ (注文書) のキー (注文番号) を借りて初めて一意になる。
      </p>

      <h2>ER 図での弱エンティティの描き方</h2>
      <p>
        歴史的には <strong>Chen 記法 (原典 1976)</strong> で弱エンティティを
        <strong>二重四角</strong> で描き、識別関係を <strong>二重菱形</strong> で描くのが慣習だった。
        今も IPA データベーススペシャリスト試験や大学の教科書ではこの表記が残る。
      </p>
      <p>
        しかし現代の <strong>IE 記法 (crow&apos;s foot)</strong> — dbdiagram / DrawSQL / ChartDB
        などモダンな作図ツールの既定 — では、弱エンティティを特別な視覚記号では区別しない。
        代わりに <strong>主キーの構造</strong> で判別する:
        子エンティティの主キーが <strong>親エンティティの主キーを含む複合キー</strong> であれば弱エンティティ、
        独立の主キーだけなら強エンティティ。
        親との関連は <Link href="/data-modeling/er-diagram/identifying">識別関係</Link>
        と呼ばれる。
      </p>
      <p>
        本サイトは IE 記法を採用しているので、以下の図でも弱エンティティ「注文明細」を通常の四角で描く。
        判定は 主キー欄の <code>注文ID (PK), 明細番号 (PK)</code> の複合構造から読み取る。
      </p>

      <ERDiagram
        title="注文と注文明細 — 典型的な弱エンティティ"
        width={800}
        height={280}
        entities={[
          {
            id: "order",
            label: "注文",
            x: 60,
            y: 90,
            width: 220,
            attributes: ["注文ID", "注文日", "顧客ID"],
            primaryKey: ["注文ID"],
          },
          {
            id: "line",
            label: "注文明細",
            x: 480,
            y: 90,
            width: 260,
            attributes: ["注文ID", "明細番号", "商品名", "数量"],
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
        caption="「注文明細」は主キーが (注文ID, 明細番号) の複合キーで、親の注文ID を含むため弱エンティティ。IE 記法では見た目上は普通の箱で描き、主キー構造で判定する。"
      />

      <h2>弱エンティティ判定のチェックリスト</h2>
      <ul>
        <li>
          <strong>単独で識別できないか</strong>: 「明細番号 3」だけでは、どの注文の 3 行目か分からない
        </li>
        <li>
          <strong>親を消したら意味を失うか</strong>: 注文が消えたら明細は存在意義がゼロ
        </li>
        <li>
          <strong>親のライフサイクルに従属するか</strong>: 明細は注文と一緒に作られ、一緒に消える
        </li>
      </ul>
      <p>
        3 つとも Yes なら弱エンティティ。1 つでも No があるなら、独立の強エンティティにする方が自然。
      </p>

      <h2>典型的な例</h2>
      <ul>
        <li>
          <strong>注文 — 注文明細</strong> (主キー: 注文ID + 明細番号)
        </li>
        <li>
          <strong>建物 — 部屋</strong> (主キー: 建物ID + 部屋番号。「101号室」は建物なしには意味不明)
        </li>
        <li>
          <strong>従業員 — 扶養家族</strong> (主キー: 従業員ID + 家族番号)
        </li>
        <li>
          <strong>会計期 — 期別集計</strong> (主キー: 期ID + 集計項目)
        </li>
      </ul>

      <h2>変なER図 との対応: 違和感 #3「配偶者」が独立主キーで単独存在</h2>
      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> の「配偶者」エンティティは、
        意味的には <strong>入居者に従属する弱エンティティ</strong> であるはず (「田中さんの配偶者」という
        文脈なしには成立しない) にもかかわらず、実装が <strong>「配偶者ID」という独立の主キー</strong> になっており、
        入居者エンティティとの関連さえ引かれていない。
      </p>
      <p>
        正しくは「入居者 — 配偶者」を関連で繋ぎ、配偶者側の主キーを
        <code>(入居者ID, 配偶者連番)</code> のような複合キーにする。
        これで「田中さんの配偶者」「山田さんの配偶者」を配偶者ID なしで一意に区別できる。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
