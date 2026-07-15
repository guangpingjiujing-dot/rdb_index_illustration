# analytics/

taitech.dev のデータドリブン意思決定のためのローカル分析基盤。

## 構成

```
analytics/
├── README.md          このファイル
├── schema.sql         SQLite DDL（正本）
├── data/              SQLite DB 実体（gitignore）
│   └── analytics.sqlite
├── snapshots/         MCP 生レスポンス保存（gitignore、デバッグ用）
├── queries/           再利用 SQL クエリ（commit する）
│   ├── top_pages_30d.sql
│   ├── ctr_opportunities.sql
│   ├── growth_pages.sql
│   ├── source_mix.sql
│   └── index_coverage.sql
└── reports/           生成した Markdown レビュー（commit する）
```

## データソース

| ソース | 取得手段 | 格納先テーブル |
|---|---|---|
| GSC Search Analytics | `mcp__gsc__get_search_analytics` | `gsc_search_daily` |
| GSC Sitemap details | `mcp__gsc__get_sitemap_details` | `sitemap_status` |
| GA4 ページ単位 | `mcp__ga__run_report` (dim: `date, pagePath`) | `ga_page_daily` |
| GA4 流入源単位 | `mcp__ga__run_report` (dim: `date, sessionSource, sessionMedium, sessionCampaign`) | `ga_source_daily` |
| GA4 イベント単位 | `mcp__ga__run_report` (dim: `date, eventName, pagePath`) | `ga_event_daily` |

すべて (date + 全ディメンション) を PRIMARY KEY にして UPSERT。同じ日を何度取り直しても壊れない。

## 使い方

Claude Code に対して:

- 「アナリティクス pull して」→ `.claude/skills/taitech-analytics` の pull モード
- 「先月伸びた記事は？」→ query モード（`queries/growth_pages.sql`）
- 「今月のレビュー出して」→ review モード（`reports/review-YYYY-MM-DD.md` 生成）

直接 SQL を叩く場合:

```bash
sqlite3 -header -column analytics/data/analytics.sqlite < analytics/queries/top_pages_30d.sql
sqlite3 -header -column analytics/data/analytics.sqlite "SELECT COUNT(*) FROM gsc_search_daily;"
```

## DB の初期化 / スキーマ変更

`schema.sql` はすべて `CREATE TABLE IF NOT EXISTS`。安全に何度でも流せる。

```bash
sqlite3 analytics/data/analytics.sqlite < analytics/schema.sql
```

**破壊的なスキーマ変更が必要な場合**（列型変更・PK 変更等）は、`schema.sql` を編集した上で該当テーブルを `DROP TABLE` してから再作成する。過去データは `analytics/snapshots/` からリカバリするか、失って良ければ捨てる。

## 自己トラフィック除外

**GA4 の内部トラフィックフィルタを 2026-07-15 に有効化**。以降のデータは運営者本人のアクセスが除外されて GA4 に格納される。

**重要な含意**
- **2026-07-15 より前のデータには自己トラフィックが混入**している。特に direct/(none) セッションと `/cmd_sco` 等のテスト path は本人閲覧の可能性が高い
- 中長期的な傾向分析は 2026-07-15 以降のデータを優先的に使う
- 自己アクセスが除外されるのは登録済み IP から来た hits のみ（モバイル / 出張先 Wi-Fi / VPN 未登録）

設定詳細と登録 IP は `docs/OPERATIONS.md` の「GA4 内部トラフィック除外設定」節を参照。IP 変更時は同ドキュメントの手順で更新。

## What NOT to store

- ユーザー単位データ（プライバシー / 分析に不要）
- リアルタイム系（振り返り用途に不向き）
- GSC の URL Inspection 全件結果（クォータが重い。必要になったら別テーブルで）