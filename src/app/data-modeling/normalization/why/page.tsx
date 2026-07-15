import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import {
  InsertAnomalyViz,
  UpdateAnomalyViz,
  DeleteAnomalyViz,
} from "@/components/viz/datamodel/AnomalyViz";
import { NormalizedTableView } from "@/components/viz/datamodel/TableBeforeAfter";
import { findTopic } from "@/content/topics";

const slug = "why";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

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

      <h2>同じ情報を何度も書くと何が困るのか</h2>
      <p>
        こんな表を想像してほしい。従業員 1 人につき 1 行、「氏名 / 部署ID / 部署名 / 部署所在地」を書くタイプの表。
        同じ部署に何人か所属していると、その <strong>部署の名前や所在地が人数分だけ何度も書かれる</strong> ことになる。
      </p>

      <div className="not-prose my-6">
        <NormalizedTableView
          data={{
            name: "従業員_部署",
            columns: ["社員ID", "氏名", "部署ID", "部署名", "部署所在地"],
            rows: [
              ["E001", "山田", "D01", "営業部", "東京"],
              ["E002", "田中", "D01", "営業部", "東京"],
              ["E003", "佐藤", "D02", "開発部", "大阪"],
              ["E004", "鈴木", "D02", "開発部", "大阪"],
            ],
          }}
        />
      </div>
      <p>
        この「同じことを何度も書いている」状態は、ぱっと見は問題なさそうでも、
        いざデータを追加 / 変更 / 削除しようとすると 3 種類の困りごとを引き起こす。
        これらをまとめて <strong>更新時異常</strong> (update anomalies) と呼ぶ。
      </p>
      <ul>
        <li><strong>挿入異常</strong> — 追加したいのに追加できない</li>
        <li><strong>更新異常</strong> — 一部だけ書き換えて矛盾が起きる</li>
        <li><strong>削除異常</strong> — 消したい情報と一緒に、消したくない情報も消える</li>
      </ul>
      <p>
        まずは各異常が「実際どんな場面で起きるか」を見てみる。
        以下 3 つの図はコマ送りで進められるので、「次へ」を押しながら順に見てほしい。
      </p>

      <h3>1. 挿入異常 — 追加したいのに追加できない</h3>
      <InsertAnomalyViz />

      <h3>2. 更新異常 — 一部だけ書き換えて矛盾が起きる</h3>
      <UpdateAnomalyViz />

      <h3>3. 削除異常 — 消したくない情報も一緒に消える</h3>
      <DeleteAnomalyViz />

      <h2>解決の指針: 「同じ情報は 1 か所にだけ書く」</h2>
      <p>
        3 つの異常はいずれも <strong>同じ情報を複数の場所に書いている</strong> ことが原因。
        逆に言えば、<strong>「同じ情報は 1 か所にだけ書く」</strong> と決めれば、これらは自然に解消する。
        これが正規化の一番大事な指針で、教科書では
        <strong>「一事実一箇所」(One Fact in One Place)</strong> と呼ばれることも多い。
      </p>
      <p>
        具体的にはどうするか。
        「部署」の情報 (部署ID・部署名・所在地) は本来「部署ごとに 1 つ」の情報なので、
        <strong>部署テーブルを別に作って部署の情報はそこにだけ書く</strong>。
        従業員テーブルには「どの部署か」を示す <code>部署ID</code> だけを持たせて、
        部署の詳細を知りたい時は部署テーブルを見に行けばいい。
      </p>

      <div className="not-prose my-6 flex flex-col gap-4 md:flex-row">
        <div className="min-w-0 flex-1">
          <NormalizedTableView
            data={{
              name: "従業員",
              columns: ["社員ID", "氏名", "部署ID"],
              rows: [
                ["E001", "山田", "D01"],
                ["E002", "田中", "D01"],
                ["E003", "佐藤", "D02"],
                ["E004", "鈴木", "D02"],
              ],
              primaryKey: ["社員ID"],
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <NormalizedTableView
            data={{
              name: "部署",
              columns: ["部署ID", "部署名", "部署所在地"],
              rows: [
                ["D01", "営業部", "東京"],
                ["D02", "開発部", "大阪"],
              ],
              primaryKey: ["部署ID"],
            }}
          />
        </div>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">
        部署の名前も所在地も「D01 は営業部で東京」「D02 は開発部で大阪」と、
        <strong>それぞれ 1 か所にしか書かれていない</strong>。
        従業員テーブルには <code>部署ID</code> という参照だけが残る。
      </p>
      <p>
        こうすると:
      </p>
      <ul>
        <li>
          <strong>更新異常が消える</strong>: 部署名を変える時は部署テーブルの 1 行を書き換えるだけで全従業員の表示に反映される。「一部だけ書き換わって矛盾」が起きようがない。
        </li>
        <li>
          <strong>挿入異常が消える</strong>: 従業員が 1 人もいない新部署も、部署テーブルに 1 行足せば登録できる。
        </li>
        <li>
          <strong>削除異常が消える</strong>: 従業員が全員辞めても、部署の情報は部署テーブルに残っているので消えない。
        </li>
      </ul>

      <h2>正規化はこの指針を「機械的に」進める手順</h2>
      <p>
        「同じ情報を 1 か所に書く」と言われても、実際どうテーブルを分ければいいか迷う。
        そこで先人たちは、「どの列がどの列を決めているか」という関係
        (<Link href="/data-modeling/normalization/functional-dependency">関数従属性</Link>)
        を見れば機械的に分割できる、という手順を作った。
        これが <Link href="/data-modeling/normalization/1nf">第1正規形</Link>・
        <Link href="/data-modeling/normalization/2nf">第2正規形</Link>・
        <Link href="/data-modeling/normalization/3nf">第3正規形</Link>
        と呼ばれる正規化の各ステップ。
      </p>
      <p>
        実務では <strong>第3正規形まで</strong> 進めれば十分とされることが多い。
        それより先 (BCNF・4NF・5NF) は現実の業務モデルでは滅多に問題にならないため、まずは 3NF を目標にすればいい。
        逆に、性能上の理由で「わざと同じ情報を書いておく」判断もあり、これを
        <Link href="/data-modeling/normalization/denormalization">非正規化</Link> と呼ぶ。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
