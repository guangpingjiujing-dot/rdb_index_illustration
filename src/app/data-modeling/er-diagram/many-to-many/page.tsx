import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";
import { findTopic } from "@/content/topics";

const slug = "many-to-many";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "多対多を直接テーブル 2 つで実装できないのはなぜですか？",
    a: "「学生」テーブルに「履修科目」列を複数値で持たせようとすると 1NF 違反になる。逆に「科目」テーブルに「履修学生」を持たせても同じ問題。両者の対応関係は、1 行につき「1 学生 × 1 科目」の組を持つ第 3 のテーブル (連関実体) にしか収まらない。",
  },
  {
    q: "連関実体には常に属性を持たせるべきですか？",
    a: "対応関係そのものだけを表現する場合は最低限 (両側の FK 2 本) で足りるが、「いつ登録した」「成績は」「支払済みか」など対応固有のデータが発生する場合は必ず属性として持たせる。多くの場合、業務要件を精査すると何らかの属性が必要になる。",
  },
  {
    q: "連関実体は弱エンティティですか？",
    a: "両側のエンティティなしには意味を持たないので、実質的には弱エンティティに近い。ただし主キーの設計上、独立の代理キー (履修ID など) を付けて強エンティティとして扱う実装も多い。学術的には弱エンティティ、実務的には状況次第、という中間的な存在。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 履修登録</h2>
      <p>
        大学の履修登録を思い浮かべる。<strong>1 人の学生は複数の科目を取り、
        1 つの科目には複数の学生が集まる</strong>。両側とも「複数」の関係、
        これが多対多 (N:M) の関連。
      </p>
      <p>
        直感的には ER 図で「学生」と「科目」に線を 1 本引いて、両端に鳥足を付ければ済みそうに見える。
        でも、それでは <strong>「誰がいつ何を履修したか」を記録する場所がない</strong>。
      </p>

      <ERDiagram
        title="直接 N:M で繋いだ状態 (実装できない)"
        width={720}
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
            x: 440,
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
        caption="ER 図の記法上は書けても、実装時にこのまま SQL テーブル 2 つに落とせない。"
      />

      <h2>解決: 連関実体 (中間テーブル) に分解する</h2>
      <p>
        両側から参照される第 3 のエンティティ <strong>「履修登録」</strong> を挟む。
        履修登録には「学籍番号」と「科目ID」の 2 本の FK が入り、それが複合主キーになる。
        履修年度・成績・登録日 などの固有属性もここに持たせられる。
      </p>

      <ERDiagram
        title="連関実体で N:M を分解"
        width={900}
        height={260}
        entities={[
          {
            id: "stu2",
            label: "学生",
            x: 40,
            y: 60,
            width: 200,
            attributes: ["学籍番号", "氏名"],
            primaryKey: ["学籍番号"],
          },
          {
            id: "enroll",
            label: "履修登録",
            x: 350,
            y: 60,
            width: 220,
            attributes: ["学籍番号", "科目ID", "履修年度", "成績"],
            primaryKey: ["学籍番号", "科目ID"],
            isWeak: true,
          },
          {
            id: "cls2",
            label: "科目",
            x: 680,
            y: 60,
            width: 200,
            attributes: ["科目ID", "科目名"],
            primaryKey: ["科目ID"],
          },
        ]}
        relationships={[
          {
            from: "stu2",
            to: "enroll",
            fromCardinality: "one",
            toCardinality: "zero-many",
            isIdentifying: true,
          },
          {
            from: "cls2",
            to: "enroll",
            fromCardinality: "one",
            toCardinality: "zero-many",
            isIdentifying: true,
          },
        ]}
        caption="「履修登録」が学生と科目の両方から FK を借り、複合主キー (学籍番号, 科目ID) で行を一意に識別する。IE 記法では弱エンティティを特別な記号で区別せず、主キーが親エンティティのキーを含むかどうかで判定する。"
      />

      <h2>連関実体を作らないと失うもの</h2>
      <ul>
        <li>
          <strong>履歴</strong>: 「田中さんが 8/1 にこの商品を 2 個買った」を記録する場所がない
        </li>
        <li>
          <strong>状態遷移</strong>: 「登録済み → 履修中 → 完了」といったステータスを持たせる場所がない
        </li>
        <li>
          <strong>重複制御</strong>: 「同じ組み合わせを 1 回しか登録しない」を主キーで担保できない
        </li>
        <li>
          <strong>属性</strong>: 「成績」「支払い済みフラグ」など対応固有のデータを置く場所がない
        </li>
      </ul>

      <h2>変なER図 との対応: 違和感 #5「顧客×商品」に中間実体なし</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([5])} />
      </div>

      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> では、「顧客」と「商品」が直接 N:M の線で繋がっている。
        EC サイトでは明らかに <strong>購入履歴 (誰が いつ 何をいくつ買ったか) を記録したい</strong> はずだが、
        この構造だと「田中さんが 8/1 にこの商品を 2 個買った」を格納する場所がない。
        しかも図の別の場所に「注文明細」エンティティが描かれているのに、この線は迂回していない。
      </p>
      <p>
        正しくは 顧客 → 注文 → 注文明細 → 商品 と辿って、注文明細を連関実体として (注文ID, 明細番号) や (注文ID, 商品ID) の複合主キーで表現する。
        これで購入履歴も数量も金額も全部乗る。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
