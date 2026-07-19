import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";
import { findTopic } from "@/content/topics";

const slug = "cardinality";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "1:1 の関連はいつ使いますか？",
    a: "「1 人の社員は 1 つの社員証を持ち、1 つの社員証は 1 人の社員に紐付く」など、両側とも一意な物理的対応があるとき。実装上は 1 テーブルにまとめても成立するので、あえて分ける理由 (機密属性の分離、大きな添付ファイルの切り出しなど) が必要。",
  },
  {
    q: "IE 記法の鳥足の意味は？",
    a: "鳥足 (crow's foot) は「多 (N)」を意味する。線の端が 3 本に枝分かれしている記号が「相手が複数個」を表す。縦棒 1 本は「必ず 1」、円は「0 も許容」。この 3 つの組み合わせで 5 種類のカーディナリティを表現する。",
  },
  {
    q: "1:N の N には上限はありますか？",
    a: "ER モデルの記法上、上限はない (任意の N)。上限を持たせたい場合は制約条件を注釈で書くか、上位のドキュメントで規定する。実装時には NOT NULL / CHECK 制約 / アプリケーション層で担保する。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 部長は何人の部下を持てるか</h2>
      <p>
        「1 人の部長は複数の部下を持つ」「1 人の部下は 1 人の部長にしか報告しない」。
        これがカーディナリティの直感。片方から見て、もう片方は <strong>何個と結び付いているか</strong> を規定する数の制約。
      </p>
      <p>
        カーディナリティは <strong>2 種類の情報</strong> を同時に表す:
      </p>
      <ul>
        <li>
          <strong>最大基数</strong> — 「最大で何個と結び付くか」(1 or N)。1 なら「多くて 1 個」、N なら「上限なし」
        </li>
        <li>
          <strong>最小基数 = 参加制約</strong> — 「最低何個必要か」(0 or 1)。0 なら「無くてもよい」、1 なら「必ず 1 個以上」
        </li>
      </ul>
      <p>
        本ページでは主に <strong>最大基数</strong> (1:1、1:N、N:M の話) を扱う。
        最小基数の話は {" "}
        <Link href="/data-modeling/er-diagram/optionality">参加制約 ページ</Link> を参照。
      </p>

      <h2>3 種類のカーディナリティ</h2>

      <h3>1:1 (1 対 1)</h3>
      <p>
        両側ともに「多くて 1 個」。「社員」と「社員証」など、物理的な 1:1 対応があるときに使う。
      </p>

      <ERDiagram
        title="1:1 の例 — 社員と社員証"
        width={700}
        height={220}
        entities={[
          {
            id: "emp1",
            label: "社員",
            x: 60,
            y: 60,
            width: 220,
            attributes: ["社員ID", "氏名"],
            primaryKey: ["社員ID"],
          },
          {
            id: "card",
            label: "社員証",
            x: 420,
            y: 60,
            width: 220,
            attributes: ["社員証ID", "有効期限"],
            primaryKey: ["社員証ID"],
          },
        ]}
        relationships={[
          {
            from: "emp1",
            to: "card",
            fromCardinality: "one",
            toCardinality: "one",
          },
        ]}
        caption="両端に縦棒 1 本 = 「必ず 1、多くて 1」。"
      />

      <h3>1:N (1 対 多)</h3>
      <p>
        片側は「多くて 1 個」、もう片側は「複数個」。もっとも頻出のパターン。
      </p>

      <ERDiagram
        title="1:N の例 — 部長と部下"
        width={700}
        height={220}
        entities={[
          {
            id: "boss",
            label: "部長",
            x: 60,
            y: 60,
            width: 220,
            attributes: ["部長ID", "氏名"],
            primaryKey: ["部長ID"],
          },
          {
            id: "sub",
            label: "部下",
            x: 420,
            y: 60,
            width: 220,
            attributes: ["部下ID", "氏名", "部長ID"],
            primaryKey: ["部下ID"],
          },
        ]}
        relationships={[
          {
            from: "boss",
            to: "sub",
            fromCardinality: "one",
            toCardinality: "one-many",
          },
        ]}
        caption="部長側は縦棒 (必ず 1)、部下側は縦棒 + 鳥足 (必ず 1 以上)。"
      />

      <h3>N:M (多 対 多)</h3>
      <p>
        両側とも「複数個」。学生と履修科目、顧客と商品 (直接繋いだ場合) など。
        <strong>実装時には必ず連関実体 (中間テーブル) に分解する</strong>。
        詳細は {" "}
        <Link href="/data-modeling/er-diagram/many-to-many">多対多と連関実体 ページ</Link>。
      </p>

      <ERDiagram
        title="N:M の例 — 学生と履修科目"
        width={700}
        height={220}
        entities={[
          {
            id: "stu",
            label: "学生",
            x: 60,
            y: 60,
            width: 220,
            attributes: ["学籍番号", "氏名"],
            primaryKey: ["学籍番号"],
          },
          {
            id: "cls",
            label: "科目",
            x: 420,
            y: 60,
            width: 220,
            attributes: ["科目ID", "科目名"],
            primaryKey: ["科目ID"],
          },
        ]}
        relationships={[
          {
            from: "stu",
            to: "cls",
            fromCardinality: "zero-many",
            toCardinality: "zero-many",
          },
        ]}
        caption="両端に円 + 鳥足 = 「0 or それ以上」。この形は必ず連関実体に分解する。"
      />

      <h2>IE 記法 (crow&apos;s foot) の記号早見</h2>
      <ul>
        <li>
          <strong>縦棒 (|)</strong> — 「必ず 1」の最小基数
        </li>
        <li>
          <strong>円 (○)</strong> — 「0 も許容」の最小基数
        </li>
        <li>
          <strong>鳥足 (&lt;)</strong> — 「多 (N)」の最大基数
        </li>
      </ul>
      <p>
        これらを線の両端に配置する。「入口から見て遠い側」の記号が「相手からの参加制約」で、
        「入口から見て近い側」の記号が「相手からの最大基数」を表すという読み方の慣習になっている。
      </p>

      <h2>変なER図 との対応: 違和感 #1「EC サイトなのに 1:1」</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([1])} />
      </div>

      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> の「顧客 —発注— 注文」は、
        顧客側が <strong>縦棒 1 本 (最大 1)</strong>、注文側が <strong>縦棒+円 (最大 1、最小 0)</strong>。
        両端とも <strong>最大基数が 1 に固定</strong> されているので、「1 人の顧客は 最大 1 注文しか持てず、1 つの注文にも 最大 1 顧客しか紐付けられない」
        という実質 1:0..1 (ほぼ 1:1 固定) の関係を強制している。
      </p>
      <p>
        EC サイトなら本来は <strong>1 顧客が複数回注文でき、購入履歴も保持したい</strong>。
        カーディナリティの選択は業務ルールを直接規定するので、最初にここで間違えると
        その後のスキーマも実装も破綻する。「EC サイト」と「顧客-注文 1:1」は 1 秒でおかしいと気づけるようになりたい。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
