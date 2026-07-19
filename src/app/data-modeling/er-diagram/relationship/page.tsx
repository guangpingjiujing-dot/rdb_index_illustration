import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";
import { findTopic } from "@/content/topics";

const slug = "relationship";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "同じエンティティ間に複数の関連を描いてもいいですか？",
    a: "描いてもよい。むしろ現実には頻繁に発生する (社員と部署の間に「所属」と「監査対象」の 2 つの関連など)。ただし必ず役割名を付けて 2 本の線を区別すること。",
  },
  {
    q: "自己参照 (再帰関連) はどう描きますか？",
    a: "同じエンティティから同じエンティティに戻る線を描く。役割名を必ず付ける (社員が上司 = 別の社員を持つなら「上司」など)。参加制約 (トップ層の社員には上司がいない = 任意参加) の記号も忘れずに。",
  },
  {
    q: "関連にも属性を持たせられますか？",
    a: "持たせられる。「学生 —履修— 科目」の関連に「履修年度」「成績」といった属性を付ける場合、それは連関実体 (履修) として独立させたほうが実装しやすい。詳細は [多対多と連関実体](/data-modeling/er-diagram/many-to-many) を参照。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 「社員は部署に所属する」</h2>
      <p>
        会社の組織を考える。「社員」と「部署」があり、
        「社員は必ず 1 つの部署に所属している」というルールがある。
        これを ER 図に描くと、こうなる。
      </p>

      <ERDiagram
        title="社員 — 所属 — 部署 (基本形)"
        width={800}
        height={260}
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
            x: 520,
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
        caption="1 本の線が 1 つの関連 = 「社員は部署に所属する」を表す。カーディナリティは 社員側 (many) + 部署側 (one) で「1 部署に多数の社員が所属」を意味する。"
      />

      <h2>関連の 2 要素: 線とカーディナリティ</h2>
      <p>
        ER 図の関連は、エンティティ (箱) 同士を <strong>線</strong> で繋いで、両端に{" "}
        <Link href="/data-modeling/er-diagram/cardinality">カーディナリティ (多重度)</Link>
        と{" "}
        <Link href="/data-modeling/er-diagram/optionality">参加制約</Link>
        の記号を置くだけでよい。線の意味はエンティティ名の組み合わせから読み取れる (「社員」と「部署」を線で繋げば、意味は「所属」以外ありえない)。
      </p>

      <h3>カーディナリティの 3 種類 (要点)</h3>
      <p>
        カーディナリティは「片方から見て、もう片方は何個と結び付くか」を規定する数の制約。
        3 種類だけ覚えれば ER 図はほぼ読める:
      </p>
      <ul>
        <li>
          <strong>1:1</strong> — 両側とも「多くて 1」。社員と社員証など、物理 1:1 対応
        </li>
        <li>
          <strong>1:N</strong> — 片側「1」、もう片側「複数」。部長と部下、部署と社員など (最頻出パターン)
        </li>
        <li>
          <strong>N:M</strong> — 両側とも「複数」。学生と履修科目など。
          必ず <Link href="/data-modeling/er-diagram/many-to-many">連関実体</Link> に分解する
        </li>
      </ul>
      <p className="text-sm text-[var(--muted-foreground)]">
        IE 記法の記号 (縦棒・鳥足・○) の対応や、5 種類 (1 / 0..1 / 1..N / 0..N / N..M) の記号早見表、
        FK の置き場所まで詳しくは{" "}
        <Link href="/data-modeling/er-diagram/cardinality">カーディナリティ ページ</Link> を参照。
      </p>

      <h2>同じエンティティ間に複数の関連があるとき</h2>
      <p>
        現実の業務では、同じ 2 つのエンティティの間に <strong>意味の違う複数の関連</strong> が発生する。
        例えば、社員と部署の間には所属だけでなく、以下のようなケースが考えられる:
      </p>
      <ul>
        <li>「社員は部署に <strong>所属する</strong>」(1 部署に多数の社員)</li>
        <li>「社員は他部署の <strong>監査を担当する</strong>」(監査担当は複数部署を掛け持ち可)</li>
        <li>「社員は部署の <strong>責任者 (部長)</strong> である」(1 部署に責任者は 1 人か 0 人)</li>
      </ul>
      <p>
        これらを 1 本の線にまとめると意味が混ざってしまうので、
        <strong>それぞれ独立した関連として別々の線</strong> で描く。
        この <strong>複数線を区別するときに限って、線の上に「所属」「監査」などの役割名を付ける</strong>。
        単純な 1 本線の場合は役割名は不要 (エンティティ名の組み合わせで意味が確定するため)。
      </p>

      <p>
        3 つの関連は、それぞれカーディナリティが違うため、実装 (FK の置き場所) も別々になる。
        図には <strong>FK として現れる列</strong>と、多対多を分解するための{" "}
        <Link href="/data-modeling/er-diagram/many-to-many">連関実体</Link>
        <code>監査担当</code> を含めて描く。
      </p>

      <ERDiagram
        title="役割名で複数の関連を区別する (FK と連関実体も明示)"
        width={1000}
        height={500}
        entities={[
          {
            id: "emp2",
            label: "社員",
            x: 60,
            y: 60,
            width: 240,
            attributes: ["社員ID", "氏名", "所属部署ID"],
            primaryKey: ["社員ID"],
          },
          {
            id: "dept2",
            label: "部署",
            x: 700,
            y: 60,
            width: 240,
            attributes: ["部署ID", "部署名", "責任者社員ID"],
            primaryKey: ["部署ID"],
          },
          {
            id: "audit",
            label: "監査担当",
            x: 380,
            y: 320,
            width: 240,
            attributes: ["社員ID", "部署ID"],
            primaryKey: ["社員ID", "部署ID"],
            isWeak: true,
          },
        ]}
        relationships={[
          {
            from: "emp2",
            to: "dept2",
            fromCardinality: "one-many",
            toCardinality: "one",
            label: "所属",
          },
          {
            from: "emp2",
            to: "dept2",
            fromCardinality: "one",
            toCardinality: "zero-one",
            label: "責任者",
            dashed: true,
          },
          {
            from: "emp2",
            to: "audit",
            fromCardinality: "one",
            toCardinality: "zero-many",
            isIdentifying: true,
          },
          {
            from: "dept2",
            to: "audit",
            fromCardinality: "one",
            toCardinality: "zero-many",
            isIdentifying: true,
          },
        ]}
        caption="「所属」= 社員に 所属部署ID (FK)、「責任者」= 部署に 責任者社員ID (FK)、「監査」= 多対多なので連関実体 監査担当 を挟む。役割名がないと、どの線がどの意味か区別できなくなる。"
      />

      <h2>自己参照 (再帰関連)</h2>
      <p>
        関連はエンティティが <strong>自分自身と繋がる</strong> こともある。よくある例は「社員の上司も別の社員」:
      </p>

      <ERDiagram
        title="自己参照: 社員が別の社員 (上司) を持つ"
        width={700}
        height={280}
        entities={[
          {
            id: "emp2",
            label: "社員",
            x: 100,
            y: 80,
            width: 260,
            attributes: ["社員ID", "氏名", "上司ID"],
            primaryKey: ["社員ID"],
          },
        ]}
        relationships={[
          {
            from: "emp2",
            to: "emp2",
            fromCardinality: "one-many",
            toCardinality: "zero-one",
            label: "上司",
          },
        ]}
        caption="社員から社員へループ。両端のカーディナリティ (上司側は 1 人 or 0 人 = 社長は上司なし、部下側は複数) と役割名を必ず明示する。"
      />

      <h2>変なER図 との対応: 違和感 #1 循環参照</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([1])} />
      </div>

      <p>
        変なER図 の「カテゴリ ⇔ サブカテゴリ」の関連は、実はサブカテゴリがカテゴリと同じ性質のエンティティで、
        しかも サブカテゴリID をカテゴリが持ち、親カテゴリID をサブカテゴリが持ち…と互いに参照している。
        これは <strong>自己参照 (再帰関連)</strong> で書くべきところを別エンティティに分解した結果、
        方向と参加制約が定義できず無限にたどれるようになってしまった状態。
      </p>
      <p>
        自己参照で書き直せば、「カテゴリ → 親カテゴリ (別の 1 件)」という有向・任意参加の再帰関連として明示できる。
        トップ層のカテゴリ (親を持たないルート) の存在も参加制約で表現できる。
      </p>

      <h2>変なER図 との対応: 違和感 #3「発注」と「確定」が並行して引かれている</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([3])} />
      </div>

      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> では、
        「顧客」と「注文」の間に <strong>「発注」</strong> と <strong>「確定」</strong> の 2 本の線が引かれている。
        どちらも役割名は付いているように見えるが、日本語としてほぼ同じ意味に読めてしまい、
        実際何の違いがあるのか図から読み取れない。この 2 本を厳密に語り分けられるのが、ER 図が読める人の第一歩。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
