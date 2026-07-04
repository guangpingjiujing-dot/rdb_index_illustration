"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VizFrame } from "./VizFrame";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const ROWS_PER_PAGE = 4;
const BUCKET_COUNT_OPTIONS = [3, 5, 7, 10] as const;
const DEFAULT_BUCKET_COUNT = 5;
const TOTAL_STEPS = 4; // 0..3
const AUTO_PLAY_INTERVAL_MS = 800;

function rawHash(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function bucketOf(key: string, n: number) {
  return rawHash(key) % n;
}

function rowIdFor(index: number) {
  const page = Math.floor(index / ROWS_PER_PAGE) + 1;
  const offset = index % ROWS_PER_PAGE;
  return `(${page},${offset})`;
}

type Item = { key: string; rowId: string };

const INITIAL_KEYS = [
  "sato",
  "tanaka",
  "suzuki",
  "ito",
  "nakamura",
  "yamada",
  "kobayashi",
  "watanabe",
  "takahashi",
  "saito",
  "kato",
];

const INITIAL_ITEMS: Item[] = INITIAL_KEYS.map((key, i) => ({
  key,
  rowId: rowIdFor(i),
}));

type Mode = "equal" | "range" | "insert";
type RangeResult = { from: string; to: string } | null;

export function HashViz() {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [bucketCount, setBucketCount] = useState<number>(DEFAULT_BUCKET_COUNT);
  const [mode, setMode] = useState<Mode>("equal");
  const [query, setQuery] = useState("suzuki");
  const [rangeFrom, setRangeFrom] = useState("k");
  const [rangeTo, setRangeTo] = useState("u");
  const [insertKey, setInsertKey] = useState("mori");
  const [step, setStep] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const [range, setRange] = useState<RangeResult>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hide pending insert item until step reaches final stage
  const displayItems = useMemo(() => {
    if (mode === "insert" && pendingKey && step < TOTAL_STEPS - 1) {
      return items.filter((it) => it.key !== pendingKey);
    }
    return items;
  }, [items, mode, pendingKey, step]);

  const buckets = useMemo(() => {
    const b: Item[][] = Array.from({ length: bucketCount }, () => []);
    for (const it of displayItems) {
      b[bucketOf(it.key, bucketCount)].push(it);
    }
    return b;
  }, [displayItems, bucketCount]);

  // Auto-play advances step
  useEffect(() => {
    if (!running) return;
    if (step >= TOTAL_STEPS - 1) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStep(step + 1), AUTO_PLAY_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [running, step]);

  const canAdvance = mode !== "range" && step < TOTAL_STEPS - 1;
  const canReset = step > -1 || range !== null;

  const beginPipeline = (): boolean => {
    setError(null);
    if (mode === "insert") {
      const key = insertKey.trim().toLowerCase();
      if (!key) return false;
      if (items.some((it) => it.key === key)) {
        setError(`"${key}" は既に存在する`);
        return false;
      }
      const rowId = rowIdFor(items.length);
      setItems((prev) => [...prev, { key, rowId }]);
      setPendingKey(key);
    }
    return true;
  };

  const stepOnce = () => {
    if (mode === "range") return;
    setRunning(false);
    if (step === -1) {
      if (!beginPipeline()) return;
      setStep(0);
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const toggleAutoplay = () => {
    if (mode === "range") return;
    if (running) {
      setRunning(false);
      return;
    }
    if (step === -1) {
      if (!beginPipeline()) return;
      setStep(0);
      setRunning(true);
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      setRunning(true);
    }
  };

  const runRangeSearch = () => {
    setError(null);
    if (!rangeFrom || !rangeTo) return;
    setRange({ from: rangeFrom, to: rangeTo });
  };

  const resetProgress = () => {
    setStep(-1);
    setRunning(false);
    setPendingKey(null);
    setRange(null);
    setError(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetProgress();
  };

  const changeBucketCount = (n: number) => {
    setBucketCount(n);
    resetProgress();
  };

  const resetAll = () => {
    setItems(INITIAL_ITEMS);
    resetProgress();
  };

  const currentKey =
    mode === "insert" ? insertKey : mode === "equal" ? query : "";
  const currentHash = rawHash(currentKey);
  const currentBucket = currentKey ? currentHash % bucketCount : 0;

  const isKeyMatched = (key: string) => {
    if (mode === "equal" && step >= TOTAL_STEPS - 1 && key === query) {
      return bucketOf(query, bucketCount) === bucketOf(key, bucketCount);
    }
    if (mode === "range" && range && key >= range.from && key <= range.to) {
      return true;
    }
    if (mode === "insert" && step >= TOTAL_STEPS - 1 && key === pendingKey) {
      return true;
    }
    return false;
  };

  const bucketState = (i: number): "target" | "inserted" | "scanned" | null => {
    if (mode === "equal" && step >= TOTAL_STEPS - 1 && i === currentBucket)
      return "target";
    if (mode === "insert" && step >= TOTAL_STEPS - 1 && i === currentBucket)
      return "inserted";
    if (mode === "range" && range) return "scanned";
    return null;
  };

  return (
    <VizFrame
      title="ハッシュインデックスの動き"
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex border border-[var(--border-strong)]">
            {(["equal", "range", "insert"] as Mode[]).map((m, idx) => {
              const label =
                m === "equal" ? "等価検索" : m === "range" ? "範囲検索" : "挿入";
              return (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold",
                    mode === m
                      ? "bg-[var(--foreground)] text-white"
                      : "bg-white hover:bg-[var(--muted)]",
                    idx > 0 && "border-l border-[var(--border-strong)]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {mode === "equal" && (
            <div key="equal" className="flex items-center gap-2">
              <label className="text-sm font-semibold">
                探すキー：
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    resetProgress();
                  }}
                  disabled={running}
                  className="ml-2 w-32 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm font-mono"
                />
              </label>
              <Button size="sm" onClick={stepOnce} disabled={!canAdvance}>
                1ステップ
              </Button>
              <Button
                size="sm"
                variant={running ? "secondary" : "primary"}
                onClick={toggleAutoplay}
                disabled={!canAdvance}
              >
                {running ? "一時停止" : "自動再生"}
              </Button>
            </div>
          )}

          {mode === "range" && (
            <div key="range" className="flex items-center gap-2 text-sm">
              <span className="font-semibold">キー範囲：</span>
              <input
                type="text"
                value={rangeFrom}
                onChange={(e) => {
                  setRangeFrom(e.target.value);
                  setRange(null);
                }}
                className="w-16 border border-[var(--border-strong)] bg-white px-2 py-1 font-mono"
              />
              <span className="text-[var(--muted-foreground)]">〜</span>
              <input
                type="text"
                value={rangeTo}
                onChange={(e) => {
                  setRangeTo(e.target.value);
                  setRange(null);
                }}
                className="w-16 border border-[var(--border-strong)] bg-white px-2 py-1 font-mono"
              />
              <Button size="sm" onClick={runRangeSearch}>
                全走査
              </Button>
            </div>
          )}

          {mode === "insert" && (
            <div key="insert" className="flex items-center gap-2">
              <label className="text-sm font-semibold">
                挿入キー：
                <input
                  type="text"
                  value={insertKey}
                  onChange={(e) => {
                    setInsertKey(e.target.value);
                    resetProgress();
                  }}
                  disabled={running}
                  className="ml-2 w-32 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm font-mono"
                />
              </label>
              <Button size="sm" onClick={stepOnce} disabled={!canAdvance}>
                1ステップ
              </Button>
              <Button
                size="sm"
                variant={running ? "secondary" : "primary"}
                onClick={toggleAutoplay}
                disabled={!canAdvance}
              >
                {running ? "一時停止" : "自動再生"}
              </Button>
            </div>
          )}

          {(mode === "equal" || mode === "insert") && (
            <Button
              size="sm"
              variant="secondary"
              onClick={resetProgress}
              disabled={!canReset}
            >
              リセット
            </Button>
          )}

          <label className="text-sm font-semibold">
            バケット数：
            <select
              value={bucketCount}
              onChange={(e) => changeBucketCount(Number(e.target.value))}
              disabled={running}
              className="ml-2 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm"
            >
              {BUCKET_COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Button size="sm" variant="secondary" onClick={resetAll}>
            全リセット
          </Button>
        </div>
      }
      legend={
        mode === "range" ? (
          <span>
            ハッシュ値は元の値の大小関係を保存しないため、範囲検索ではインデックスが機能せず、全バケット走査（フルスキャン相当）になる。
          </span>
        ) : mode === "insert" ? (
          <span>
            新しいキーもハッシュ関数を通してバケット番号を求め、そのバケットに追加する。O(1)で場所が決まる。
          </span>
        ) : (
          <span>
            バケット内の各エントリは <code>キー → 行ID</code> の組。
            「1ステップ」で入力からバケット到達までの流れを順に追う。
          </span>
        )
      }
    >
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <div>
          {mode === "range" ? (
            <RangePanel range={range} items={items} bucketCount={bucketCount} />
          ) : (
            <Pipeline
              mode={mode}
              currentKey={currentKey}
              currentHash={currentHash}
              currentBucket={currentBucket}
              bucketCount={bucketCount}
              step={step}
              pendingKey={pendingKey}
              error={error}
              queryFound={
                mode === "equal" &&
                step >= TOTAL_STEPS - 1 &&
                buckets[currentBucket]?.some((it) => it.key === query)
              }
              query={query}
            />
          )}
        </div>

        <div className="space-y-2">
          {buckets.map((entries, i) => {
            const state = bucketState(i);
            const highlight = state === "target" || state === "inserted";
            return (
              <motion.div
                key={i}
                animate={{
                  borderColor: highlight
                    ? "#0a0a0a"
                    : state === "scanned"
                    ? "#6b6b68"
                    : "#d9d9d5",
                }}
                className="border-2 p-3"
              >
                <div className="mb-2 flex items-center gap-2 flex-wrap text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  <span>バケット {i}</span>
                  {state === "target" && (
                    <span className="border border-[var(--foreground)] px-1.5 py-0 text-[var(--foreground)]">
                      アクセス中
                    </span>
                  )}
                  {state === "inserted" && (
                    <span className="border border-[var(--foreground)] px-1.5 py-0 text-[var(--foreground)]">
                      挿入先
                    </span>
                  )}
                  {state === "scanned" && (
                    <span className="border border-[var(--muted-foreground)] px-1.5 py-0 text-[var(--muted-foreground)]">
                      走査中
                    </span>
                  )}
                  {entries.length >= 2 && (
                    <span className="ml-auto normal-case tracking-normal font-normal text-[var(--muted-foreground)]">
                      衝突: {entries.length}件を線形探索
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entries.length === 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      空
                    </span>
                  )}
                  <AnimatePresence>
                    {entries.map((e) => {
                      const matched = isKeyMatched(e.key);
                      return (
                        <motion.span
                          key={e.key}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className={cn(
                            "px-2 py-1 font-mono text-xs",
                            matched
                              ? "bg-[var(--foreground)] text-white"
                              : "bg-[var(--muted)] text-[var(--foreground)]"
                          )}
                        >
                          {e.key} <span className="opacity-70">→</span>{" "}
                          {e.rowId}
                        </motion.span>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </VizFrame>
  );
}

function Pipeline({
  mode,
  currentKey,
  currentHash,
  currentBucket,
  bucketCount,
  step,
  pendingKey,
  error,
  queryFound,
  query,
}: {
  mode: Mode;
  currentKey: string;
  currentHash: number;
  currentBucket: number;
  bucketCount: number;
  step: number;
  pendingKey: string | null;
  error: string | null;
  queryFound: boolean | undefined;
  query: string;
}) {
  const finalLabel =
    mode === "insert"
      ? `4. バケット${currentBucket} に追加`
      : `4. バケット${currentBucket} を線形探索`;

  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        計算の流れ {step >= 0 ? `(${step + 1}/${TOTAL_STEPS})` : ""}
      </div>

      {step === -1 && (
        <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
          「1ステップ」で入力からバケット到達までを順に追う。「自動再生」で連続再生。
        </p>
      )}

      {error && (
        <div className="mt-3 border-l-2 border-[var(--foreground)] pl-3 py-1 text-xs leading-relaxed">
          {error}
        </div>
      )}

      <div className="mt-3 space-y-3">
        <StageRow
          index={0}
          step={step}
          label="1. 入力を受け取る"
          content={
            <>
              key = <strong>&quot;{currentKey}&quot;</strong>
            </>
          }
        />
        <StageRow
          index={1}
          step={step}
          label="2. ハッシュ関数を通す"
          content={
            <>
              hash(&quot;{currentKey}&quot;) = <strong>{currentHash}</strong>
            </>
          }
        />
        <StageRow
          index={2}
          step={step}
          label={`3. ${bucketCount} で割った余りを取る`}
          content={
            <div>
              {currentHash} % {bucketCount} ={" "}
              <strong>{currentBucket}</strong>
            </div>
          }
        />
        <StageRow
          index={3}
          step={step}
          label={finalLabel}
          content={
            mode === "insert" ? (
              <>
                <strong>&quot;{pendingKey}&quot;</strong>{" "}
                をバケット{currentBucket} に追加した。
              </>
            ) : queryFound ? (
              <>
                バケット{currentBucket} 内で{" "}
                <strong>&quot;{query}&quot;</strong> を発見。
              </>
            ) : (
              <>
                バケット{currentBucket} に{" "}
                <strong>&quot;{query}&quot;</strong> は存在しない。
              </>
            )
          }
        />
      </div>
    </div>
  );
}

function StageRow({
  index,
  step,
  label,
  content,
}: {
  index: number;
  step: number;
  label: string;
  content: React.ReactNode;
}) {
  const active = step >= index;
  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0.35 }}
      className={cn(
        "border-l-2 pl-3 py-0.5",
        active ? "border-[var(--foreground)]" : "border-[var(--border)]"
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </div>
      {active && (
        <div className="mt-1 font-mono text-xs leading-relaxed">{content}</div>
      )}
    </motion.div>
  );
}

function RangePanel({
  range,
  items,
  bucketCount,
}: {
  range: RangeResult;
  items: Item[];
  bucketCount: number;
}) {
  const matchCount = range
    ? items.filter((it) => it.key >= range.from && it.key <= range.to).length
    : 0;
  return (
    <>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        なぜ範囲検索は効かないか
      </div>
      <p className="mt-2 text-sm leading-relaxed">
        ハッシュ関数は「近い値 → 近いハッシュ値」を保証しない。
        隣り合う値が全く違うバケットに、離れた値が同じバケットに入る。
      </p>
      {range && (
        <div className="mt-4 border-l-2 border-[var(--foreground)] pl-3 text-xs leading-relaxed">
          範囲{" "}
          <code>
            {range.from} 〜 {range.to}
          </code>{" "}
          を探すには、<strong>{bucketCount}つのバケット全部</strong>
          を走査するしかない（= フルスキャン相当）。
          <div className="mt-1 text-[var(--muted-foreground)]">
            結果: {matchCount}件が該当
          </div>
        </div>
      )}
    </>
  );
}
