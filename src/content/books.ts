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
    title: "達人に学ぶDB設計 徹底指南書",
    author: "ミック",
    amazonUrl: "https://www.amazon.co.jp/dp/4798124702",
    description:
      "テーブル設計と正規化、パフォーマンス考慮のインデックス設計まで実務レベルで学べる定番書。",
    topics: ["btree", "clustered", "composite", "cost", "covering"],
  },
  {
    id: "tatsujin-sql",
    title: "達人に学ぶSQL徹底指南書",
    author: "ミック",
    amazonUrl: "https://www.amazon.co.jp/dp/4798157821",
    description:
      "SQLの本質的な使い方と、インデックスが効くクエリの書き方を学べる。",
    topics: ["btree", "composite", "explain"],
  },
  {
    id: "sql-antipatterns",
    title: "SQLアンチパターン",
    author: "Bill Karwin",
    amazonUrl: "https://www.amazon.co.jp/dp/4873115892",
    description:
      "実務でやりがちなSQL・DB設計のアンチパターンとその回避策を体系的に学べる。",
    topics: ["btree", "composite", "unique", "cost"],
  },
  {
    id: "postgres-internals",
    title: "内部構造から学ぶPostgreSQL",
    author: "勝俣智成 ほか",
    amazonUrl: "https://www.amazon.co.jp/dp/4297100892",
    description:
      "PostgreSQLの内部構造・ストレージ・インデックス機構を丁寧に解説。",
    topics: ["btree", "hash", "clustered", "partial", "statistics"],
  },
  {
    id: "ipa-db-specialist",
    title: "情報処理教科書 データベーススペシャリスト",
    author: "三好康之",
    amazonUrl: "https://www.amazon.co.jp/dp/429514444X",
    description:
      "IPAデータベーススペシャリスト試験の総合対策書。インデックス関連は本サイトと合わせて学ぶと理解が深まる。",
    topics: ["explain", "statistics", "cost", "covering", "partial"],
  },
  {
    id: "db-jissen-nyumon",
    title: "データベース実践入門",
    author: "奥野幹也",
    amazonUrl: "https://www.amazon.co.jp/dp/4774170976",
    description:
      "リレーショナルモデルからインデックス設計まで、実務で使える視点で解説。",
    topics: ["clustered", "composite", "unique"],
  },
];

export function booksForTopic(slug: string): Book[] {
  return books.filter((b) => b.topics.includes(slug)).slice(0, 3);
}
