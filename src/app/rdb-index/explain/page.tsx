import type { Metadata } from "next";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "explain";
const topic = findTopic("rdb-index", slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "EXPLAINとEXPLAIN ANALYZEの違いは？",
    a: "EXPLAINは見積り（コスト・行数）だけを返しますが、EXPLAIN ANALYZEは実際にクエリを実行して実測時間・実測行数も表示します。本番でANALYZEを実行するとデータの更新も走るので注意（SELECTなら基本的に問題なし）。",
  },
  {
    q: "計画の中で見るべきポイントは？",
    a: "アクセス方法（Seq/Index/Hash）、コスト、推定行数と実行数の乖離、結合方法、行の増減が起きる場所。特に「推定と実測の乖離が大きい」場所は統計情報が古い or 相関を捉えられていない可能性が高い。",
  },
  {
    q: "全表スキャンが出たら必ずインデックスを貼るべき？",
    a: "件数が少ないテーブルや、対象行の割合が高いクエリでは全表スキャンの方が速いこともあります。EXPLAINは判断材料であって、コストと行数を見て総合判断します。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="rdb-index" slug={slug}>
      <TopicJsonLd section="rdb-index" slug={slug} faq={faq} />

      <h2>EXPLAIN で「オプティマイザの計画表」を見る</h2>
      <p>
        クエリの前に <code>EXPLAIN</code> を付けて実行すると、DBが選んだ実行計画をツリーで返してきます。
        「どのテーブルにどうアクセスして、どの順で結合して、どうソートするか」がここに書かれていて、パフォーマンスチューニングの<strong>読み解きの起点</strong>になります。
      </p>

      <pre>{`EXPLAIN
SELECT * FROM orders
WHERE customer_id = 42;`}</pre>

      <p>出力（例）:</p>

      <pre>{` Index Scan using idx_orders_customer_id on orders
   Index Cond: (customer_id = 42)`}</pre>

      <p>
        <code>idx_orders_customer_id を使ってインデックス経由でアクセスした</code>、
        <code>customer_id = 42 という条件をインデックスにかけた</code>
        ──ということが読み取れます。もしインデックスが無ければ次のような出力になります:
      </p>

      <pre>{` Seq Scan on orders
   Filter: (customer_id = 42)`}</pre>

      <p>
        こちらは<strong>全表スキャン</strong>で、テーブルの全行を舐めながら
        <code>customer_id = 42</code> を <code>Filter</code> として適用しています。件数が多いと重くなります。
      </p>

      <h2>主なアクセス方法</h2>

      <h3>Seq Scan（全表スキャン）</h3>
      <p>
        テーブルを先頭から順に読む。インデックスがない、使えない条件（<code>LIKE &#39;%foo&#39;</code>や関数変換など）、あるいは対象行が多すぎてインデックスの方が遅い場合に選ばれます。
        RDBMSによっては「Full Table Scan」と呼ばれます。
      </p>

      <h3>Index Scan</h3>
      <p>
        <a href="/rdb-index/btree">B-tree</a> を辿って該当行の
        <a href="/rdb-index/basics/data-structure">行ID</a>{" "}
        を取得 → その行を含むページを読む方式。
        出力に <code>Index Cond:</code> が見えたら「インデックスが実際に使われている」証拠です。
      </p>

      <h3>Index Only Scan</h3>
      <p>
        <a href="/rdb-index/covering">カバリングインデックス</a>
        で、必要なカラムがインデックス側にすべて含まれていて、テーブル本体を1回も読まずに済むケース。最速のパターン。
        RDBMSによっては「Using index」と表現されます。
      </p>

      <h3>Nested Loop / Hash Join / Merge Join</h3>
      <p>
        JOINの3つの代表的なアルゴリズム。オプティマイザが両側のテーブルサイズと使えるインデックスから最適なものを選びます。
      </p>
      <ul>
        <li>
          <strong>Nested Loop</strong>: 外側を1件ずつ、内側で対応する行を探す。内側にインデックスがあると速い
        </li>
        <li>
          <strong>Hash Join</strong>: 一方でハッシュテーブルを作り、他方から突き合わせる。大量データ同士に向く
        </li>
        <li>
          <strong>Merge Join</strong>: 両側がキー順にソート済みなら効率的にマージできる
        </li>
      </ul>

      <h2>読む順番はツリーの内側から</h2>
      <p>
        実行計画は<strong>インデントが深いところ（葉）から根に向かって</strong>実行されます。
      </p>

      <pre>{` Nested Loop
   ->  Index Scan using idx_users_email      -- 先にこれ
         Index Cond: email = 'a@example.com'
   ->  Index Scan using idx_orders_customer_id  -- 次にこれ
         Index Cond: customer_id = u.id`}</pre>

      <p>
        まず外側 (users) を <code>email</code> インデックスで絞り込み、その結果1件ずつについて内側 (orders) の
        <code>customer_id</code> インデックスを引いてマッチする行を得る、という流れ。
        末端のノードから読むと理解しやすいです。
      </p>

      <h2>どこを見ればいい？（チェックリスト）</h2>
      <ol>
        <li>
          <strong>大きなテーブルに <code>Seq Scan</code></strong>{" "}
          が出ていないか → インデックス化の候補
        </li>
        <li>
          <strong>Nested Loopの内側が <code>Seq Scan</code></strong>{" "}
          になっていないか → 内側にインデックスがない典型的な低速パターン
        </li>
        <li>
          <strong>推定 rows と実測 rows の乖離</strong>{" "}
          → <a href="/rdb-index/statistics">統計情報</a>{" "}
          が古い可能性
        </li>
        <li>
          <strong>意外な JOIN アルゴリズムが選ばれていないか</strong>{" "}
          → 統計情報のずれで最適でない選択になっているかも
        </li>
      </ol>

      <h2>EXPLAIN と EXPLAIN ANALYZE</h2>
      <p>
        <code>EXPLAIN</code> はプランを<strong>見積り</strong>だけ返します（クエリは実行しません）。
        一方 <code>EXPLAIN ANALYZE</code> は<strong>実際にクエリを実行して</strong>、実測時間と実測行数も返します。
        「推定と実測の乖離」を見るには ANALYZE 必須。
      </p>
      <p>
        ただし ANALYZE は本当にクエリを実行するので、INSERT/UPDATE/DELETE 系で試すと本当にデータが変わります。SELECT で使うのが安全です。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
