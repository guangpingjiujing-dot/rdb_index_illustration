import type { Metadata } from "next";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import {
  InsertAnomalyViz,
  UpdateAnomalyViz,
  DeleteAnomalyViz,
} from "@/components/viz/datamodel/AnomalyViz";
import { findTopic } from "@/content/topics";

const slug = "why";
const topic = findTopic("data-modeling", slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "正規化しないとどんな問題が起きますか？",
    a: "同じ情報が複数行に重複し、更新漏れ・削除時の情報消失・関連情報が無いと挿入できないといった「更新時異常」が発生します。データの信頼性が保てなくなります。",
  },
  {
    q: "更新異常・挿入異常・削除異常の違いは？",
    a: "更新異常は同じ事実の一部だけ書き換わって矛盾する状態、挿入異常は関連する主体が存在しないと事実を登録できない状態、削除異常はある行を消すと別の必要な情報まで消える状態を指します。",
  },
  {
    q: "どこまで正規化すべきですか？",
    a: "実務では第3正規形まで正規化するのが標準的な指針です。BCNF 以上はスキーマの複雑度と参照コストが上がるため、必要になった時だけ検討します。",
  },
  {
    q: "正規化は今の時代でも必要ですか？",
    a: "必要です。NoSQL や分析用テーブルでは意図的に崩すこともありますが、判断の起点となる「正規化された姿」を知っていることが前提になります。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>更新時異常とは</h2>
      <p>
        正規化されていないテーブルには「同じ事実を複数の場所に持ってしまっている」という冗長性がある。
        そのままだと、挿入・更新・削除のどれをやっても副作用や矛盾が生じる。これを総称して <strong>更新時異常</strong> (update anomalies) と呼ぶ。
        更新時異常には <strong>挿入異常</strong>・<strong>更新異常</strong>・<strong>削除異常</strong> の 3 種類がある。
      </p>
      <p>
        以下、従業員と部署を 1 つのテーブルにまとめた <code>従業員_部署</code> を題材に、
        3 種類それぞれの発生の様子をアニメーションで示す
        (部署名・所在地は本来「部署ごとに 1 つ」の事実だが、この表では社員行ごとに繰り返されている。この冗長性が全ての原因)。
      </p>

      <h3>1. 挿入異常</h3>
      <InsertAnomalyViz />

      <h3>2. 更新異常</h3>
      <UpdateAnomalyViz />

      <h3>3. 削除異常</h3>
      <DeleteAnomalyViz />

      <h2>一事実一箇所 (One Fact in One Place) の原則</h2>
      <p>
        正規化の指針を一言で言うと <strong>「一つの事実は一箇所にだけ格納する」</strong> という原則である。
        上の例で言えば「D01 は営業部で、東京にある」という事実は 1 回だけどこかに書けばよい。
        そのために「部署」テーブルを別に作り、「従業員」テーブルは <code>部署ID</code> という参照だけを持たせるように分割する。
      </p>
      <p>
        こうすると:
      </p>
      <ul>
        <li>部署の情報を持つ場所が 1 箇所だけになるので、更新時の矛盾が発生しなくなる (更新異常の解消)</li>
        <li>社員が誰もいない部署も「部署」テーブルに登録できる (挿入異常の解消)</li>
        <li>最後の社員が居なくなっても、部署の存在情報は「部署」テーブルに残る (削除異常の解消)</li>
      </ul>

      <h2>正規化はどんな手続きか</h2>
      <p>
        「一事実一箇所」を機械的に保証するために、リレーショナル理論では
        <Link href="/data-modeling/normalization/functional-dependency">関数従属性</Link>
        という道具を使って段階的にテーブルを分割していく。
        これが <Link href="/data-modeling/normalization/1nf">第1正規形</Link>・
        <Link href="/data-modeling/normalization/2nf">第2正規形</Link>・
        <Link href="/data-modeling/normalization/3nf">第3正規形</Link>
        と呼ばれる正規化の各段階である。
      </p>
      <p>
        実務では <strong>第3正規形まで</strong> 正規化するのが標準的な指針とされる。
        なぜ 3NF まででよいか、そこから先の BCNF・4NF・5NF がいつ必要になるか、そして
        意図的に正規化を崩す <Link href="/data-modeling/normalization/denormalization">非正規化</Link>
        の判断もこのセクションで扱う。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
