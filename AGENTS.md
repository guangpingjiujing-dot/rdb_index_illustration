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
