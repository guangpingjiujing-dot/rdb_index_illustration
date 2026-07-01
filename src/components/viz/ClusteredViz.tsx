"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";

type Row = { id: number; name: string; email: string };

const HEAP_ROWS: Row[] = [
  { id: 42, name: "Sato", email: "sato@example.com" },
  { id: 15, name: "Tanaka", email: "tanaka@example.com" },
  { id: 83, name: "Suzuki", email: "suzuki@example.com" },
  { id: 27, name: "Ito", email: "ito@example.com" },
  { id: 61, name: "Nakamura", email: "n@example.com" },
  { id: 4, name: "Yamada", email: "y@example.com" },
  { id: 99, name: "Kobayashi", email: "k@example.com" },
  { id: 33, name: "Watanabe", email: "w@example.com" },
];

const CLUSTERED_ROWS = [...HEAP_ROWS].sort((a, b) => a.id - b.id);

export function ClusteredViz() {
  const [range, setRange] = useState<[number, number]>([25, 65]);

  return (
    <VizFrame
      title="クラスタ化 vs 非クラスタ（範囲検索の比較）"
      controls={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">範囲検索：</span>
          <span>
            <code>id BETWEEN</code>{" "}
            <input
              type="number"
              value={Number.isFinite(range[0]) ? range[0] : ""}
              onChange={(e) => {
                const v = e.target.valueAsNumber;
                setRange([Number.isFinite(v) ? v : 0, range[1]]);
              }}
              className="w-16 border border-[var(--border-strong)] bg-white px-2 py-1"
            />{" "}
            AND{" "}
            <input
              type="number"
              value={Number.isFinite(range[1]) ? range[1] : ""}
              onChange={(e) => {
                const v = e.target.valueAsNumber;
                setRange([range[0], Number.isFinite(v) ? v : 0]);
              }}
              className="w-16 border border-[var(--border-strong)] bg-white px-2 py-1"
            />
          </span>
        </div>
      }
      legend={
        <span>
          クラスタ化インデックスは実データそのものが順序を持つため、範囲検索が連続領域の読み取りで済む。ヒープ表は該当行が飛び飛びに散らばる。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-sm font-bold">ヒープ表（非クラスタ）</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              挿入順にバラバラ配置
            </div>
          </div>
          <div className="border border-[var(--border)]">
            {HEAP_ROWS.map((r, i) => {
              const inRange = r.id >= range[0] && r.id <= range[1];
              return (
                <motion.div
                  key={r.id}
                  animate={{
                    backgroundColor: inRange ? "#0a0a0a" : "#ffffff",
                    color: inRange ? "#ffffff" : "#0a0a0a",
                  }}
                  className="grid grid-cols-[2rem_3rem_1fr] items-center border-t first:border-t-0 border-[var(--border)] px-2 py-1 text-xs"
                >
                  <span className="font-mono opacity-70">#{i}</span>
                  <span className="font-mono font-bold">{r.id}</span>
                  <span className="opacity-80">{r.name}</span>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
            該当行が飛び地なので、範囲検索でも各行にランダムアクセスが必要。
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-sm font-bold">クラスタ化表</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              キー順に物理配置
            </div>
          </div>
          <div className="border border-[var(--border)]">
            {CLUSTERED_ROWS.map((r, i) => {
              const inRange = r.id >= range[0] && r.id <= range[1];
              return (
                <motion.div
                  key={r.id}
                  animate={{
                    backgroundColor: inRange ? "#0a0a0a" : "#ffffff",
                    color: inRange ? "#ffffff" : "#0a0a0a",
                  }}
                  className="grid grid-cols-[2rem_3rem_1fr] items-center border-t first:border-t-0 border-[var(--border)] px-2 py-1 text-xs"
                >
                  <span className="font-mono opacity-70">#{i}</span>
                  <span className="font-mono font-bold">{r.id}</span>
                  <span className="opacity-80">{r.name}</span>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
            該当行が連続領域に固まっているのでシーケンシャル読み取りで効率的。
          </p>
        </div>
      </div>
    </VizFrame>
  );
}
