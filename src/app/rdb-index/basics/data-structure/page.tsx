import type { Metadata } from "next";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { PageStorageViz } from "@/components/viz/PageStorageViz";
import { StorageHierarchyViz } from "@/components/viz/StorageHierarchyViz";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "data-structure";
const topic = findTopic(slug)!;

export const metadata: Metadata = {
  title: topic.shortTitle,
  description: topic.summary,
  alternates: { canonical: topic.path },
};

const faq = [
  {
    q: "「ページ」と「ブロック」は同じもの？",
    a: "厳密にはOS/ディスク側のI/O単位が「ブロック」、DB側のI/O単位が「ページ」だが、実務ではほぼ同じ意味で使われる。Oracleだけ「データブロック」と呼び、それが他DBのページに相当する。本サイトでは「ページ」で統一している。",
  },
  {
    q: "1ページのサイズは何バイト？",
    a: "PostgreSQLのデフォルトは8KB、MySQL(InnoDB)は16KB、SQL Serverは8KBが標準。RDBMSと設定によって変わるが、目安として「数KB〜数十KB」と覚えておけばよい。",
  },
  {
    q: "エクステントって毎回意識する必要ある？",
    a: "日々のSQLチューニングでは不要。ただし「なぜ範囲検索が連続領域なら速いか」「大量ロード後にVACUUMが必要な理由」といった物理的な話題では避けて通れない概念。IPAデータベーススペシャリスト試験でも頻出。",
  },
  {
    q: "1テーブルは必ず1ファイルに入っている？",
    a: "PostgreSQLとMySQL InnoDB (`innodb_file_per_table=ON`) では概ねYES（PostgreSQLは1GB超で自動分割）。SQLiteはDB全体で1ファイル。Oracle/SQL Serverは「テーブルスペース」「ファイルグループ」の仕組みで複数ファイルにまたがる設計もある。",
  },
  {
    q: "行IDはどう表記される？",
    a: "PostgreSQLではCTID（例: (0,1)）、Oracle/MySQL InnoDBではROWID相当のもの、SQL Serverでは(File, Page, Slot)の組。名前は違うが意味は同じで、ページ番号とページ内オフセットで1行を特定する。",
  },
  {
    q: "インデックスの葉ノードには何が入っている？",
    a: "検索キーとそれに対応する行IDが入っている。インデックスから取得した行IDを使って、テーブル本体の該当ページを読み出す。カバリングインデックスの場合はここに追加のカラム値も含める。",
  },
];

export default function Page() {
  return (
    <TopicLayout slug={slug}>
      <TopicJsonLd slug={slug} faq={faq} />

      <h2>物理ストレージは 4 階層</h2>
      <p>
        RDBが扱うテーブルは、単なる行の一覧ではありません。実際にはディスク上で
        <strong>ファイル → エクステント → ページ → 行</strong>の入れ子構造で保存されています。
        インデックスの探索やフルスキャンの速さは、最終的にこの階層のどこにどれだけアクセスするかで決まります。
      </p>

      <StorageHierarchyViz />

      <p className="text-sm text-[var(--muted-foreground)]">
        <strong>用語の注意</strong>: OS/ディスク側で「ブロック」と呼ばれる単位と、DB側の「ページ」はほぼ同じ意味で使われる。Oracleだけ「データブロック」という呼び方をするが、指しているものは他DBの「ページ」と同じ。本サイトでは以降「ページ」で統一する。
      </p>

      <h2>ファイル: 1テーブルは基本 1ファイル</h2>
      <p>
        <strong>1テーブルは概ね1つのファイル</strong>にマップされます。
        ただしテーブルスペースやファイルグループなどの仕組みで、1テーブルが複数ファイルにまたがる設計もあります。
      </p>

      <h2>エクステント: ページの束・割り当ての単位</h2>
      <p>
        テーブルに新しい行を挿入していくと、ページが埋まってきて追加の領域が必要になります。
        このときDBは 1 ページずつではなく <strong>連続した複数ページをまとめて</strong>確保します。
        この束が <strong>エクステント</strong> です。
      </p>
      <p>
        エクステントを意識することで、
        「<a href="/rdb-index/clustered">クラスタ化インデックス</a>の範囲検索がなぜシーケンシャルI/Oで済むのか」が物理的に理解できます。連続するページが同一エクステント内にあれば、ディスクヘッドを大きく動かさずに読める（あるいはSSDでも先読みが効く）からです。
      </p>

      <h2>ページ: ディスクとメモリのやり取りの単位</h2>
      <p>
        DBがディスクから読むときも、書くときも、単位はいつも <strong>1ページまるごと</strong>。
        1バイトだけ欲しくても、そのバイトが入っているページ全体を読み込みます。
        だから「1ページに何行入っているか」がパフォーマンスの直接的な決定要因になります。
      </p>

      <PageStorageViz />

      <h2>行ID: 1行を指すポインタ</h2>
      <p>
        あるカラム値ではなく <strong>物理的に1行を指す</strong> ためのIDが行IDです。
        中身は
        <code>(ページ番号, ページ内オフセット)</code>
        の組。RDBMSごとに呼び方は違いますが、意味はどれも同じです。
      </p>
      <p>
        なぜこれが重要かというと、<strong>インデックスの実体は「キー → 行ID」のマッピング</strong>だからです。
        インデックスを引くと行IDが返ってきて、そのIDが指すページを1回読めば目的の行にたどり着けます。
        インデックス探索が速いのは、この「1回のページ読み込みで済む」という物理的な事実に支えられています。
      </p>

      <h2>この理解が効いてくる場面</h2>
      <ul>
        <li>
          <a href="/rdb-index/btree">B-tree</a>: 葉ノードから行IDを引き、その行が入っているページを1回読む。
        </li>
        <li>
          <a href="/rdb-index/clustered">クラスタ化インデックス</a>: テーブル本体のページ並びそのものがキー順になっていて、連続エクステントを一気に読める。
        </li>
        <li>
          <a href="/rdb-index/covering">カバリングインデックス</a>: 必要な列がインデックス側に入っているから、テーブル本体のページを読まなくていい。
        </li>
        <li>
          <a href="/rdb-index/cost">インデックスのコスト</a>: 1回のランダムページ読み取りは連続読み取りの数十〜数百倍遅い、というのが更新コスト議論の前提。
        </li>
      </ul>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
