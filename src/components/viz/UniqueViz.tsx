"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VizFrame } from "./VizFrame";
import { Button } from "@/components/ui/Button";

export function UniqueViz() {
  const [rows, setRows] = useState<{ email: string }[]>([
    { email: "a@example.com" },
    { email: "b@example.com" },
    { email: "c@example.com" },
  ]);
  const [input, setInput] = useState("a@example.com");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (rows.some((r) => r.email === v)) {
      setError(`UNIQUE制約違反: "${v}" はすでに存在する。`);
      return;
    }
    setRows([...rows, { email: v }]);
    setError(null);
  };

  const reset = () => {
    setRows([
      { email: "a@example.com" },
      { email: "b@example.com" },
      { email: "c@example.com" },
    ]);
    setError(null);
  };

  return (
    <VizFrame
      title="ユニークインデックスによる重複防止"
      controls={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="font-semibold">
            挿入する email：
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              className="ml-2 w-56 border border-[var(--border-strong)] bg-white px-2 py-1 font-mono"
            />
          </label>
          <Button size="sm" onClick={add}>
            INSERT
          </Button>
          <Button size="sm" variant="secondary" onClick={reset}>
            リセット
          </Button>
        </div>
      }
      legend={
        <span>
          UNIQUEインデックスは検索の高速化と同時に、値の重複を防ぐ制約としても機能する。1対1の関係を保証したいカラムに設定する。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-bold">
            テーブル users (<code>email</code> UNIQUE)
          </div>
          <div className="border border-[var(--border)]">
            <AnimatePresence>
              {rows.map((r) => (
                <motion.div
                  key={r.email}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  className="border-t first:border-t-0 border-[var(--border)] px-3 py-2 font-mono text-sm"
                >
                  {r.email}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3">{`INSERT INTO users(email)\nVALUES ('${input}');`}</pre>

          {error ? (
            <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]">
                制約違反エラー
              </div>
              <p className="mt-1 text-sm leading-relaxed">{error}</p>
            </div>
          ) : (
            <div className="mt-6 border-l-2 border-[var(--border-strong)] pl-4 py-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                OK
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                UNIQUE制約に違反しなければ挿入できる。実行時にインデックスで同じ値の存在チェックが行われる。
              </p>
            </div>
          )}
        </div>
      </div>
    </VizFrame>
  );
}
