"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VizFrame } from "./VizFrame";
import { BTreeNote } from "./BTreeNote";
import { Button } from "@/components/ui/Button";

const ROWS_PER_PAGE = 4;
const CHECK_DELAY_MS = 500;

function rowIdFor(i: number) {
  const page = Math.floor(i / ROWS_PER_PAGE) + 1;
  const offset = i % ROWS_PER_PAGE;
  return `(${page},${offset})`;
}

type Row = { email: string; rowId: string };
type Phase = "idle" | "checking" | "duplicate" | "inserted";

// テーブル本体の物理配置（挿入順、意図的にバラバラ）
const INITIAL_ROWS: Row[] = [
  { email: "c@example.com", rowId: "(1,0)" },
  { email: "a@example.com", rowId: "(1,1)" },
  { email: "d@example.com", rowId: "(1,2)" },
  { email: "b@example.com", rowId: "(1,3)" },
];

export function UniqueViz() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [input, setInput] = useState("a@example.com");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [focusKey, setFocusKey] = useState<string | null>(null);

  const sortedIndex = useMemo(
    () => [...rows].sort((a, b) => a.email.localeCompare(b.email)),
    [rows]
  );

  const add = () => {
    const v = input.trim();
    if (!v) return;
    setError(null);
    setFocusKey(v);
    setPhase("checking");

    // インデックス lookup の演出遅延
    window.setTimeout(() => {
      if (rows.some((r) => r.email === v)) {
        setPhase("duplicate");
        setError(`UNIQUE制約違反: "${v}" はすでに存在する。`);
        return;
      }
      const rowId = rowIdFor(rows.length);
      setRows((prev) => [...prev, { email: v, rowId }]);
      setPhase("inserted");
    }, CHECK_DELAY_MS);
  };

  const reset = () => {
    setRows(INITIAL_ROWS);
    setInput("a@example.com");
    setError(null);
    setPhase("idle");
    setFocusKey(null);
  };

  const onInputChange = (v: string) => {
    setInput(v);
    setError(null);
    setPhase("idle");
    setFocusKey(null);
  };

  return (
    <VizFrame
      title="ユニークインデックスによる重複防止"
      controls={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="font-semibold">
            挿入する email：
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={phase === "checking"}
              className="ml-2 w-56 border border-[var(--border-strong)] bg-white px-2 py-1 font-mono"
            />
          </label>
          <Button size="sm" onClick={add} disabled={phase === "checking"}>
            INSERT
          </Button>
          <Button size="sm" variant="secondary" onClick={reset}>
            リセット
          </Button>
        </div>
      }
      legend={
        <span>
          UNIQUEインデックスは検索の高速化と同時に、値の重複を防ぐ制約としても機能する。
          INSERT時にインデックスで存在チェックが <code>O(log N)</code> で走る。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: SQL + status */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3 leading-relaxed">{`-- インデックス定義
CREATE UNIQUE INDEX idx_users_email
  ON users (email);

-- 挿入
INSERT INTO users(email)
VALUES ('${input}');`}</pre>

          {error ? (
            <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]">
                制約違反エラー
              </div>
              <p className="mt-1 text-sm leading-relaxed">{error}</p>
            </div>
          ) : phase === "inserted" ? (
            <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                挿入成功
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                インデックスに同じ値がなかったので、テーブルとインデックスの両方に書き込んだ。
              </p>
            </div>
          ) : (
            <div className="mt-6 border-l-2 border-[var(--border-strong)] pl-4 py-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                仕組み
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                INSERT時、DBはまずUNIQUEインデックスを引いて既に同じ値があるか確認する。
                存在すればエラーを返し、なければテーブルとインデックスに書き込む。
              </p>
            </div>
          )}
        </div>

        {/* Right: Index + Table */}
        <div className="space-y-6">
          {/* Index */}
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <div className="text-sm font-bold">
                インデックス <code>(email)</code> UNIQUE
              </div>
              {phase === "checking" && (
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block h-2 w-2 rounded-full bg-[var(--foreground)]"
                  />
                  存在チェック中: {focusKey}
                </div>
              )}
            </div>
            <BTreeNote />
            <div className="mt-2 border border-[var(--border)]">
              <div className="grid grid-cols-[1fr_5rem] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)]">
                <div>email</div>
                <div>→ 行ID</div>
              </div>
              <AnimatePresence initial={false}>
                {sortedIndex.map((r) => {
                  const isFocus = r.email === focusKey;
                  const isDuplicate = isFocus && phase === "duplicate";
                  const isInserted = isFocus && phase === "inserted";
                  return (
                    <motion.div
                      key={r.email}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        backgroundColor: isDuplicate
                          ? "#0a0a0a"
                          : isInserted
                          ? "#ebebe8"
                          : "#ffffff",
                        color: isDuplicate ? "#ffffff" : "#0a0a0a",
                      }}
                      exit={{ opacity: 0, x: 6 }}
                      className="grid grid-cols-[1fr_5rem] items-center border-t border-[var(--border)] px-3 py-2 font-mono text-xs"
                    >
                      <span>{r.email}</span>
                      <span className="opacity-70">{r.rowId}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Table */}
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <div className="text-sm font-bold">テーブル users</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                物理配置（挿入順）
              </div>
            </div>
            <div className="border border-[var(--border)]">
              <div className="grid grid-cols-[5rem_1fr] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)]">
                <div>行ID</div>
                <div>email</div>
              </div>
              <AnimatePresence initial={false}>
                {rows.map((r) => {
                  const isFocus = r.email === focusKey;
                  const isInserted = isFocus && phase === "inserted";
                  return (
                    <motion.div
                      key={r.email}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        backgroundColor: isInserted ? "#ebebe8" : "#ffffff",
                      }}
                      exit={{ opacity: 0, y: 4 }}
                      className="grid grid-cols-[5rem_1fr] items-center border-t border-[var(--border)] px-3 py-2 font-mono text-xs"
                    >
                      <span className="opacity-70">{r.rowId}</span>
                      <span>{r.email}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
