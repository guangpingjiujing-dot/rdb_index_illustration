export type Book = {
  id: string;
  title: string;
  author: string;
  asin?: string;
  amazonUrl: string;
  cover?: string;
  description: string;
  topics: string[];
};

export const books: Book[] = [
  {
    id: "tatsujin-db-design",
    title: "達人に学ぶDB設計徹底指南書 第2版",
    author: "ミック",
    amazonUrl: "https://www.amazon.co.jp/dp/4798186627?tag=taitech-22",
    description:
      "テーブル設計と正規化、パフォーマンス考慮のインデックス設計まで実務レベルで学べる定番書。第2版ではクラウド対応も強化。",
    topics: [
      "btree",
      "clustered",
      "composite",
      "cost",
      "covering",
      "why",
      "functional-dependency",
      "keys",
      "1nf",
      "2nf",
      "3nf",
      "denormalization",
    ],
  },
  {
    id: "tatsujin-sql",
    title: "達人に学ぶSQL徹底指南書 第2版",
    author: "ミック",
    amazonUrl: "https://www.amazon.co.jp/dp/4798157821?tag=taitech-22",
    description:
      "SQLの本質的な使い方と、インデックスが効くクエリの書き方を学べる。ウィンドウ関数など現代SQLも網羅。",
    topics: ["btree", "composite", "explain"],
  },
  {
    id: "sql-antipatterns",
    title: "SQLアンチパターン 第2版",
    author: "Bill Karwin",
    amazonUrl: "https://www.amazon.co.jp/dp/4814400748?tag=taitech-22",
    description:
      "実務でやりがちなSQL・DB設計のアンチパターンとその回避策を体系的に学べる。",
    topics: ["btree", "composite", "unique", "cost", "denormalization"],
  },
  {
    id: "postgres-internals",
    title: "[改訂3版]内部構造から学ぶPostgreSQL",
    author: "勝俣智成 ほか",
    amazonUrl: "https://www.amazon.co.jp/dp/4297132060?tag=taitech-22",
    description:
      "PostgreSQLの内部構造・ストレージ・インデックス機構を丁寧に解説。設計と運用計画の鉄則が学べる。",
    topics: ["btree", "hash", "clustered", "partial", "statistics"],
  },
  {
    id: "ipa-db-specialist",
    title: "情報処理教科書 データベーススペシャリスト 2025年版",
    author: "三好康之",
    amazonUrl: "https://www.amazon.co.jp/dp/4798190934?tag=taitech-22",
    description:
      "IPAデータベーススペシャリスト試験の総合対策書。インデックス関連は本サイトと合わせて学ぶと理解が深まる。",
    topics: [
      "explain",
      "statistics",
      "cost",
      "covering",
      "partial",
      "functional-dependency",
      "keys",
      "1nf",
      "2nf",
      "3nf",
    ],
  },
  {
    id: "db-jissen-nyumon",
    title: "理論から学ぶデータベース実践入門",
    author: "奥野幹也",
    amazonUrl: "https://www.amazon.co.jp/dp/4774171972?tag=taitech-22",
    description:
      "リレーショナルモデルの理論から、インデックス設計を含む実務で使えるSQLまで解説。",
    topics: [
      "clustered",
      "composite",
      "unique",
      "why",
      "functional-dependency",
      "1nf",
      "2nf",
      "3nf",
    ],
  },
];

export function booksForTopic(slug: string): Book[] {
  const matching = books.filter((b) => b.topics.includes(slug));
  const rest = books.filter((b) => !b.topics.includes(slug));
  return [...matching, ...rest];
}
