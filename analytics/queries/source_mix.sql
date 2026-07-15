-- 流入 source / medium ミックス（直近 30 日）
-- どこから来ているかを把握。google organic / direct / referral の比率を見る。

SELECT
  session_source,
  session_medium,
  SUM(sessions)         AS sessions,
  SUM(engaged_sessions) AS engaged,
  ROUND(100.0 * SUM(engaged_sessions) / NULLIF(SUM(sessions),0), 1) AS engaged_pct,
  SUM(active_users)     AS users
FROM ga_source_daily
WHERE date >= date('now', '-30 days')
GROUP BY session_source, session_medium
ORDER BY sessions DESC
LIMIT 20;