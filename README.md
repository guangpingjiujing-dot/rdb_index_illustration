# たいてっく — RDBインデックス図解サイト

**サイト: https://taitech.dev**

RDBのインデックス（B-tree、ハッシュ、クラスタ化、複合、カバリング、部分、EXPLAIN、統計情報 …）と、データモデリング体系（正規化・ER 図）を、インタラクティブな図解＋アニメーションと厳密な定義で解説するサイト。ER 図カテゴリは「変なER図」の間違い探しから 9 つの違和感を ER 概念で言語化する構成。

- 技術構成: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + SVG
- DB: 不要（全ページ静的生成 + クライアント計算）
- デプロイ: Vercel（`main` push で自動デプロイ）

## ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 で確認できます。

## コマンド

```bash
npm run build        # 本番ビルド
npm run test:e2e     # E2E テスト（Playwright、全ページの console error/warning 検知含む）
npx tsc --noEmit    # 型チェック
```

## 環境変数

`.env.example` 参照。本番の値は Vercel Project Settings → Environment Variables で管理。

| 変数 | 説明 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 本番 URL（sitemap / OG 生成用） |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 の測定 ID（未設定なら GA タグは挿入されない） |

## ページ構成

| パス | 内容 | レベル |
|---|---|---|
| `/` | ハブランディング（たいてっくポータル） | |
| `/rdb-index` | RDB インデックス図解トップ | |
| `/rdb-index/basics/why-index` | なぜインデックスが必要か | 基礎 |
| `/rdb-index/basics/data-structure` | データがディスク上でどう並んでいるか | 基礎 |
| `/rdb-index/btree` | B-tree インデックス | 基礎 |
| `/rdb-index/hash` | ハッシュインデックス | 基礎 |
| `/rdb-index/clustered` | クラスタ化インデックス | 基礎 |
| `/rdb-index/composite` | 複合インデックス | 基礎 |
| `/rdb-index/unique` | ユニークインデックス | 基礎 |
| `/rdb-index/covering` | カバリングインデックス | 発展 |
| `/rdb-index/partial` | 部分インデックス | 発展 |
| `/rdb-index/explain` | 実行計画（EXPLAIN） | 発展 |
| `/rdb-index/statistics` | 統計情報とオプティマイザ | 発展 |
| `/rdb-index/cost` | インデックスのコスト | 発展 |
| `/data-modeling` | データモデリング体系トップ | |
| `/data-modeling/normalization` | 正規化カテゴリトップ | |
| `/data-modeling/normalization/why` | なぜ正規化が必要か | 基礎 |
| `/data-modeling/normalization/functional-dependency` | 関数従属性 | 基礎 |
| `/data-modeling/normalization/keys` | キーの階層（候補キー・主キー・スーパーキー） | 基礎 |
| `/data-modeling/normalization/1nf` | 第1正規形 (1NF) | 基礎 |
| `/data-modeling/normalization/2nf` | 第2正規形 (2NF) | 基礎 |
| `/data-modeling/normalization/3nf` | 第3正規形 (3NF) | 基礎 |
| `/data-modeling/normalization/denormalization` | 非正規化 | 発展 |
| `/data-modeling/er-diagram` | 「変なER図」— 9 つの違和感を数える ER 図の学習ハブ | |
| `/data-modeling/er-diagram/entity` | エンティティとは | 基礎 |
| `/data-modeling/er-diagram/relationship` | 関連（リレーションシップ） | 基礎 |
| `/data-modeling/er-diagram/cardinality` | カーディナリティ（多重度） | 基礎 |
| `/data-modeling/er-diagram/optionality` | 参加制約（必須参加 / 任意参加） | 基礎 |
| `/data-modeling/er-diagram/many-to-many` | 多対多（N:M）と連関実体 | 基礎 |
| `/data-modeling/er-diagram/weak-entity` | 弱エンティティと識別関係 | 基礎 |
| `/data-modeling/er-diagram/notation` | ER 図の記法比較（IE / IDEF1X / Chen） | 基礎 |
| `/about` | 著者（たいてっく）紹介 + menta CTA | |
| `/privacy` `/terms` `/contact` | 法務・お問い合わせ | |

自動生成: `/sitemap.xml`, `/robots.txt`, `/llms.txt`
