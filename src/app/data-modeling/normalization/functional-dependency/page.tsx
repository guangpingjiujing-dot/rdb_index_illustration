import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { FDArrowDiagram } from "@/components/viz/datamodel/FDArrowDiagram";
import { findTopic } from "@/content/topics";

const slug = "functional-dependency";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

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

      <h2>「A が決まれば B も決まる」= 関数従属</h2>
      <p>
        「社員ID が分かれば、その人の氏名は 1 つに決まる」— これは当たり前に感じる関係だが、
        正規化の議論では大事なので名前が付いている。<strong>関数従属</strong> (functional dependency, FD) だ。
        矢印で書くと <code>社員ID → 氏名</code>。矢印の左が「決める側」、右が「決まる側」。
      </p>
      <p>
        「決まる」というのは、あるテーブルのどの行を見ても
        <strong>「社員ID が同じなら氏名も同じ」</strong> が成り立つ、という意味。
        たまたま同じだった、ではなく、業務ルールとして「社員ID が同じなら氏名も同じはず」と言えるものだけを関数従属として扱う
        (1 件でも例外が出れば関数従属とは呼ばない)。
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
        caption="社員ID → 部署名 も一見成り立っているが、実は「社員ID → 部署ID → 部署名」を経由して間接的に決まっているだけ。この「経由あり」の関数従属を「推移関数従属」と呼び、後で第3正規形が排除の対象にする。"
      />

      <h2>3 種類の関数従属 (これから何度も出てくる)</h2>
      <p>
        関数従属には 3 種類あり、それぞれが 2NF・3NF が扱うテーマに対応している。
        今は名前と雰囲気だけ覚えておけば OK。実例は各正規形のページで詳しく見る。
      </p>
      <ul>
        <li>
          <strong>完全関数従属</strong>: 「A と B が両方揃って初めて C が決まる」タイプ。
          例: <code>(注文ID, 商品ID) → 数量</code>。注文ID だけ、商品ID だけでは数量は決まらない。
          これは正常な関数従属で、排除の対象ではない。
        </li>
        <li>
          <strong>部分関数従属</strong>: 「(A, B) の一部分 (例えば B だけ) で決まってしまう」タイプ。
          例: <code>(注文ID, 商品ID) → 商品名</code> は実は <code>商品ID → 商品名</code> だけで成り立つので、注文ID は不要。
          これがあると同じ商品名が何度も繰り返されるので、
          <Link href="/data-modeling/normalization/2nf">第2正規形</Link> で切り出す対象になる。
        </li>
        <li>
          <strong>推移関数従属</strong>: 「A → B → C と経由してしまう」タイプ。
          例: <code>社員ID → 部署ID → 部署名</code>。社員ID から部署名を「直接」決めているのではなく、部署ID を経由している。
          これがあると同じ部署名が何度も繰り返されるので、
          <Link href="/data-modeling/normalization/3nf">第3正規形</Link> で切り出す対象になる。
        </li>
      </ul>

      <h2>なぜこの概念が正規化の判定基準になるのか</h2>
      <p>
        「同じ情報を 1 か所に書く」を判定するとき、関数従属で見るのが一番シンプル。
        例えば <code>部署ID → 部署名</code> という関数従属があるということは、
        「部署ID が同じ行は部署名も必ず同じ」= 部署名が繰り返し書かれている、ということ。
        つまり関数従属を見つけると、そのまま「重複している情報の場所」も見つけたことになる。
      </p>
      <p>
        正規化 (1NF → 2NF → 3NF) は、こうした「重複を生む関数従属」を段階的に切り出していく手順として理解できる。
        各正規形が「どのタイプの関数従属を排除するのか」を意識すると、全体の流れがすっきり見えてくる。
      </p>

      <h2>先に「キーの階層」を押さえておこう</h2>
      <p>
        関数従属の話を正確にするには <Link href="/data-modeling/normalization/keys">キーの階層</Link>
        (スーパーキー・候補キー・主キー) の理解が前提になる。
        「主キー全体で決まる」のか「主キーの一部で決まってしまう」のかが、2NF・3NF の判定を分けるからだ。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
