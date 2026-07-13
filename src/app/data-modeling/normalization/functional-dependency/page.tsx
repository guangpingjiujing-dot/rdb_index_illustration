import type { Metadata } from "next";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { FDArrowDiagram } from "@/components/viz/datamodel/FDArrowDiagram";
import { findTopic } from "@/content/topics";

const slug = "functional-dependency";
const topic = findTopic("data-modeling", slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "関数従属とは要するに何ですか？",
    a: "X の値が決まれば Y の値も一意に決まる、という関係のことです。例えば社員ID → 氏名。正規化はすべてこの関係の分析から出発します。",
  },
  {
    q: "完全関数従属と部分関数従属はどう違いますか？",
    a: "複合キー (A, B) のうち一部 (A だけ) で従属が成立するのが部分関数従属、(A, B) 両方が揃わないと従属が成立しないのが完全関数従属です。",
  },
  {
    q: "推移関数従属とは？",
    a: "X → Y かつ Y → Z (Y は候補キー以外) の時に、X → Z が Y を経由して成立している関係のことです。3NF はこの経由を排除します。",
  },
  {
    q: "関数従属をどうやって見つければいい？",
    a: "「この列が決まれば必ずこの列が決まる」という業務ルールを洗い出すのが基本です。サンプルデータからの推定は反例が出た瞬間に崩れるので補助的手段に留めます。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>関数従属の表記 X → Y</h2>
      <p>
        リレーションのある行で <strong>属性集合 X の値が定まったら、属性集合 Y の値も一意に定まる</strong> という関係を、
        <code>X → Y</code> と書いて <strong>関数従属</strong> (functional dependency, FD) と呼ぶ。
        X を <strong>決定関数</strong> (determinant)、Y を <strong>従属関数</strong> と呼ぶ。
      </p>
      <p>
        たとえば「社員ID が決まれば氏名が決まる」なら <code>社員ID → 氏名</code> と書く。
        この関係は業務ルールから導かれるもので、サンプルデータの偶然の一致から推定するものではない点に注意する
        (反例が 1 件でも出れば FD は成立しない)。
      </p>

      <FDArrowDiagram
        title="社員・部署テーブルの関数従属"
        attributes={["社員ID", "氏名", "入社日", "部署ID", "部署名"]}
        primaryKey={["社員ID"]}
        dependencies={[
          { from: ["社員ID"], to: ["氏名"], kind: "full" },
          { from: ["社員ID"], to: ["入社日"], kind: "full" },
          { from: ["社員ID"], to: ["部署ID"], kind: "full" },
          { from: ["部署ID"], to: ["部署名"], kind: "full" },
          {
            from: ["社員ID"],
            to: ["部署名"],
            kind: "transitive",
            note: "部署ID を経由して成立",
          },
        ]}
        caption="社員ID から部署名への直接の従属も成り立つが、それは 社員ID → 部署ID → 部署名 という経由でしか出てこない。この経由が「推移関数従属」であり、3NF はこれを排除する。"
      />

      <h2>3 種類の関数従属</h2>
      <p>
        正規化では以下の 3 種類を区別することが重要になる。
        それぞれ排除対象になるのが 2NF・3NF の要件そのものになる。
      </p>
      <ul>
        <li>
          <strong>完全関数従属</strong> (full functional dependency): 決定関数側の属性を 1 つでも減らすと従属が成立しなくなる関係。
          <code>(注文ID, 商品ID) → 数量</code> のように、複合キー全体で 1 つの事実が決まるケース。
        </li>
        <li>
          <strong>部分関数従属</strong> (partial functional dependency): 決定関数側の複合キーの <em>一部</em> だけで従属が成立してしまう関係。
          <code>(注文ID, 商品ID) → 商品名</code> は、実際には <code>商品ID → 商品名</code> だけで成立してしまう。
          <Link href="/data-modeling/normalization/2nf">第2正規形</Link> はこれを排除する。
        </li>
        <li>
          <strong>推移関数従属</strong> (transitive functional dependency): <code>X → Y → Z</code> のように、
          非キー属性 Y を経由して X から Z が決まる関係。
          <Link href="/data-modeling/normalization/3nf">第3正規形</Link> はこれを排除する。
        </li>
      </ul>

      <h2>なぜ関数従属が正規化の判定基準になるのか</h2>
      <p>
        「一事実一箇所」の原則を機械的に検査する道具として、関数従属は最も自然なフォーマットになる。
        <code>X → Y</code> という関係が成り立っていて、かつ X 側が候補キー全体でないなら、
        Y は「X の各値ごとに 1 度だけ書けば十分な事実」であり、それを行ごとに繰り返すのは冗長ということになる。
      </p>
      <p>
        つまり <strong>「候補キー以外の左辺を持つ関数従属」の存在は、そのまま更新時異常の可能性を示唆する</strong>。
        正規化 (1NF → 2NF → 3NF → BCNF) は、この望ましくない関数従属を段階的に排除していく手続きとして統一的に理解できる。
      </p>

      <h2>キーとの関係</h2>
      <p>
        関数従属の議論を正確に行うには <Link href="/data-modeling/normalization/keys">キーの階層</Link> の理解が前提になる。
        「候補キー全体で決まる」か「候補キーの一部で決まってしまう」かで正規形の判定が変わるためだ。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
