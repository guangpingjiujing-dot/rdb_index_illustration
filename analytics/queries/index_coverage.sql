-- サイトマップベースのインデックス状態
-- (1) 最新のサイトマップ状態
-- (2) Search Analytics ベースの proxy: 直近 28 日で impressions >= 1 のページ数

-- (1) sitemap_status の最新スナップショット
SELECT
  sitemap_url,
  type,
  submitted_urls,
  indexed_urls,
  ROUND(100.0 * indexed_urls / NULLIF(submitted_urls, 0), 1) AS indexed_pct,
  warnings,
  errors,
  last_downloaded,
  date AS fetched_date
FROM sitemap_status
WHERE date = (SELECT MAX(date) FROM sitemap_status)
ORDER BY submitted_urls DESC;

-- (2) 直近 28 日で少なくとも 1 imp が出た URL 数 = 「実質露出しているページ」の下限
SELECT
  COUNT(DISTINCT page) AS pages_with_impressions_28d,
  SUM(impressions)     AS total_impressions_28d,
  SUM(clicks)          AS total_clicks_28d
FROM gsc_search_daily
WHERE date >= date('now', '-28 days');