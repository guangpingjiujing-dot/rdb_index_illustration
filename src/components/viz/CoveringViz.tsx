"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";
import { BTreeNote } from "./BTreeNote";

type Mode = "not-covering" | "covering";

const INDEX_ONLY = [
  { user_id: 1, order_id: 1001 },
  { user_id: 1, order_id: 1002 },
  { user_id: 2, order_id: 1003 },
  { user_id: 3, order_id: 1004 },
];

const INDEX_COVERING = [
  { user_id: 1, order_id: 1001, amount: 5000 },
  { user_id: 1, order_id: 1002, amount: 1200 },
  { user_id: 2, order_id: 1003, amount: 8800 },
  { user_id: 3, order_id: 1004, amount: 3300 },
];

const TABLE = [
  { user_id: 1, order_id: 1001, amount: 5000, created_at: "2025-01-01" },
  { user_id: 1, order_id: 1002, amount: 1200, created_at: "2025-01-03" },
  { user_id: 2, order_id: 1003, amount: 8800, created_at: "2025-01-05" },
  { user_id: 3, order_id: 1004, amount: 3300, created_at: "2025-01-06" },
];

export function CoveringViz() {
  const [mode, setMode] = useState<Mode>("not-covering");
  const covering = mode === "covering";

  return (
    <VizFrame
      title="カバリングインデックス（インデックスオンリースキャン）"
      controls={
        <div className="inline-flex border border-[var(--border-strong)]">
          <button
            onClick={() => setMode("not-covering")}
            className={`px-3 py-1.5 text-xs font-semibold ${
              !covering
                ? "bg-[var(--foreground)] text-white"
                : "bg-white hover:bg-[var(--muted)]"
            }`}
          >
            通常のインデックス
          </button>
          <button
            onClick={() => setMode("covering")}
            className={`px-3 py-1.5 text-xs font-semibold border-l border-[var(--border-strong)] ${
              covering
                ? "bg-[var(--foreground)] text-white"
                : "bg-white hover:bg-[var(--muted)]"
            }`}
          >
            カバリングインデックス
          </button>
        </div>
      }
      legend={
        <span>
          クエリ <code>SELECT amount FROM orders WHERE user_id = 1</code> を想定。カバリングにすると <code>amount</code> がインデックスに含まれるためテーブル本体を読む必要が無くなる。
        </span>
      }
    >
      <div className="space-y-2">
        {/* Index */}
        <div>
          <div className="mb-2 text-sm font-bold">
            インデックス{" "}
            <code>
              {covering
                ? "(user_id, order_id) INCLUDE (amount)"
                : "(user_id, order_id)"}
            </code>
          </div>
          <BTreeNote />
          <div className="mt-2 overflow-x-auto border border-[var(--border)]">
            {covering ? (
              <div className="min-w-[36rem] grid grid-cols-[8rem_10rem_10rem]">
                {INDEX_COVERING.map((r, i) => {
                  const isTarget = r.user_id === 1;
                  return (
                    <motion.div
                      key={`${r.user_id}-${r.order_id}`}
                      animate={{
                        backgroundColor: isTarget ? "#0a0a0a" : "#ffffff",
                        color: isTarget ? "#ffffff" : "#0a0a0a",
                      }}
                      className={`col-span-3 grid grid-cols-subgrid items-center px-4 py-2 font-mono text-xs ${
                        i > 0 ? "border-t border-[var(--border)]" : ""
                      }`}
                    >
                      <span>user_id={r.user_id}</span>
                      <span>order_id={r.order_id}</span>
                      <span className="font-bold">amount={r.amount}</span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="min-w-[32rem] grid grid-cols-[8rem_10rem_8rem]">
                {INDEX_ONLY.map((r, i) => {
                  const isTarget = r.user_id === 1;
                  return (
                    <motion.div
                      key={`${r.user_id}-${r.order_id}`}
                      animate={{
                        backgroundColor: isTarget ? "#0a0a0a" : "#ffffff",
                        color: isTarget ? "#ffffff" : "#0a0a0a",
                      }}
                      className={`col-span-3 grid grid-cols-subgrid items-center px-4 py-2 font-mono text-xs ${
                        i > 0 ? "border-t border-[var(--border)]" : ""
                      }`}
                    >
                      <span>user_id={r.user_id}</span>
                      <span>order_id={r.order_id}</span>
                      <span className="opacity-70">→ 本体を読む</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Connector */}
        <ConnectionArrow covering={covering} />

        {/* Table */}
        <div>
          <div className="mb-2 flex items-baseline gap-3">
            <div className="text-sm font-bold">テーブル本体</div>
            {covering && (
              <span className="text-[10px] font-bold uppercase tracking-wider border border-[var(--foreground)] px-1.5 py-0.5">
                アクセス不要
              </span>
            )}
          </div>
          <motion.div
            animate={{ opacity: covering ? 0.3 : 1 }}
            className="overflow-x-auto border border-[var(--border)]"
          >
            <div className="min-w-[42rem] grid grid-cols-[8rem_10rem_10rem_10rem]">
              {TABLE.map((r, i) => {
                const highlight = r.user_id === 1;
                return (
                  <div
                    key={r.order_id}
                    className={`col-span-4 grid grid-cols-subgrid items-center px-4 py-2 font-mono text-xs ${
                      i > 0 ? "border-t border-[var(--border)]" : ""
                    } ${highlight && !covering ? "bg-[var(--muted)]" : "bg-white"}`}
                  >
                    <span>user_id={r.user_id}</span>
                    <span>order_id={r.order_id}</span>
                    <span>amount={r.amount}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {r.created_at}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <p className="pt-2 text-sm leading-relaxed">
          {covering
            ? "必要な amount がインデックスに入っているので、テーブル本体を一切読まずに結果を返せる。これがインデックスオンリースキャン。"
            : "amount を取得するために、インデックスで見つけた各行についてテーブル本体を追加アクセスする（Row Lookup）。"}
        </p>
      </div>
    </VizFrame>
  );
}

function ConnectionArrow({ covering }: { covering: boolean }) {
  return (
    <div className="flex justify-center py-2">
      <motion.div
        animate={{ opacity: covering ? 0.35 : 1 }}
        className="flex flex-col items-center gap-1"
      >
        <svg
          width="28"
          height="40"
          viewBox="0 0 28 40"
          aria-hidden
          className="text-[var(--foreground)]"
        >
          <line
            x1="14"
            y1="0"
            x2="14"
            y2="28"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray={covering ? "3 3" : undefined}
          />
          <polygon points="8,24 14,36 20,24" fill="currentColor" />
          {covering && (
            <line
              x1="2"
              y1="18"
              x2="26"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          )}
        </svg>
        <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--muted-foreground)]">
          {covering ? "本体アクセス不要" : "該当行の本体ページを追加で読み取る"}
        </span>
      </motion.div>
    </div>
  );
}
