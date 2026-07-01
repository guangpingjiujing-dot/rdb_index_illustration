"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";

type Order = { id: number; status: "pending" | "shipped" | "cancelled"; amount: number };

const ORDERS: Order[] = [
  { id: 1, status: "shipped", amount: 5000 },
  { id: 2, status: "pending", amount: 1200 },
  { id: 3, status: "cancelled", amount: 8800 },
  { id: 4, status: "shipped", amount: 3300 },
  { id: 5, status: "pending", amount: 400 },
  { id: 6, status: "shipped", amount: 12000 },
  { id: 7, status: "cancelled", amount: 900 },
  { id: 8, status: "pending", amount: 2500 },
  { id: 9, status: "shipped", amount: 7100 },
  { id: 10, status: "shipped", amount: 4600 },
];

export function PartialViz() {
  const [mode, setMode] = useState<"full" | "partial">("full");
  const partial = mode === "partial";
  const inIndex = (o: Order) => (partial ? o.status === "pending" : true);
  const included = ORDERS.filter(inIndex);

  return (
    <VizFrame
      title="部分インデックス"
      controls={
        <div className="inline-flex border border-[var(--border-strong)]">
          <button
            onClick={() => setMode("full")}
            className={`px-3 py-1.5 text-xs font-semibold ${
              !partial
                ? "bg-[var(--foreground)] text-white"
                : "bg-white hover:bg-[var(--muted)]"
            }`}
          >
            通常インデックス
          </button>
          <button
            onClick={() => setMode("partial")}
            className={`px-3 py-1.5 text-xs font-semibold border-l border-[var(--border-strong)] ${
              partial
                ? "bg-[var(--foreground)] text-white"
                : "bg-white hover:bg-[var(--muted)]"
            }`}
          >
            部分インデックス（pending のみ）
          </button>
        </div>
      }
      legend={
        <span>
          「未処理注文だけを高速に引きたい」のような要件に部分インデックスは有効。インデックスサイズと更新コストを大きく減らせる。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-bold">
            インデックス{" "}
            <code>
              {partial
                ? "(status) WHERE status = 'pending'"
                : "(status)"}
            </code>
          </div>
          <div className="border border-[var(--border)]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-1.5">
              エントリ数 <span className="font-bold text-[var(--foreground)]">{included.length}</span> / {ORDERS.length}
            </div>
            {ORDERS.map((o) => {
              const active = inIndex(o);
              return (
                <motion.div
                  key={o.id}
                  animate={{
                    opacity: active ? 1 : 0.2,
                  }}
                  className="grid grid-cols-3 items-center border-t border-[var(--border)] px-3 py-1.5 font-mono text-xs"
                >
                  <span>#{o.id}</span>
                  <span
                    className={
                      o.status === "pending"
                        ? "font-bold"
                        : "text-[var(--muted-foreground)]"
                    }
                  >
                    {o.status}
                  </span>
                  <span>¥{o.amount}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3">{`SELECT *\nFROM orders\nWHERE status = 'pending';`}</pre>

          <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              効果
            </div>
            <p className="mt-1 text-sm leading-relaxed">
              {partial
                ? "対象データが pending の3件だけなので、インデックスサイズが小さく、統計情報も無駄がない。他のstatus更新時に部分インデックスは影響を受けない。"
                : "全10件を対象とするインデックス。特定のstatusしか検索しないなら、インデックスの2/3は無駄になる。"}
            </p>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
