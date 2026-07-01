"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";

type Row = { last: string; first: string; age: number };

const ROWS: Row[] = [
  { last: "Ito", first: "Ken", age: 34 },
  { last: "Sato", first: "Aki", age: 28 },
  { last: "Sato", first: "Ken", age: 41 },
  { last: "Sato", first: "Yuki", age: 22 },
  { last: "Suzuki", first: "Aki", age: 30 },
  { last: "Suzuki", first: "Ken", age: 27 },
  { last: "Suzuki", first: "Yuki", age: 45 },
  { last: "Tanaka", first: "Aki", age: 38 },
  { last: "Tanaka", first: "Ken", age: 29 },
  { last: "Tanaka", first: "Yuki", age: 33 },
  { last: "Yamada", first: "Ken", age: 51 },
];

const sorted = [...ROWS].sort(
  (a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first)
);

type Query = "last-only" | "last-first" | "first-only";

const QUERIES: Record<Query, { sql: string; predicate: (r: Row) => boolean; label: string }> = {
  "last-only": {
    sql: `WHERE last = 'Sato'`,
    predicate: (r) => r.last === "Sato",
    label: "先頭カラムだけの条件",
  },
  "last-first": {
    sql: `WHERE last = 'Sato' AND first = 'Ken'`,
    predicate: (r) => r.last === "Sato" && r.first === "Ken",
    label: "先頭＋2番目",
  },
  "first-only": {
    sql: `WHERE first = 'Ken'`,
    predicate: (r) => r.first === "Ken",
    label: "2番目カラムだけの条件（先頭スキップ）",
  },
};

export function CompositeViz() {
  const [q, setQ] = useState<Query>("last-only");
  const query = QUERIES[q];

  const usesIndex = q !== "first-only";

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
        <div>
          <div className="mb-2 text-sm font-bold">
            インデックス <code>(last, first)</code> のエントリ
          </div>
          <div className="border border-[var(--border)]">
            <div className="grid grid-cols-[4rem_4rem_4rem] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)]">
              <div>last</div>
              <div>first</div>
              <div>→ row</div>
            </div>
            {sorted.map((r, i) => {
              const matched = query.predicate(r);
              return (
                <motion.div
                  key={`${r.last}-${r.first}-${i}`}
                  animate={{
                    backgroundColor: matched ? "#0a0a0a" : "#ffffff",
                    color: matched ? "#ffffff" : "#0a0a0a",
                  }}
                  className="grid grid-cols-[4rem_4rem_4rem] items-center border-t border-[var(--border)] px-3 py-1 font-mono text-xs"
                >
                  <span className="font-bold">{r.last}</span>
                  <span>{r.first}</span>
                  <span className="opacity-70">
                    #{ROWS.indexOf(r)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3">{`SELECT *\nFROM people\n${query.sql};`}</pre>

          <div className={`mt-6 border-l-2 pl-4 py-1 ${usesIndex ? "border-[var(--foreground)]" : "border-[var(--foreground)]"}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {usesIndex ? "インデックスが効く" : "インデックスが効かない"}
            </div>
            <p className="mt-1 text-sm leading-relaxed">
              {q === "last-only" &&
                "先頭カラム last で絞り込むので、辞書の「さ」行を探すのと同じイメージ。連続した範囲だけを読める。"}
              {q === "last-first" &&
                "last→first の順に絞り込むので、より狭い範囲を一発で特定できる。最も効くパターン。"}
              {q === "first-only" &&
                "先頭カラム last が条件に無いため、インデックスの中を先頭から辿ることができず、ほぼ全走査になる。カラム順が重要な理由。"}
            </p>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
