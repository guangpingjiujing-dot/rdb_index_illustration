"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";
import { Button } from "@/components/ui/Button";

const BUCKETS = 5;

function hash(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % BUCKETS;
}

const INITIAL_ITEMS = [
  { key: "sato" },
  { key: "tanaka" },
  { key: "suzuki" },
  { key: "ito" },
  { key: "nakamura" },
  { key: "yamada" },
  { key: "kobayashi" },
  { key: "watanabe" },
  { key: "takahashi" },
  { key: "saito" },
  { key: "kato" },
];

export function HashViz() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [query, setQuery] = useState("suzuki");
  const [highlight, setHighlight] = useState<{
    bucket: number;
    key: string | null;
  } | null>(null);

  const buckets: { key: string }[][] = Array.from({ length: BUCKETS }, () => []);
  for (const it of items) {
    buckets[hash(it.key)].push(it);
  }

  const doSearch = () => {
    const b = hash(query);
    const found = buckets[b].find((it) => it.key === query);
    setHighlight({ bucket: b, key: found ? found.key : null });
  };
  const reset = () => {
    setHighlight(null);
    setItems(INITIAL_ITEMS);
  };

  return (
    <VizFrame
      title="ハッシュインデックスの動き"
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">
            探すキー：
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(null);
              }}
              className="ml-2 w-32 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm font-mono"
            />
          </label>
          <Button size="sm" onClick={doSearch}>
            等価検索
          </Button>
          <Button size="sm" variant="secondary" onClick={reset}>
            リセット
          </Button>
        </div>
      }
      legend={
        <span>
          ハッシュ関数がキーをバケット番号に変換 → そのバケット内だけを見るのでO(1)。ただしキーが順序を持たないため範囲検索・並び替えには使えない。
        </span>
      }
    >
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            計算の流れ
          </div>
          <div className="mt-2 space-y-1 font-mono text-xs border-l border-[var(--border-strong)] pl-3">
            <div>
              入力: <span className="font-bold">&quot;{query}&quot;</span>
            </div>
            <div className="text-[var(--muted-foreground)]">↓ hash()</div>
            <div>
              ハッシュ値: <span className="font-bold">{hash(query)}</span>
            </div>
            <div className="text-[var(--muted-foreground)]">↓ % {BUCKETS}</div>
            <div>
              バケット番号:{" "}
              <span className="bg-[var(--foreground)] text-white px-1.5 py-0.5">
                {hash(query)}
              </span>
            </div>
          </div>
          {highlight && (
            <div
              className={`mt-4 border-l-2 pl-3 text-xs leading-relaxed ${
                highlight.key
                  ? "border-[var(--foreground)]"
                  : "border-[var(--foreground)] text-[var(--foreground)]"
              }`}
            >
              {highlight.key
                ? `バケット${highlight.bucket}内で "${highlight.key}" を発見。`
                : `バケット${highlight.bucket}に "${query}" は存在しない。`}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {buckets.map((entries, i) => {
            const active = highlight?.bucket === i;
            return (
              <motion.div
                key={i}
                animate={{
                  borderColor: active ? "#0a0a0a" : "#d9d9d5",
                }}
                className="border p-3"
              >
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  バケット {i}
                  {active && (
                    <span className="border border-[var(--foreground)] px-1.5 py-0 text-[var(--foreground)]">
                      アクセス中
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entries.length === 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">空</span>
                  )}
                  {entries.map((e) => {
                    const isFound =
                      highlight?.bucket === i && highlight?.key === e.key;
                    return (
                      <span
                        key={e.key}
                        className={`px-2 py-1 font-mono text-xs ${
                          isFound
                            ? "bg-[var(--foreground)] text-white"
                            : "bg-[var(--muted)] text-[var(--foreground)]"
                        }`}
                      >
                        {e.key}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </VizFrame>
  );
}
