"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";
import { BTreeNote } from "./BTreeNote";

type Row = { last: string; first: string };

const ROWS_PER_PAGE = 4;

function rowIdFor(i: number) {
  const page = Math.floor(i / ROWS_PER_PAGE) + 1;
  const offset = i % ROWS_PER_PAGE;
  return `(${page},${offset})`;
}

// テーブル本体（物理配置＝挿入順、あえてバラバラ）
const ROWS: Row[] = [
  { last: "Sato", first: "Ken" },
  { last: "Yamada", first: "Ken" },
  { last: "Ito", first: "Ken" },
  { last: "Tanaka", first: "Yuki" },
  { last: "Suzuki", first: "Aki" },
  { last: "Sato", first: "Aki" },
  { last: "Tanaka", first: "Ken" },
  { last: "Suzuki", first: "Yuki" },
  { last: "Sato", first: "Yuki" },
  { last: "Tanaka", first: "Aki" },
  { last: "Suzuki", first: "Ken" },
];

type IndexEntry = { last: string; first: string; rowId: string };

// インデックスは (last, first) 順にソートされて格納される
const indexEntries: IndexEntry[] = ROWS.map((r, i) => ({
  ...r,
  rowId: rowIdFor(i),
})).sort(
  (a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first)
);

type Query = "last-only" | "last-first" | "first-only";

const QUERIES: Record<
  Query,
  {
    sql: string;
    predicate: (r: Row) => boolean;
    scanned: (r: Row) => boolean;
    label: string;
    strategy: string;
    explanation: string;
    usesIndex: boolean;
  }
> = {
  "last-only": {
    sql: "WHERE last = 'Sato'",
    predicate: (r) => r.last === "Sato",
    scanned: (r) => r.last === "Sato",
    label: "先頭カラムだけ",
    strategy: "先頭でピンポイント",
    explanation:
      "先頭カラム last で絞り込むので、辞書の「さ」行を探すのと同じ。連続した範囲だけを読む。",
    usesIndex: true,
  },
  "last-first": {
    sql: "WHERE last = 'Sato' AND first = 'Ken'",
    predicate: (r) => r.last === "Sato" && r.first === "Ken",
    scanned: (r) => r.last === "Sato" && r.first === "Ken",
    label: "先頭 + 2番目",
    strategy: "先頭+2番目でピンポイント",
    explanation:
      "last → first の順に絞り込むので、より狭い範囲を一発で特定できる。最も効くパターン。",
    usesIndex: true,
  },
  "first-only": {
    sql: "WHERE first = 'Ken'",
    predicate: (r) => r.first === "Ken",
    scanned: () => true,
    label: "2番目だけ（先頭スキップ）",
    strategy: "全走査（インデックス使えず）",
    explanation:
      "先頭カラム last が条件に無いため、インデックスを先頭から辿れず全走査になる。カラム順が重要な理由。",
    usesIndex: false,
  },
};

export function CompositeViz() {
  const [q, setQ] = useState<Query>("last-only");
  const query = QUERIES[q];
  const matchCount = indexEntries.filter(query.predicate).length;

  return (
    <VizFrame
      title="複合インデックスとカラム順"
      controls={
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(QUERIES) as Query[]).map((k) => (
            <button
              key={k}
              onClick={() => setQ(k)}
              className={`px-3 py-1.5 text-xs font-semibold border ${
                q === k
                  ? "bg-[var(--foreground)] text-white border-[var(--foreground)]"
                  : "bg-white border-[var(--border-strong)] hover:bg-[var(--muted)]"
              }`}
            >
              {QUERIES[k].label}
            </button>
          ))}
        </div>
      }
      legend={
        <span>
          インデックス <code>(last, first)</code> が定義されている。先頭カラムから連続して条件が指定されるほどインデックスが効く。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
        {/* Left: SQL + explanation */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3 leading-relaxed">{`-- インデックス定義
CREATE INDEX idx_last_first
  ON people (last, first);

-- 検索クエリ
SELECT *
FROM people
${query.sql};`}</pre>

          <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {query.usesIndex
                ? "インデックスが効く"
                : "インデックスが効かない"}
            </div>
            <p className="mt-1 text-sm leading-relaxed">{query.explanation}</p>
          </div>
        </div>

        {/* Right: Index entries */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-sm font-bold">
              インデックス <code>(last, first)</code>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              {query.strategy} · {matchCount}件該当
            </div>
          </div>
          <BTreeNote />
          <div className="mt-2 border border-[var(--border)]">
            <div className="grid grid-cols-[5rem_5rem_1fr] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)]">
              <div>last</div>
              <div>first</div>
              <div>→ 行ID</div>
            </div>
            {indexEntries.map((r, i) => {
              const matched = query.predicate(r);
              const scanned = query.scanned(r);
              return (
                <motion.div
                  key={`${r.last}-${r.first}-${i}`}
                  animate={{
                    backgroundColor: matched
                      ? "#0a0a0a"
                      : scanned
                      ? "#ebebe8"
                      : "#ffffff",
                    color: matched ? "#ffffff" : "#0a0a0a",
                  }}
                  className="grid grid-cols-[5rem_5rem_1fr] items-center border-t border-[var(--border)] px-3 py-1 font-mono text-xs"
                >
                  <span className="font-bold">{r.last}</span>
                  <span>{r.first}</span>
                  <span className="opacity-70">{r.rowId}</span>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 bg-[var(--foreground)]" />
              該当行
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 bg-[#ebebe8] border border-[var(--border-strong)]" />
              DBが読んだ行
            </span>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
