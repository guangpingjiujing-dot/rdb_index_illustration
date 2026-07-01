"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";

export function StatisticsViz() {
  const [selectivity, setSelectivity] = useState(5); // %
  const useIndex = selectivity <= 20;

  return (
    <VizFrame
      title="統計情報とオプティマイザの判断"
      controls={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="font-semibold">
            対象データの割合（selectivity）：
            <input
              type="range"
              min={1}
              max={100}
              value={selectivity}
              onChange={(e) => setSelectivity(Number(e.target.value))}
              className="ml-2 align-middle accent-[var(--foreground)]"
            />
            <span className="ml-2 inline-block w-14 border border-[var(--border-strong)] px-2 py-0.5 text-center font-mono">
              {selectivity}%
            </span>
          </label>
        </div>
      }
      legend={
        <span>
          オプティマイザは統計情報（各値の分布・カーディナリティ）から「該当行はテーブルの何％か」を見積り、閾値を超えたらインデックスを使わずSeqScanを選ぶ。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
        <div>
          <div className="text-sm font-bold mb-2">テーブル（100行想定）</div>
          <div className="grid grid-cols-10 gap-0.5 border border-[var(--border)] p-2">
            {Array.from({ length: 100 }).map((_, i) => {
              const isMatch = i < selectivity;
              return (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: isMatch ? "#0a0a0a" : "#e5e5e2",
                  }}
                  className="aspect-square"
                />
              );
            })}
          </div>
          <div className="mt-3 text-xs text-[var(--muted-foreground)]">
            該当行 <span className="font-bold text-[var(--foreground)]">{selectivity}件</span> / 100件
          </div>
        </div>
        <div>
          <div className="border-l-2 border-[var(--foreground)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              オプティマイザの選択
            </div>
            <div className="mt-1 text-lg font-bold">
              {useIndex ? "Index Scan" : "Seq Scan"}
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              {useIndex
                ? "該当行が少ないので、インデックスを引いて対象だけを取ってきた方が速い。"
                : "テーブルの多くを読むのなら、順に読んだ方が速い（ランダムアクセスよりシーケンシャル）。"}
            </p>
          </div>
          <div className="mt-6 border-l-2 border-[var(--border-strong)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              統計情報が古いと…
            </div>
            <p className="mt-1 text-sm leading-relaxed">
              例: 挿入直後で ANALYZE が走っていないと、実際は多くの行が該当するのにインデックスを選んで遅くなる、といったことが起きる。定期的な統計情報の更新が重要。
            </p>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
