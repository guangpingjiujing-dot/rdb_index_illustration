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

// 2NF 分析で使う「決定関数グループ」の色分け定義
// - fullkey: グレー (問題なし、基準)
// - order: アンバー (部分従属 = 注意)
// - product: ブルー (別カテゴリの部分従属)
const GROUPS_2NF = [
  {
    key: "fullkey",
    marker: "◆",
    label: "主キー全体 (注文ID, 商品ID) で決まる",
    headerBgClass: "bg-[#e5e5e2]",
    cellBgClass: "bg-[#f2f2ee]",
  },
  {
    key: "order",
    marker: "■",
    label: "注文ID だけで決まる (部分関数従属)",
    headerBgClass: "bg-[#fef1c7]",
    cellBgClass: "bg-[#fef8dd]",
  },
  {
    key: "product",
    marker: "●",
    label: "商品ID だけで決まる (部分関数従属)",
    headerBgClass: "bg-[#dbeafe]",
    cellBgClass: "bg-[#ecf3fc]",
  },
];

const slug = "2nf";
const topic = findTopic("data-modeling", slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "第2正規形は複合キーがないと関係ない？",
    a: "正しくはありません。単一属性の主キーの場合、部分関数従属が構造的に存在しえないため、1NF を満たせば自動的に 2NF も満たします。判定作業が要らないだけです。",
  },
  {
    q: "部分関数従属をどう見つけますか？",
    a: "複合主キー (A, B) を持つテーブルで、非キー属性が A 単独または B 単独で決まっていないかを一列ずつチェックします。決まっていれば部分従属です。",
  },
  {
    q: "2NF まで正規化する目的は？",
    a: "複合キーの一部にしか関係しない属性を別テーブルに切り出すことで、その属性の重複と更新時異常を排除するためです。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>部分関数従属を排除する</h2>
      <p>
        第2正規形 (2NF) の要件は次の 2 つ:
      </p>
      <ul>
        <li><Link href="/data-modeling/normalization/1nf">第1正規形</Link> を満たしている</li>
        <li><strong>すべての非キー属性が候補キー全体に完全関数従属している</strong> (候補キーの真部分集合への部分関数従属が存在しない)</li>
      </ul>
      <p>
        言い換えると、複合キーの <em>一部分</em> だけで決まってしまう非キー属性があってはいけない、ということ。
        こうした「複合キーの一部だけで決まる関係」が <strong>部分関数従属</strong> (partial functional dependency) だ。
      </p>

      <h2>題材: 1NF まで進めた受注テーブル</h2>
      <p>
        <Link href="/data-modeling/normalization/1nf">前ページ</Link> で 1NF 化した受注テーブルをそのまま使う。
        1 行が「1 注文の 1 商品」を表すフラットな表になっており、
        主キーは <code>(注文ID, 商品ID)</code> の複合キーになる (この 2 つを組み合わせないと行を一意に特定できない)。
      </p>

      <h3>実データで見る冗長: 同じ色の列で同じ値が繰り返される</h3>
      <p>
        まず 1NF 受注テーブルを、列がどう決まっているかで色分けして眺める。
        すると「同じ色の列で同じ値が何度も繰り返されている」ことが目で見える。
        これが冗長性の正体で、次に「なぜこうなるか」を関数従属で分析していく。
      </p>

      <FDColorTable
        title="1NF 受注テーブル (列を決定関数で色分け)"
        name="受注 (1NF)"
        columns={[
          { name: "注文ID", group: "fullkey", isPk: true },
          { name: "商品ID", group: "fullkey", isPk: true },
          { name: "注文日", group: "order" },
          { name: "顧客ID", group: "order" },
          { name: "顧客名", group: "order" },
          { name: "顧客住所", group: "order" },
          { name: "商品名", group: "product" },
          { name: "単価", group: "product" },
          { name: "数量", group: "fullkey" },
        ]}
        rows={[
          ["O001", "P01", "2026-06-01", "C01", "田中商事", "東京", "ノート", "300", "2"],
          ["O001", "P02", "2026-06-01", "C01", "田中商事", "東京", "ペン", "150", "1"],
          ["O002", "P01", "2026-06-02", "C02", "山田工業", "大阪", "ノート", "300", "5"],
          ["O003", "P02", "2026-06-03", "C01", "田中商事", "東京", "ペン", "150", "3"],
          ["O003", "P03", "2026-06-03", "C01", "田中商事", "東京", "消しゴム", "100", "4"],
        ]}
        groups={GROUPS_2NF}
        caption="■ の列: 同じ注文ID (O001 が 2 行, O003 が 2 行) の行では注文日・顧客情報が全く同じ値を繰り返している。● の列: 同じ商品ID (P01 が 2 行, P02 が 2 行) の行では商品名・単価が全く同じ値を繰り返している。◆ の列だけが行ごとに独自の値を持っている。"
      />

      <h3>関数従属で整理すると 3 グループになる</h3>
      <p>
        上で見えた冗長がなぜ起きているかを関数従属で分析すると、
        1NF 受注テーブルの列は以下の 3 グループにきれいに分かれる。
        この 3 グループがそのまま「2NF 化後に分かれる 3 テーブル」の原型になる。
      </p>

      <FDGroupBoxes
        title="1NF 受注テーブルの関数従属分析"
        groups={[
          {
            kind: "full",
            label: "◆ (注文ID, 商品ID) → 数量",
            note: "組み合わせで初めて決まる",
            determinant: ["注文ID", "商品ID"],
            dependents: ["数量"],
          },
          {
            kind: "partial",
            label: "■ 注文ID → 注文日, 顧客ID, 顧客名, 顧客住所",
            note: "主キーの一部 (注文ID) だけで決まる",
            determinant: ["注文ID"],
            dependents: ["注文日", "顧客ID", "顧客名", "顧客住所"],
          },
          {
            kind: "partial",
            label: "● 商品ID → 商品名, 単価",
            note: "主キーの一部 (商品ID) だけで決まる",
            determinant: ["商品ID"],
            dependents: ["商品名", "単価"],
          },
        ]}
        caption="◆ の完全関数従属は主キー全体があってはじめて決まる。■ と ● は主キーの片方だけで決まる部分関数従属 — これらが「同じ商品や同じ注文の情報が複数行に重複する」原因になっている。"
      />

      <h2>2NF 化: 部分関数従属する属性を別テーブルに切り出す</h2>
      <p>
        部分関数従属を持つ属性を、その決定関数を主キーとする別テーブルに切り出す。
        今回は 2 種類の部分従属 (注文ID を左辺・商品ID を左辺) があるので、
        テーブルは <strong>3 つ</strong> に分かれる。
      </p>

      <TableBeforeAfter
        title="1NF → 2NF: 部分関数従属を別テーブルに"
        beforeLabel="1NF 受注 (すべてフラット)"
        afterLabel="2NF 化後 (3 テーブルに分割 — 色は分割前と同じグループを維持)"
        colorGroups={GROUPS_2NF}
        before={{
          name: "受注 (1NF)",
          columns: [
            "注文ID",
            "商品ID",
            "注文日",
            "顧客ID",
            "顧客名",
            "顧客住所",
            "商品名",
            "単価",
            "数量",
          ],
          rows: [
            ["O001", "P01", "2026-06-01", "C01", "田中商事", "東京", "ノート", "300", "2"],
            ["O001", "P02", "2026-06-01", "C01", "田中商事", "東京", "ペン", "150", "1"],
            ["O002", "P01", "2026-06-02", "C02", "山田工業", "大阪", "ノート", "300", "5"],
            ["O003", "P02", "2026-06-03", "C01", "田中商事", "東京", "ペン", "150", "3"],
            ["O003", "P03", "2026-06-03", "C01", "田中商事", "東京", "消しゴム", "100", "4"],
          ],
          primaryKey: ["注文ID", "商品ID"],
          columnGroups: {
            注文ID: "fullkey",
            商品ID: "fullkey",
            注文日: "order",
            顧客ID: "order",
            顧客名: "order",
            顧客住所: "order",
            商品名: "product",
            単価: "product",
            数量: "fullkey",
          },
        }}
        after={[
          {
            name: "受注",
            columns: ["注文ID", "注文日", "顧客ID", "顧客名", "顧客住所"],
            rows: [
              ["O001", "2026-06-01", "C01", "田中商事", "東京"],
              ["O002", "2026-06-02", "C02", "山田工業", "大阪"],
              ["O003", "2026-06-03", "C01", "田中商事", "東京"],
            ],
            primaryKey: ["注文ID"],
            wide: true,
            columnGroups: {
              注文ID: "fullkey",
              注文日: "order",
              顧客ID: "order",
              顧客名: "order",
              顧客住所: "order",
            },
          },
          {
            name: "商品",
            columns: ["商品ID", "商品名", "単価"],
            rows: [
              ["P01", "ノート", "300"],
              ["P02", "ペン", "150"],
              ["P03", "消しゴム", "100"],
            ],
            primaryKey: ["商品ID"],
            columnGroups: {
              商品ID: "fullkey",
              商品名: "product",
              単価: "product",
            },
          },
          {
            name: "受注明細",
            columns: ["注文ID", "商品ID", "数量"],
            rows: [
              ["O001", "P01", "2"],
              ["O001", "P02", "1"],
              ["O002", "P01", "5"],
              ["O003", "P02", "3"],
              ["O003", "P03", "4"],
            ],
            primaryKey: ["注文ID", "商品ID"],
            columnGroups: {
              注文ID: "fullkey",
              商品ID: "fullkey",
              数量: "fullkey",
            },
          },
        ]}
        legend={
          <>
            部分関数従属を「別テーブル + 元テーブルに FK 残し」の形で切り出す。
            商品名・単価は <strong>商品</strong> テーブルに 1 行ずつ集約され、重複が解消。
            数量 (完全関数従属) だけが <strong>受注明細</strong> テーブルに残る。
            ただし <strong>受注</strong> テーブルにはまだ顧客名・顧客住所が入っており、
            同じ顧客の情報が複数行に重複している (これは <Link href="/data-modeling/normalization/3nf">3NF</Link> で解消する)。
          </>
        }
      />

      <h2>単一主キーは 2NF を自動で満たす</h2>
      <p>
        主キーが 1 つの属性だけで構成されている場合、<strong>「候補キーの真部分集合」自体が存在しない</strong> ため、
        部分関数従属が構造的に成立しえない。
        つまり <strong>単一主キーのテーブルは 1NF を満たせば自動的に 2NF も満たす</strong>。
      </p>
      <p>
        2NF 違反が発生するのは、複合キーを持つテーブルに限られる。
        中間テーブル (関連テーブル) を設計する時ほど 2NF の判定を意識する必要がある。
      </p>

      <h2>練習問題</h2>
      <p>
        別のデータで自分でも試してみる。答えを見る前にどう分割すればいいか考えてみてほしい。
      </p>

      <Practice
        title="図書貸出テーブルを 2NF にする"
        question={
          <>
            以下は図書館の貸出記録を 1NF まで整理したもの。
            主キーは <code>(会員ID, 図書ID)</code> の複合キー。
            部分関数従属を洗い出し、2NF に分割せよ。
          </>
        }
        problem={{
          name: "図書貸出 (1NF)",
          columns: ["会員ID", "図書ID", "会員名", "書名", "貸出日"],
          rows: [
            ["M01", "B001", "山田", "データベース入門", "2026-06-01"],
            ["M01", "B002", "山田", "ネットワーク基礎", "2026-06-05"],
            ["M02", "B001", "田中", "データベース入門", "2026-06-03"],
            ["M03", "B003", "佐藤", "SQL 実践", "2026-06-02"],
          ],
          primaryKey: ["会員ID", "図書ID"],
        }}
        answer={
          <>
            <p className="mb-2">
              関数従属の分析:
            </p>
            <ul className="text-xs list-disc pl-5 space-y-1 mb-3">
              <li><code>会員ID → 会員名</code> (部分関数従属)</li>
              <li><code>図書ID → 書名</code> (部分関数従属)</li>
              <li><code>(会員ID, 図書ID) → 貸出日</code> (完全関数従属)</li>
            </ul>
            <p>
              会員関連 (会員名) と 図書関連 (書名) をそれぞれ別テーブルに切り出し、
              貸出テーブルには複合キーと貸出日のみを残す形で 3 テーブルに分割する。
            </p>
          </>
        }
        answerTables={[
          {
            name: "貸出",
            columns: ["会員ID", "図書ID", "貸出日"],
            rows: [
              ["M01", "B001", "2026-06-01"],
              ["M01", "B002", "2026-06-05"],
              ["M02", "B001", "2026-06-03"],
              ["M03", "B003", "2026-06-02"],
            ],
            primaryKey: ["会員ID", "図書ID"],
            wide: true,
          },
          {
            name: "会員",
            columns: ["会員ID", "会員名"],
            rows: [
              ["M01", "山田"],
              ["M02", "田中"],
              ["M03", "佐藤"],
            ],
            primaryKey: ["会員ID"],
          },
          {
            name: "図書",
            columns: ["図書ID", "書名"],
            rows: [
              ["B001", "データベース入門"],
              ["B002", "ネットワーク基礎"],
              ["B003", "SQL 実践"],
            ],
            primaryKey: ["図書ID"],
          },
        ]}
      />

      <h2>2NF 判定のチェックリスト</h2>
      <ol>
        <li>テーブルの候補キーを洗い出す (複合キーがあるか？)</li>
        <li>複合キーがあるなら、その真部分集合を全て列挙する</li>
        <li>各非キー属性について、真部分集合のいずれかで決まってしまわないか確認する</li>
        <li>決まってしまうなら、その真部分集合を主キーとする別テーブルへ切り出す</li>
      </ol>

      <p>
        2NF まで来れば、複合キーの一部にしか関係しない属性が重複する問題は解消される。
        しかしまだ「非キー属性同士の従属」による冗長は残る。
        今回の例で言えば、受注テーブルに <code>顧客ID → 顧客名, 顧客住所</code> という従属関係が残っている。
        これを扱うのが <Link href="/data-modeling/normalization/3nf">第3正規形</Link> だ。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
