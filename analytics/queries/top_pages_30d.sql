-- 直近 30 日で PV / セッションが多いページ Top 20
-- GA4: ga_page_daily を集計

SELECT
  page_path,
  SUM(screen_page_views) AS pv,
  SUM(sessions)          AS sessions,
  SUM(active_users)      AS users,
  ROUND(AVG(engagement_rate), 3) AS avg_engagement_rate,
  ROUND(AVG(avg_engagement_time), 1) AS avg_time_sec
FROM ga_page_daily
WHERE date >= date('now', '-30 days')
GROUP BY page_path
ORDER BY pv DESC
LIMIT 20;