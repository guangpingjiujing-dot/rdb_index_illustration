"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";

export function CostViz() {
  const [n, setN] = useState(3);

  const searchGain = Math.min(100, 30 + n * 20);
  const insertCost = 10 + n * 22;

  return (
    <VizFrame
      title="インデックスの数と検索/更新コストのトレードオフ"
      controls={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="font-semibold">
            テーブルに貼っているインデックス数：
            <input
              type="range"
              min={0}
              max={6}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="ml-2 align-middle accent-[var(--foreground)]"
            />
            <span className="ml-2 inline-block w-10 border border-[var(--border-strong)] px-2 py-0.5 text-center font-mono">
              {n}
            </span>
          </label>
        </div>
      }
      legend={
        <span>
          インデックスは検索を速くする一方で、INSERT/UPDATE/DELETE時にはインデックス側にも書き込みが発生する。適切な数と設計が重要。
        </span>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Meter label="SELECT の速さ" value={searchGain} suffix="速い" />
        <Meter label="INSERT/UPDATE のコスト" value={insertCost} suffix="重い" />
      </div>
      <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1 text-sm leading-relaxed">
        {n <= 2 && "適切な数のインデックス。検索性能とのバランスが良い状態。"}
        {n >= 3 && n <= 4 && "インデックスが多め。書き込み負荷が読み取り負荷を上回るテーブルでは注意。"}
        {n >= 5 && "インデックスが多すぎる。使われていないインデックスや重複がないか棚卸ししましょう。"}
      </div>
    </VizFrame>
  );
}

function Meter({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {pct.toFixed(0)}% {suffix}
        </span>
      </div>
      <div className="h-3 w-full border border-[var(--border-strong)] bg-white">
        <motion.div
          className="h-full bg-[var(--foreground)]"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
