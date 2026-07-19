import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";
import { CardinalityQuiz } from "@/components/viz/er/CardinalityQuiz";
import { findTopic } from "@/content/topics";

const slug = "optionality";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "参加制約と外部参照制約 (FK 制約) は同じですか？",
    a: "同じではなく、FK 制約は参加制約を DB 上で表現する主な手段です。参加制約は ER モデル層の設計仕様で、FK 列を NOT NULL にすれば必須参加、NULL 許可にすれば任意参加が実装できます。「設計 → 実装への翻訳」の関係です。",
  },
  {
    q: "必須参加を強制するには実装上どうすればいい？",
    a: "FK 列を NOT NULL にし、かつ挿入時トリガや業務ルールで「親レコードなしに子レコードを作らない」を保証する。あるいは親側で「子が 0 件の場合の状態」を明示的に持たせる。",
  },
  {
    q: "「0 対 N」と「1 対 N」の違いは何ですか？",
    a: "「0 対 N」は任意参加 (相手側が 0 個の状態を許容)、「1 対 N」は必須参加 (相手側は最低 1 個必要)。カーディナリティの最大側が同じ「N」でも、最小側が違うと運用上の意味が大きく変わります。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 「0 人の部署」と「配属前の新入社員」を認めるか</h2>
      <p>
        参加制約 (optionality) を理解する一番簡単な問いは、以下の 2 つ:
      </p>
      <ul>
        <li>
          <strong>この会社は、所属する社員が 0 人の部署</strong>
          （新設したばかりで人事異動を待っている部署）
          <strong>の存在を認めますか？</strong>
        </li>
        <li>
          <strong>この会社は、どの部署にもまだ所属していない新入社員</strong>
          （配属前の内定者）
          <strong>をシステムに登録できますか？</strong>
        </li>
      </ul>
      <p>
        「0 個も許容する」= <strong>任意参加</strong>、「必ず 1 個以上」= <strong>必須参加</strong>。
        つまり参加制約は「相手が最低 <strong>何個</strong> 必要か」の指定で、
        <Link href="/data-modeling/er-diagram/cardinality">カーディナリティ</Link> が「最大基数」なら
        参加制約は <strong>最小基数</strong>。両方セットで初めて関連の意味が完成する。
      </p>

      <h2>ER 図での参加制約の記号</h2>
      <p>IE 記法 (crow&apos;s foot) では、線の端の記号で表す:</p>
      <ul>
        <li>
          <strong>縦棒 (|)</strong> — 必ず 1 (必須参加)
        </li>
        <li>
          <strong>円 (○)</strong> — 0 も許容 (任意参加)
        </li>
      </ul>

      <ERDiagram
        title="必須参加 (社員は必ずどこかの部署に所属)"
        width={720}
        height={240}
        entities={[
          {
            id: "emp",
            label: "社員",
            x: 60,
            y: 80,
            width: 220,
            attributes: ["社員ID", "氏名", "部署ID"],
            primaryKey: ["社員ID"],
          },
          {
            id: "dept",
            label: "部署",
            x: 440,
            y: 80,
            width: 220,
            attributes: ["部署ID", "部署名"],
            primaryKey: ["部署ID"],
          },
        ]}
        relationships={[
          {
            from: "emp",
            to: "dept",
            fromCardinality: "one-many",
            toCardinality: "one",
          },
        ]}
        caption="部署側 = 縦棒 (必ず 1 部署に所属)、社員側 = 縦棒 + 鳥足 (部署は必ず 1 人以上の社員を持つ)。"
      />

      <ERDiagram
        title="任意参加 (0 人の部署、部署なしの社員を許容)"
        width={720}
        height={240}
        entities={[
          {
            id: "emp2",
            label: "社員",
            x: 60,
            y: 80,
            width: 220,
            attributes: ["社員ID", "氏名", "部署ID"],
            primaryKey: ["社員ID"],
          },
          {
            id: "dept2",
            label: "部署",
            x: 440,
            y: 80,
            width: 220,
            attributes: ["部署ID", "部署名"],
            primaryKey: ["部署ID"],
          },
        ]}
        relationships={[
          {
            from: "emp2",
            to: "dept2",
            fromCardinality: "zero-many",
            toCardinality: "zero-one",
          },
        ]}
        caption="両端に円 (○) が付く。部署なしの内定者、社員 0 人の新設部署、どちらも許容する構造。"
      />

      <h2>試してみる: 円 (○) と縦棒 (|) の切り替えで業務ルールがどう変わるか</h2>
      <p>
        {" "}
        <Link href="/data-modeling/er-diagram/cardinality">カーディナリティ ページ</Link>
        {" "}と同じ 3 シナリオを、今度は <strong>下限側の記号 (○ vs |) のみ</strong> 切り替えられる形で用意した。
        上限側の記号 (鳥足の有無) は各シナリオの業務仕様に合わせて固定してある。
        「0 個も許すのか、必ず 1 個以上必要か」の差が、現実世界のどのルールに直結しているかを試してほしい。
      </p>

      <CardinalityQuiz mode="min" />

      <h2>参加制約を DB 上で表現する: FK 制約</h2>
      <p>
        参加制約は <strong>ER モデル層</strong> の設計仕様であって、そのままでは DB は何も強制してくれない。
        これを実装層で担保する主な手段が <strong>FK 制約 (外部参照制約)</strong>。
        FK 列の NOT NULL / NULL 許可 の使い分けで、参加制約を DB のスキーマに落とし込む:
      </p>
      <ul>
        <li>
          <strong>必須参加</strong> → FK 列を <strong>NOT NULL</strong> にする (相手を必ず持たせる)
        </li>
        <li>
          <strong>任意参加</strong> → FK 列を <strong>NULL 許可</strong> にする (相手を持たない状態を許す)
        </li>
      </ul>
      <p>
        ただし FK 制約が保証するのは「参照した先が存在すること」だけで、「必ず参照すること」まで踏み込まない。
        任意参加は NULL 許可 だけで足りるが、必須参加を厳密に強制したければ
        NOT NULL + 挿入時トリガや業務ルールのバリデーションを追加する必要がある。
        「参加制約 = 設計」「FK 制約 = 実装」と考え、後者は前者を DB に翻訳する道具、と押さえておくと混乱しない。
      </p>

      <h2>変なER図 との対応: 違和感 #9 参加制約の矛盾</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([9])} />
      </div>

      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> の「注文 —明細— 注文明細」の線を注意深く見ると、
        <strong>注文側</strong> に <strong>|○ (最大 1、最小 0)</strong>、
        <strong>注文明細側</strong> に <strong>1..N (最大 N、最小 1)</strong> が並んでいる。
        IE 記法として厳密に読むと:
      </p>
      <ul>
        <li>注文明細側から: 「1 つの注文は明細を <strong>1 件以上</strong> 必ず持つ」(必須参加)</li>
        <li>注文側から: 「1 つの明細は親の注文を <strong>0 or 1</strong> 個しか持たない」(任意参加、注文なしでも存在可)</li>
      </ul>
      <p>
        この 2 つは <strong>存在論的に両立しない</strong>。
        「注文には明細が必ず 1 件以上ある」なら、その明細を逆から見れば必ず親の注文を持つ (= 最小 1) はず。
        参加制約は片側だけで決まらず、両側の最小基数が整合していないと関連そのものが破綻する。
      </p>
      <p>
        さらにこの線は <Link href="/data-modeling/er-diagram/weak-entity">識別関係</Link>
        (弱エンティティを親に繋ぐ関連) なので、
        「弱エンティティは親なしでは存在できない」という定義と親側 min=0 が真っ向から衝突する。
        参加制約の矛盾は、関連の意味と組み合わさると設計そのものを崩壊させる。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
