# RDBインデックス図解サイト

RDBのインデックス（B-tree, ハッシュ, クラスタ化, 複合, カバリング, 部分, EXPLAIN, 統計情報 …）の仕組みをインタラクティブな図解＋アニメーションで解説するサイト。

- 全体設計: [`docs/DESIGN.md`](docs/DESIGN.md)
- 技術構成: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + SVG
- DB: 不要（全ページ静的生成 + クライアント計算）
- デプロイ: Vercel（無料枠）

## ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 で確認できます。

## ビルド

```bash
npm run build
```

## 環境変数

`.env.local` にコピーして使ってください（`.env.example` 参照）:

| 変数 | 説明 |
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 の測定ID（未設定なら GA タグは挿入されない） |
| `NEXT_PUBLIC_SITE_URL` | 本番URL（sitemap/OG生成用） |

## ページ構成

| パス | 内容 | レベル |
|---|---|---|
| `/` | ランディング |  |
| `/basics/why-index` | なぜインデックスが必要か | 基礎 |
| `/btree` | B-treeインデックス | 基礎 |
| `/hash` | ハッシュインデックス | 基礎 |
| `/clustered` | クラスタ化インデックス | 基礎 |
| `/composite` | 複合インデックス | 基礎 |
| `/unique` | ユニークインデックス | 基礎 |
| `/covering` | カバリングインデックス | 発展 |
| `/partial` | 部分インデックス | 発展 |
| `/explain` | 実行計画（EXPLAIN） | 発展 |
| `/statistics` | 統計情報とオプティマイザ | 発展 |
| `/cost` | インデックスのコスト | 発展 |
| `/about` | 著者（たいてっく）紹介 | |
| `/privacy` `/terms` `/contact` | 法務・お問い合わせ | |

自動生成される: `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/opengraph-image`

## 収益化・SEOの導線

- 各トピック末尾に「メンタ業への無料相談CTA」と「Amazonアソシエイト書籍紹介」
- 各ページに JSON-LD (TechArticle / BreadcrumbList / FAQPage)
- `llms.txt` でAI検索に対応
- 動的OG画像 (`/opengraph-image`)
- Google Analytics 4 タグ挿入（`NEXT_PUBLIC_GA_ID` 設定時）
- Vercel Analytics + Speed Insights を有効化済み

### アナリティクス

- **Vercel Analytics** / **Speed Insights**: プロジェクト設定でオンにするだけで動作
- **GA4**: [analytics.google.com](https://analytics.google.com/) で測定IDを取得 → Vercel Environment Variables に `NEXT_PUBLIC_GA_ID` として登録 → 再デプロイ
- **Google Search Console**: [search.google.com/search-console](https://search.google.com/search-console/) でサイトを登録 → sitemap.xml (`https://<domain>/sitemap.xml`) を送信

### Amazonアソシエイト

`src/content/books.ts` の各書籍の `amazonUrl` を、[Amazonアソシエイト](https://affiliate.amazon.co.jp/) 承認後に発行される追跡ID付きURLに差し替えてください。
