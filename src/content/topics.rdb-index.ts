export type RdbTopic = {
  section: "rdb-index";
  group: "prereq" | "index-type" | "related";
  slug: string;
  path: string;
  title: string;
  shortTitle: string;
  level: "basic" | "advanced";
  summary: string;
  definition: string;
  keywords: string[];
  /** SEO 用: 指定時は <title> と OG title に使用（未指定なら shortTitle にフォールバック） */
  metaTitle?: string;
  /** SEO 用: 指定時は <meta description> と OG description に使用（未指定なら summary にフォールバック） */
  metaDescription?: string;
};

export const rdbTopics: RdbTopic[] = [
  {
    section: "rdb-index",
    slug: "why-index",
    path: "/rdb-index/basics/why-index",
    title: "なぜインデックスが必要か（フルスキャンの限界）",
    shortTitle: "なぜインデックスが必要か",
    level: "basic",
    group: "prereq",
    summary:
      "インデックスがないと何が起きるのか、フルテーブルスキャンの動きをアニメーションで体感する。",
    definition:
      "フルテーブルスキャンとは、インデックスを使わずにテーブルの先頭から末尾まで順に1行ずつ読んで条件に合う行を探す方法である。件数に比例して遅くなる。",
    keywords: ["フルスキャン", "テーブルスキャン", "SEQSCAN"],
  },
  {
    section: "rdb-index",
    slug: "data-structure",
    path: "/rdb-index/basics/data-structure",
    title: "テーブルはディスクにどう置かれているか（ファイル・ページ・行ID）",
    shortTitle: "ページと行ID",
    level: "basic",
    group: "prereq",
    summary:
      "テーブルはファイル → エクステント → ページ → 行 の階層で保存される。行IDでピンポイントに1ページだけ読む仕組みを可視化。",
    definition:
      "ページとは、RDBがディスクとメモリのやり取りに使う固定サイズの単位（多くは8KB前後）で、複数行がまとめて格納される。ページは連続した数〜数十枚をまとめたエクステント単位で割り当てられ、行ID（ROWID / CTID）はページ番号とページ内オフセットの組で1行を一意に指す。",
    keywords: [
      "ページ",
      "ブロック",
      "エクステント",
      "行ID",
      "ROWID",
      "CTID",
      "ヒープ",
      "物理I/O",
      "テーブルファイル",
    ],
  },
  {
    section: "rdb-index",
    slug: "btree",
    path: "/rdb-index/btree",
    title: "B-treeインデックス",
    shortTitle: "B-tree",
    level: "basic",
    group: "index-type",
    summary:
      "最も広く使われるインデックス。木構造をたどることで探索コストを大幅に削減する。",
    definition:
      "B-treeインデックスとは、値をソートした平衡木構造で保持し、ルートから葉ノードへ辿ることで対数時間で目的の値に到達できるインデックス方式である。",
    keywords: ["B-tree", "Bツリー", "平衡木", "対数時間"],
  },
  {
    section: "rdb-index",
    slug: "hash",
    path: "/rdb-index/hash",
    title: "ハッシュインデックス",
    shortTitle: "ハッシュ",
    level: "basic",
    group: "index-type",
    summary:
      "ハッシュ関数でバケットに振り分ける方式。等価検索は最速だが、範囲検索や並び替えはできない。",
    definition:
      "ハッシュインデックスとは、キーの値をハッシュ関数で変換し、対応するバケットに格納・参照することでO(1)相当で等価検索を行うインデックス方式である。",
    keywords: ["ハッシュインデックス", "hash", "バケット"],
  },
  {
    section: "rdb-index",
    slug: "clustered",
    path: "/rdb-index/clustered",
    title: "クラスタ化インデックス",
    shortTitle: "クラスタ化",
    level: "basic",
    group: "index-type",
    summary:
      "テーブルそのものがインデックスの順序で物理的に並ぶ方式。非クラスタ化との違いを比較する。",
    definition:
      "クラスタ化インデックスとは、テーブルの実データがインデックスキー順に物理的に並んで格納されている方式で、テーブル1つにつき1つしか作れない。",
    keywords: ["クラスタ化インデックス", "clustered", "非クラスタ", "主キー"],
  },
  {
    section: "rdb-index",
    slug: "composite",
    path: "/rdb-index/composite",
    title: "複合インデックス",
    shortTitle: "複合",
    level: "basic",
    group: "index-type",
    summary:
      "複数カラムをまとめたインデックス。カラムの順序が効きめを大きく左右する。",
    definition:
      "複合インデックス（マルチカラムインデックス）とは、2つ以上のカラムを組み合わせて1つのインデックスとして構築したもので、先頭カラム側の条件から順に効く。",
    keywords: ["複合インデックス", "マルチカラム", "先頭カラム", "カラム順"],
  },
  {
    section: "rdb-index",
    slug: "unique",
    path: "/rdb-index/unique",
    title: "ユニークインデックス",
    shortTitle: "ユニーク",
    level: "basic",
    group: "index-type",
    summary:
      "重複を許さないインデックス。主キーや制約と密接な関係を持つ。",
    definition:
      "ユニークインデックスとは、対象カラム（複合の場合は組合わせ）の値が重複しないことを保証するインデックスであり、探索の高速化と制約の両方を実現する。",
    keywords: ["ユニークインデックス", "UNIQUE", "重複", "制約"],
  },
  {
    section: "rdb-index",
    slug: "covering",
    path: "/rdb-index/covering",
    title: "カバリングインデックス",
    shortTitle: "カバリング",
    level: "advanced",
    group: "index-type",
    summary:
      "SELECT対象カラムをすべて含むインデックス。テーブル本体を読まずに完結する。",
    definition:
      "カバリングインデックスとは、クエリで参照する全カラムをインデックス側だけで賄えるように設計したもので、テーブル本体アクセス（インデックスオンリースキャン）を不要にする。",
    keywords: ["カバリングインデックス", "index only scan", "インデックスオンリースキャン"],
  },
  {
    section: "rdb-index",
    slug: "partial",
    path: "/rdb-index/partial",
    title: "部分インデックス",
    shortTitle: "部分",
    level: "advanced",
    group: "index-type",
    summary:
      "条件に合う行だけを対象にした小さなインデックス。特定パターンのクエリを効率化する。",
    definition:
      "部分インデックス（部分索引）とは、WHERE句のような条件を付けて特定行のみをインデックス化する方式で、サイズが小さく更新コストも低い。",
    keywords: ["部分インデックス", "partial index", "条件付きインデックス"],
  },
  {
    section: "rdb-index",
    slug: "explain",
    path: "/rdb-index/explain",
    title: "実行計画（EXPLAIN）の読み方",
    shortTitle: "実行計画",
    level: "advanced",
    group: "related",
    summary:
      "オプティマイザがどの方法で検索するかを示す実行計画の読み方を身につける。",
    definition:
      "実行計画（EXPLAIN）とは、クエリオプティマイザが選択したデータアクセス方法・結合順・見積り件数などを示す情報であり、パフォーマンスチューニングの起点になる。",
    keywords: ["EXPLAIN", "実行計画", "オプティマイザ", "コスト"],
  },
  {
    section: "rdb-index",
    slug: "statistics",
    path: "/rdb-index/statistics",
    title: "統計情報とオプティマイザ",
    shortTitle: "統計情報",
    level: "advanced",
    group: "related",
    summary:
      "オプティマイザは統計情報を頼りにインデックス利用を判断する。仕組みと落とし穴を理解する。",
    definition:
      "統計情報とは、テーブルやカラムの行数・値の分布・NULL率などをオプティマイザが参照する要約データであり、これが古いと実行計画が最適でなくなる。",
    keywords: ["統計情報", "オプティマイザ", "カーディナリティ", "ANALYZE"],
  },
  {
    section: "rdb-index",
    slug: "cost",
    path: "/rdb-index/cost",
    title: "インデックスのコスト（更新オーバーヘッド）",
    shortTitle: "更新コスト",
    level: "advanced",
    group: "related",
    summary:
      "インデックスは検索を速くする一方で、更新を遅くする。適切な数と設計の判断基準を学ぶ。",
    definition:
      "インデックスの更新コストとは、INSERT/UPDATE/DELETE時にインデックス側の再構成が必要になることで生じるオーバーヘッドであり、貼りすぎると全体性能を悪化させる。",
    keywords: ["更新コスト", "オーバーヘッド", "貼りすぎ", "INSERT遅い"],
  },
];
