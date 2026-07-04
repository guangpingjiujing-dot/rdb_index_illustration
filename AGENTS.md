<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment

- **Host**: Vercel。GitHub `main` への push で本番デプロイが自動発火する。
- **Production URL**: https://taitech.dev
- **Domain**: `taitech.dev`（Registrar/DNS 事業者の詳細は `docs/OPERATIONS.md`）。`www.taitech.dev` は 308 で apex にリダイレクト（`next.config.ts` の `redirects()` で実装）。
- **HTTPS**: Vercel が Let's Encrypt 相当の証明書を自動発行・更新。
- **Preview**: main 以外のブランチを push すると Vercel が Preview デプロイを自動発行する。

## Environment variables

`.env.example` に一覧。本番の値は Vercel Project Settings → Environment Variables で管理。

| 変数 | 用途 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `sitemap.xml` / `robots.txt` / OGP / canonical の base URL。本番は `https://taitech.dev`。 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 測定 ID。空なら GA タグは挿入されない。 |

## DNS / routing notes

- apex (`taitech.dev`) と `www.taitech.dev` の両方を Vercel に登録済み。
- DNS プロバイダのプロキシ機能を使う場合は **DNS-only mode**（グレー雲）で運用する。プロキシ経由にすると Vercel の SSL 発行が失敗する。
- www → apex の恒久リダイレクト（308）はアプリ層（`next.config.ts` の host マッチ）で行う。DNS 側でリダイレクトさせない。

## Deploy operations (Claude Code 用チートシート)

```bash
# ログイン中のアカウント確認
vercel whoami

# 対象プロジェクト（このディレクトリで実行する前提）
vercel project ls | grep rdb-index

# 手動プロダクションデプロイ（普通は git push で十分）
vercel --prod --yes

# 環境変数の追加
printf "value" | vercel env add NAME production

# ドメイン状態
vercel domains inspect taitech.dev
```

# Development

## Package manager

`npm` を使う。`bun` はローカルに入っていない環境がある。

## Common commands

```bash
# 型チェック（package.json に script が無いので直接叩く）
npx tsc --noEmit

# 開発サーバー
npm run dev

# 本番ビルド
npm run build

# E2E テスト（Playwright、全ページのコンソールエラー/警告検知含む30件）
npm run test:e2e

# E2E UI モード
npm run test:e2e:ui
```

コンポーネント追加・レイアウト変更後は E2E テスト実行推奨。全ページで console error / warning が出ないことを保証している。

## Monorepo 情報 (docs/)

`docs/` は `.gitignore` 済み。ローカル専用の運用メモを置く場所。GitHub には公開しない。
- `docs/OPERATIONS.md`: アカウント・DNS・支払い等の非公開ディテール
- `docs/MONETIZATION_ROADMAP.md`: 収益化ロードマップと進捗

# Amazon Associates ガードレール

コードを読んでも分からない規約制約。違反するとアカウント停止 or 収益ゼロになる。

- **書籍 URL の `?tag=taitech-22` を削除しない**。Store ID は `taitech-22`。詳細は `docs/OPERATIONS.md`
- **`AffiliateBooks.tsx` の「本セクションはAmazonアソシエイトのリンクを含みます。」を削除しない**。Amazon 運営規約と景表法（ステマ規制）で必須
- **Amazon 商品画像の hotlink 禁止**。PA-API 経由でのみ許可され、PA-API は 3件発送成立まで解放されない。書影を扱う場合は必ず PA-API 有効化後

# Monetization 優先順位

収益化の本命は **menta 無料相談への送客**（1件で月数千〜数万円 継続）。Amazon アフィリは補助的位置付け。CTA を追加・変更するときは menta CTA の視認性を下げないこと。
