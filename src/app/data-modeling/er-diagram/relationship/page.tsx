import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
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

      <h2>関連の 3 要素: 線・カーディナリティ・(必要なら) 役割名</h2>
      <p>
        ER 図の関連は、エンティティ (箱) 同士を <strong>線</strong> で繋いで、両端に{" "}
        <Link href="/data-modeling/er-diagram/cardinality">カーディナリティ (多重度)</Link>
        と{" "}
        <Link href="/data-modeling/er-diagram/optionality">参加制約</Link>
        の記号を置くだけでよい。役割名 (`所属` などの動詞) を書くかは場合による:
      </p>
      <ul>
        <li>
          <strong>単純な 1 関連なら省略される</strong>ことが多い。エンティティ名だけで意味が読み取れるため
          (現代の dbdiagram / DrawSQL / ChartDB 等の作図ツールの既定でも省略が普通)
        </li>
        <li>
          <strong>同じエンティティ間に複数の関連があるとき</strong> は、役割名で線を区別する必要がある (次節)
        </li>
        <li>
          <strong>自己参照 (再帰関連) のとき</strong> も、方向と意味を明示するため役割名が必須 (後述)
        </li>
      </ul>

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
        <strong>それぞれ独立した関連として別々の線</strong> で描き、必ず <strong>役割名</strong> で区別する。
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

      <h2>変なER図 との対応: 違和感 #6「所属」と「住む」が並行して引かれている</h2>
      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> では、
        「入居者」と「部屋」の間に <strong>「住む」</strong> と <strong>「所属」</strong> の 2 本の線が引かれている。
        どちらも役割名は付いているように見えるが、実際何の違いがあるのか
        図から読み取れない。この 2 本を厳密に語り分けられるのが、ER 図が読める人の第一歩。
      </p>

      <h2>変なER図 との対応: 違和感 #7 循環参照</h2>
      <p>
        変なER図 の「入居者 → 保証人」の関連は、実は保証人が入居者と同じ性質のエンティティで、
        しかも保証対象入居者ID を保証人が持ち、入居者も保証人ID を持ち…と互いに参照している。
        これは <strong>自己参照 (再帰関連)</strong> で書くべきところを別エンティティに分解した結果、
        方向と参加制約が定義できず無限にたどれるようになってしまった状態。
      </p>
      <p>
        自己参照で書き直せば、「入居者 → 保証する入居者 (別の 1 人)」という有向・任意参加の再帰関連として明示できる。
        トップ層の入居者 (保証人を持たない人) の存在も参加制約で表現できる。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
