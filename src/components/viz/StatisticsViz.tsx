"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";
import { cn } from "@/lib/utils";

type Status = "pending" | "shipped" | "cancelled";

const FRESH_DISTRIBUTION: Record<Status, number> = {
  pending: 5,
  shipped: 80,
  cancelled: 15,
};

const STALE_DISTRIBUTION: Record<Status, number> = {
  pending: 33,
  shipped: 33,
  cancelled: 34,
};

const TOTAL_ROWS = 1_000_000;
const INDEX_THRESHOLD_PCT = 20;

export function StatisticsViz() {
  const [status, setStatus] = useState<Status>("shipped");
  const [fresh, setFresh] = useState(false);

  const believed = fresh ? FRESH_DISTRIBUTION : STALE_DISTRIBUTION;
  const believedPct = believed[status];
  const believedRows = Math.round((believedPct / 100) * TOTAL_ROWS);
  const optimizerChoice = believedPct <= INDEX_THRESHOLD_PCT ? "index" : "seq";

  const actualPct = FRESH_DISTRIBUTION[status];
  const actualRows = Math.round((actualPct / 100) * TOTAL_ROWS);
  const bestChoice = actualPct <= INDEX_THRESHOLD_PCT ? "index" : "seq";
  const misjudged = optimizerChoice !== bestChoice;

  return (
    <VizFrame
      title="統計情報がオプティマイザの判断を決める"
      controls={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">検索する status:</span>
          <div className="inline-flex border border-[var(--border-strong)]">
            {(["pending", "shipped", "cancelled"] as Status[]).map((s, i) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono font-semibold",
                  status === s
                    ? "bg-[var(--foreground)] text-white"
                    : "bg-white hover:bg-[var(--muted)]",
                  i > 0 && "border-l border-[var(--border-strong)]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <label className="ml-4 flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={fresh}
              onChange={(e) => setFresh(e.target.checked)}
              className="accent-[var(--foreground)]"
            />
            <span className="font-semibold">統計情報が最新</span>
          </label>
        </div>
      }
      legend={
        <span>
          オプティマイザは「対象行の割合が閾値（ここでは
          <code>{INDEX_THRESHOLD_PCT}%</code>
          ）以下ならインデックス、それより多ければフルスキャン」と判断する。
          統計情報が古いと <em>誤った</em> 割合で判断し、最適でないプランを選ぶ。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: distribution */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            オプティマイザが持っている分布
          </div>
          <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
            {fresh
              ? "＝ 現実の分布と一致"
              : "＝ 古い分布。実際とはずれている"}
          </div>

          <div className="mt-4 space-y-3">
            {(["pending", "shipped", "cancelled"] as Status[]).map((s) => {
              const pct = believed[s];
              const isTarget = s === status;
              return (
                <div key={s}>
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className={cn(isTarget && "font-bold")}>{s}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {pct}% · {Math.round((pct / 100) * TOTAL_ROWS / 1000)}K 行
                    </span>
                  </div>
                  <div className="mt-1 h-3 bg-[var(--muted)] border border-[var(--border)]">
                    <motion.div
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      className={cn(
                        "h-full",
                        isTarget
                          ? "bg-[var(--foreground)]"
                          : "bg-[var(--border-strong)]"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!fresh && (
            <div className="mt-6 border-l-2 border-[var(--foreground)] pl-3 py-1 text-xs">
              <div className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">
                なぜ古くなる？
              </div>
              <p className="mt-1 leading-relaxed">
                大量INSERT/DELETE 直後や、データ分布が変化した直後は、DBが把握している分布と実際がずれる。
                統計情報を更新するコマンドで最新化する必要がある。
              </p>
            </div>
          )}
        </div>

        {/* Right: optimizer decision */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            オプティマイザの見積り
          </div>
          <div className="mt-2 border border-[var(--border)] bg-white p-4">
            <div className="text-xs font-mono">
              WHERE status = &apos;{status}&apos;
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              推定該当行数
            </div>
            <div className="text-2xl font-bold font-mono">
              {believedRows.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-[var(--muted-foreground)]">
                / {TOTAL_ROWS.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">
              閾値 {INDEX_THRESHOLD_PCT}% (=
              {Math.round(INDEX_THRESHOLD_PCT * TOTAL_ROWS / 100).toLocaleString()}行)
              との比較で選択
            </div>
          </div>

          <div className="mt-4 border-l-2 border-[var(--foreground)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              選ばれたアクセス方法
            </div>
            <div className="mt-1 text-lg font-bold font-mono">
              {optimizerChoice === "index" ? "Index Scan" : "Seq Scan"}
            </div>
            <p className="mt-1 text-sm leading-relaxed">
              {optimizerChoice === "index"
                ? "「対象は少ない」と見積もったのでインデックスから直接引く。"
                : "「対象が多い」と見積もったので全表を順に読む方が速いと判断。"}
            </p>
          </div>

          {misjudged && (
            <div className="mt-4 border-2 border-[var(--foreground)] bg-[var(--muted)] p-4">
              <div className="text-[10px] uppercase font-bold text-[var(--foreground)]">
                しかし実際は…（誤判断）
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                実際の該当行数は <strong>{actualRows.toLocaleString()}</strong>{" "}
                件（{actualPct}%）。本来は{" "}
                <strong className="font-mono">
                  {bestChoice === "index" ? "Index Scan" : "Seq Scan"}
                </strong>{" "}
                が最速だが、古い統計情報のせいで違うプランが選ばれた。
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                「インデックスを貼ったのに使われない」問題の多くはこのパターン。
              </p>
            </div>
          )}
        </div>
      </div>
    </VizFrame>
  );
}
