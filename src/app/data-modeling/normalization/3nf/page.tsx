import type { Metadata } from "next";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { FDGroupBoxes } from "@/components/viz/datamodel/FDGroupBoxes";
import { FDColorTable } from "@/components/viz/datamodel/FDColorTable";
import { TableBeforeAfter } from "@/components/viz/datamodel/TableBeforeAfter";
import { Practice } from "@/components/viz/datamodel/Practice";
import { findTopic } from "@/content/topics";

// 3NF 分析で使う「決定関数グループ」の色分け定義
// - pk: グレー (基準)
// - direct: ブルー (問題なし、直接決まる)
// - transitive: アンバー (推移 = 注意、これが 3NF 違反)
const GROUPS_3NF = [
  {
    key: "pk",
    marker: "◆",
    label: "主キー (注文ID)",
    headerBgClass: "bg-[#e5e5e2]",
    cellBgClass: "bg-[#f2f2ee]",
  },
  {
    key: "direct",
    marker: "■",
    label: "注文ID から直接決まる",
    headerBgClass: "bg-[#dbeafe]",
    cellBgClass: "bg-[#ecf3fc]",
  },
  {
    key: "transitive",
    marker: "●",
    label: "顧客ID 経由 (推移) で決まる",
    headerBgClass: "bg-[#fef1c7]",
    cellBgClass: "bg-[#fef8dd]",
  },
];

const slug = "3nf";
const topic = findTopic("data-modeling", slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "第3正規形と BCNF の違いは？",
    a: "3NF は非キー属性の推移従属を排除しますが、候補キーが複数ある場合の候補キー間の従属は許容します。BCNF はさらにその候補キー間の従属も排除するので、より厳密です。",
  },
  {
    q: "なぜ実務では 3NF で止めることが多いのですか？",
    a: "3NF は更新時異常の大半を排除しつつスキーマの複雑度が過大にならないバランス点であり、BCNF 以上は現実の業務モデルで問題になる頻度が下がるためです。",
  },
  {
    q: "3NF を満たしていることをどう判定しますか？",
    a: "各非キー属性について「候補キー以外の別の非キー属性から関数従属していないか」を確認します。していれば推移従属なので、その従属関係を別テーブルに切り出します。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>第3正規形のルール: 「別の列を経由して決まる列」を追い出す</h2>
      <p>
        第3正規形 (3NF) のルールは 2 つ。
      </p>
      <ul>
        <li>まず <Link href="/data-modeling/normalization/2nf">第2正規形</Link> を満たしていること</li>
        <li>
          主キー以外の列が、<strong>別の「主キーでない列」を経由して決まっている</strong> 状態があってはいけない。
        </li>
      </ul>
      <p>
        「経由して決まる」を専門用語で <strong>推移関数従属</strong> (transitive functional dependency) と呼ぶ。
        <code>注文ID → 顧客ID → 顧客名</code> のように、真ん中の 顧客ID (主キーではない列) を挟んで
        注文ID から顧客名が「間接的に」決まっているような状態。
        こうなっていると同じ顧客の情報が注文の数だけ何度も繰り返され、
        <Link href="/data-modeling/normalization/why">更新時異常</Link> の原因になる。
      </p>

      <h2>実践例: 2NF まで進めた受注テーブル</h2>
      <p>
        <Link href="/data-modeling/normalization/2nf">前ページ</Link> で 2NF に進めた結果、
        受注データは <strong>受注 / 商品 / 受注明細</strong> の 3 テーブルに分かれた。
        このうち <strong>商品</strong> と <strong>受注明細</strong> はもう分析するべき従属関係は残っていない。
        問題は <strong>受注</strong> テーブル — ここに顧客関連の列 (顧客名・顧客住所) がまだ残っており、
        これが 3NF で扱う対象になる。
      </p>

      <h3>実データで見る冗長: 顧客ID が同じ行で顧客名・顧客住所が繰り返される</h3>
      <p>
        まず 2NF 受注テーブルを、列がどう決まっているかで色分けして眺める。
        すると「同じ顧客ID の行で顧客名・顧客住所が全く同じ値を繰り返している」ことが目で見える。
        これは 2NF まで進めても残っている冗長で、次に「なぜこうなるか」を関数従属で分析する。
      </p>

      <FDColorTable
        title="2NF 受注テーブル (列を決定関数で色分け)"
        name="受注 (2NF)"
        columns={[
          { name: "注文ID", group: "pk", isPk: true },
          { name: "注文日", group: "direct" },
          { name: "顧客ID", group: "direct" },
          { name: "顧客名", group: "transitive" },
          { name: "顧客住所", group: "transitive" },
        ]}
        rows={[
          ["O001", "2026-06-01", "C01", "田中商事", "東京"],
          ["O002", "2026-06-02", "C02", "山田工業", "大阪"],
          ["O003", "2026-06-03", "C01", "田中商事", "東京"],
        ]}
        groups={GROUPS_3NF}
        caption="● の列 (顧客名・顧客住所) は、■ の 顧客ID が同じなら必ず同じ値になる (O001 と O003 は共に C01 なので田中商事/東京)。これは顧客の情報が「注文行ごとに複製されている」ことを意味する。"
      />

      <h3>関数従属で分析すると推移経路が見つかる</h3>
      <p>
        上で見えた冗長がなぜ起きているかを関数従属で分析すると、
        <code>注文ID → 顧客ID → 顧客名/顧客住所</code> という
        <strong>非キー属性を経由した</strong> 従属経路が見えてくる。
      </p>

      <FDGroupBoxes
        title="2NF 受注テーブルの関数従属分析"
        groups={[
          {
            kind: "full",
            label: "◆ 注文ID → 注文日, 顧客ID",
            note: "主キーから直接決まる",
            determinant: ["注文ID"],
            dependents: ["注文日", "顧客ID"],
          },
          {
            kind: "full",
            label: "▲ 顧客ID → 顧客名, 顧客住所",
            note: "顧客ID は非キー属性 — この従属が推移の原因になる",
            determinant: ["顧客ID"],
            dependents: ["顧客名", "顧客住所"],
          },
          {
            kind: "transitive",
            label: "● 注文ID → (顧客ID経由) → 顧客名, 顧客住所",
            note: "非キー属性 顧客ID を経由した推移関数従属 = 3NF 違反",
            determinant: ["注文ID"],
            dependents: ["顧客名", "顧客住所"],
          },
        ]}
        caption="顧客ID は候補キーではない (受注テーブルの候補キーは 注文ID)。それなのに顧客ID から顧客名・顧客住所が決まっている。つまり注文ID → 顧客名・顧客住所は「注文ID → 顧客ID → 顧客名/顧客住所」という経由でしか成立しておらず、これが 3NF が排除したい推移関数従属。"
      />

      <h2>3NF 化: 経由先を別テーブルに切り出す</h2>
      <p>
        経由の元 (顧客ID) と経由先 (顧客名・顧客住所) をまとめて <strong>顧客</strong> テーブルとして独立させる。
        受注テーブル側には <code>顧客ID</code> だけを残しておけば、
        顧客の詳細が知りたい時は顧客テーブルを見に行けば分かる。
      </p>

      <TableBeforeAfter
        title="2NF → 3NF: 顧客関連を別テーブルに"
        beforeLabel="2NF 受注 (顧客情報が入っている)"
        afterLabel="3NF 化後 (受注 と 顧客 に分割 — 色は分割前と同じグループを維持)"
        colorGroups={GROUPS_3NF}
        before={{
          name: "受注 (2NF)",
          columns: ["注文ID", "注文日", "顧客ID", "顧客名", "顧客住所"],
          rows: [
            ["O001", "2026-06-01", "C01", "田中商事", "東京"],
            ["O002", "2026-06-02", "C02", "山田工業", "大阪"],
            ["O003", "2026-06-03", "C01", "田中商事", "東京"],
          ],
          primaryKey: ["注文ID"],
          columnGroups: {
            注文ID: "pk",
            注文日: "direct",
            顧客ID: "direct",
            顧客名: "transitive",
            顧客住所: "transitive",
          },
        }}
        after={[
          {
            name: "受注",
            columns: ["注文ID", "注文日", "顧客ID"],
            rows: [
              ["O001", "2026-06-01", "C01"],
              ["O002", "2026-06-02", "C02"],
              ["O003", "2026-06-03", "C01"],
            ],
            primaryKey: ["注文ID"],
            columnGroups: {
              注文ID: "pk",
              注文日: "direct",
              顧客ID: "direct",
            },
          },
          {
            name: "顧客",
            columns: ["顧客ID", "顧客名", "顧客住所"],
            rows: [
              ["C01", "田中商事", "東京"],
              ["C02", "山田工業", "大阪"],
            ],
            primaryKey: ["顧客ID"],
            columnGroups: {
              顧客ID: "direct",
              顧客名: "transitive",
              顧客住所: "transitive",
            },
          },
        ]}
        legend={
          <>
            推移的に決まっていた顧客名・顧客住所を <strong>顧客</strong> テーブルに集約。
            受注テーブルには <code>顧客ID</code> だけが残る。
            これで顧客の名前や住所を変更する時も 1 行だけ更新すれば、
            その顧客が持つ全ての注文の表示に自動で反映される。
          </>
        }
      />

      <h2>3NF 化 完了後のスキーマ全体像</h2>
      <p>
        <Link href="/data-modeling/normalization/1nf">1NF</Link> から出発して、
        <Link href="/data-modeling/normalization/2nf">2NF</Link>・3NF と分割してきた結果、
        最終的に以下の <strong>4 テーブル</strong> のスキーマになる。
      </p>
      <ul>
        <li><code>受注 (注文ID, 注文日, 顧客ID)</code> — 注文そのものの事実</li>
        <li><code>顧客 (顧客ID, 顧客名, 顧客住所)</code> — 顧客マスタ</li>
        <li><code>商品 (商品ID, 商品名, 単価)</code> — 商品マスタ</li>
        <li><code>受注明細 (注文ID, 商品ID, 数量)</code> — 注文と商品の関連</li>
      </ul>
      <p>
        非1NF スプレッドシートに詰め込まれていたデータが、3 段階の正規化を経て、
        「顧客の事実は顧客テーブルに 1 度」「商品の事実は商品テーブルに 1 度」「注文の事実は受注テーブルに 1 度」
        という <strong>一事実一箇所</strong> の構造になった。
      </p>

      <h2>練習問題</h2>
      <p>
        別のデータで自分でも試してみる。答えを見る前にどこに推移があるか考えてみてほしい。
      </p>

      <Practice
        title="社員テーブルを 3NF にする"
        question={
          <>
            以下は社員と所属部署を 1 つの表にまとめたもの (2NF は満たしている)。
            主キーは <code>社員ID</code> の単一主キー。
            推移関数従属を見つけ、3NF に分割せよ。
          </>
        }
        problem={{
          name: "社員 (2NF)",
          columns: ["社員ID", "氏名", "部署ID", "部署名", "部署所在地"],
          rows: [
            ["E001", "山田", "D01", "営業部", "東京"],
            ["E002", "田中", "D01", "営業部", "東京"],
            ["E003", "佐藤", "D02", "開発部", "大阪"],
            ["E004", "鈴木", "D03", "人事部", "東京"],
          ],
          primaryKey: ["社員ID"],
        }}
        answer={
          <>
            <p className="mb-2">
              関数従属の分析:
            </p>
            <ul className="text-xs list-disc pl-5 space-y-1 mb-3">
              <li><code>社員ID → 氏名, 部署ID</code> (直接)</li>
              <li><code>部署ID → 部署名, 部署所在地</code> (部署ID は非キー属性)</li>
              <li><code>社員ID → 部署名, 部署所在地</code> (推移 = 3NF 違反)</li>
            </ul>
            <p>
              部署関連 (部署名・部署所在地) を <strong>部署</strong> テーブルに切り出し、
              社員テーブルには <code>部署ID</code> だけを外部キーとして残す。
            </p>
          </>
        }
        answerTables={[
          {
            name: "社員",
            columns: ["社員ID", "氏名", "部署ID"],
            rows: [
              ["E001", "山田", "D01"],
              ["E002", "田中", "D01"],
              ["E003", "佐藤", "D02"],
              ["E004", "鈴木", "D03"],
            ],
            primaryKey: ["社員ID"],
          },
          {
            name: "部署",
            columns: ["部署ID", "部署名", "部署所在地"],
            rows: [
              ["D01", "営業部", "東京"],
              ["D02", "開発部", "大阪"],
              ["D03", "人事部", "東京"],
            ],
            primaryKey: ["部署ID"],
          },
        ]}
      />

      <h2>3NF の先には BCNF もあるが…</h2>
      <p>
        3NF より少し厳密な <strong>ボイス・コッド正規形 (BCNF)</strong> というものもある。
        3NF が排除しきれない特殊なケース (候補キーが複数あって、その候補キー同士に従属関係があるとき) をカバーする。
      </p>
      <p>
        ただし現実の業務モデルではこの特殊ケースは滅多に問題にならないため、
        <strong>実務では 3NF まで進めば十分</strong> とされることが多い。
        BCNF の詳しい話は別トピックで扱う予定 (現状は未収録)。
      </p>

      <h2>3NF まで進めるとこんな良いことがある</h2>
      <ul>
        <li>「同じ情報を複数の場所に書く」問題がほぼ解消され、更新時異常の心配がなくなる</li>
        <li>顧客・商品・部署のような「マスタ (基準情報)」が自然に独立したテーブルになる</li>
        <li>その後の外部キー制約・インデックス設計・トランザクション設計といった議論が単純になる</li>
      </ul>

      <p>
        ここまで進めた上で、性能上どうしても必要な箇所についてだけ、
        意識的に冗長を戻す <Link href="/data-modeling/normalization/denormalization">非正規化</Link>
        を検討するのが実務の定番の流れ。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
