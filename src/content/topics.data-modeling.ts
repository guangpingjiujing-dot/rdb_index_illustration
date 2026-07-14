export type DataModelingTopic = {
  section: "data-modeling";
  category: "normalization";
  slug: string;
  path: string;
  title: string;
  shortTitle: string;
  level: "basic" | "advanced";
  summary: string;
  definition: string;
  keywords: string[];
};

export const dataModelingTopics: DataModelingTopic[] = [
  {
    section: "data-modeling",
    category: "normalization",
    slug: "why",
    path: "/data-modeling/normalization/why",
    title: "なぜ正規化が必要か",
    shortTitle: "なぜ正規化が必要か",
    level: "basic",
    summary:
      "正規化されていないテーブルでは、同じ事実を複数の行に重複して持つために、挿入・更新・削除の各操作で矛盾や情報損失が発生する。この「更新時異常」を体系的に排除するのが正規化の目的である。",
    definition:
      "正規化とは、更新時異常 (挿入異常・更新異常・削除異常) を排除するために、リレーションを関数従属性の分析に基づいて分割し、一つの事実を一つの場所にのみ格納するデータベース設計手法である。",
    keywords: [
      "正規化",
      "データベース正規化",
      "更新時異常",
      "挿入異常",
      "更新異常",
      "削除異常",
      "データ冗長性",
      "一事実一箇所",
    ],
  },
  {
    section: "data-modeling",
    category: "normalization",
    slug: "functional-dependency",
    path: "/data-modeling/normalization/functional-dependency",
    title: "関数従属性 (Functional Dependency)",
    shortTitle: "関数従属性",
    level: "basic",
    summary:
      "属性 X の値が決まると属性 Y の値も一意に決まる関係を関数従属という。この概念は 1NF〜3NF、BCNF まで正規化の全ステップの判定基準になる。部分関数従属・推移関数従属など派生概念も整理する。",
    definition:
      "関数従属性とは、リレーション上で属性集合 X の値が定まれば属性集合 Y の値が一意に定まる関係 (X → Y と表記) であり、テーブルの意味的整合性と正規化判定の基準として用いられる概念である。",
    keywords: [
      "関数従属",
      "関数従属性",
      "functional dependency",
      "部分関数従属",
      "推移関数従属",
      "完全関数従属",
      "決定関数",
      "FD",
    ],
  },
  {
    section: "data-modeling",
    category: "normalization",
    slug: "keys",
    path: "/data-modeling/normalization/keys",
    title: "キーの階層 (スーパーキー・候補キー・主キー)",
    shortTitle: "キーの階層",
    level: "basic",
    summary:
      "正規化の議論に入る前に、スーパーキー・候補キー・主キーの3階層と、外部キー・代替キー・複合キーとの関係を整理する。2NF/3NF の「非キー属性」「部分従属」を語るための語彙を揃える。",
    definition:
      "候補キーとは、テーブルの 1 行を一意に見分けられる列の組み合わせのうち「これ以上どれか 1 つでも削ったら見分けられなくなる」最小のものをいい、その中から実装上 1 つを選んで主キーとする。",
    keywords: [
      "候補キー",
      "主キー",
      "スーパーキー",
      "代替キー",
      "複合キー",
      "外部キー",
      "極小性",
      "一意性",
    ],
  },
  {
    section: "data-modeling",
    category: "normalization",
    slug: "1nf",
    path: "/data-modeling/normalization/1nf",
    title: "第1正規形 (1NF)",
    shortTitle: "第1正規形",
    level: "basic",
    summary:
      "全ての属性がアトミック値をとり、繰り返しグループを含まない状態が第1正規形。非1NF (unnormalized form) の代表例を並置し、1NF に変換する具体的手続きを図解する。",
    definition:
      "第1正規形とは、リレーションの全ての属性が単一値 (アトミック値) を持ち、繰り返しグループや複合値を含まない状態をいい、以降の全ての正規形の前提となる最も基本的な正規形である。",
    keywords: [
      "第1正規形",
      "1NF",
      "アトミック値",
      "単一値",
      "繰り返しグループ",
      "非1NF",
      "正規化手順",
    ],
  },
  {
    section: "data-modeling",
    category: "normalization",
    slug: "2nf",
    path: "/data-modeling/normalization/2nf",
    title: "第2正規形 (2NF)",
    shortTitle: "第2正規形",
    level: "basic",
    summary:
      "複合主キーの一部分にだけ関数従属する非キー属性 (部分関数従属) を切り出して別テーブル化するのが 2NF。単一主キーのテーブルは自動的に 2NF を満たす点も整理する。",
    definition:
      "第2正規形とは、第1正規形を満たし、かつ非キー属性のすべてが候補キー全体に完全関数従属している (候補キーの一部分だけで決まる部分関数従属を持たない) リレーションの状態をいう。",
    keywords: [
      "第2正規形",
      "2NF",
      "部分関数従属",
      "完全関数従属",
      "複合キー",
      "候補キー",
      "非キー属性",
    ],
  },
  {
    section: "data-modeling",
    category: "normalization",
    slug: "3nf",
    path: "/data-modeling/normalization/3nf",
    title: "第3正規形 (3NF)",
    shortTitle: "第3正規形",
    level: "basic",
    summary:
      "非キー属性が別の非キー属性を経由して主キーに従属する「推移関数従属」を排除するのが 3NF。実務ではここまで来れば十分と言われることが多い理由も示す。",
    definition:
      "第3正規形とは、第2正規形を満たし、かつ非キー属性が候補キー以外の非キー属性を経由して関数従属していない (推移関数従属を持たない) リレーションの状態をいう。",
    keywords: [
      "第3正規形",
      "3NF",
      "推移関数従属",
      "推移的従属",
      "非キー属性",
      "候補キー",
    ],
  },
  {
    section: "data-modeling",
    category: "normalization",
    slug: "denormalization",
    path: "/data-modeling/normalization/denormalization",
    title: "非正規化とパフォーマンスの実務判断",
    shortTitle: "非正規化",
    level: "advanced",
    summary:
      "読み取り性能や運用の都合で、あえて正規化を崩す設計判断が非正規化。何を守り何を捨てるか、カバリングインデックスやマテリアライズドビューとの棲み分けまで含めて整理する。",
    definition:
      "非正規化 (denormalization) とは、参照性能や運用容易性を優先し、正規化により分割されたリレーションを意図的に冗長化または結合統合する設計手法であり、更新時異常のリスクと引き換えに読み取り効率を得る。",
    keywords: [
      "非正規化",
      "denormalization",
      "データ冗長性",
      "パフォーマンス",
      "参照性能",
      "カバリングインデックス",
      "マテリアライズドビュー",
    ],
  },
];
