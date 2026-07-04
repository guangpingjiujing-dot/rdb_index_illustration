"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";

type Row = { id: number; name: string; email: string };

const ROWS_PER_PAGE = 4;

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

function rowId(index: number) {
  const page = Math.floor(index / ROWS_PER_PAGE) + 1;
  const offset = index % ROWS_PER_PAGE;
  return { page, offset, label: `(${page},${offset})` };
}

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
          左端は行ID <code>(page, offset)</code>で、ページ番号とページ内オフセットの組。
          クラスタ化表は<code>id</code>順に物理配置されているので、範囲検索の該当行が同じページ内に固まる。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        <TableView
          title="ヒープ表（非クラスタ）"
          caption="挿入順にバラバラ配置"
          rows={HEAP_ROWS}
          range={range}
          footNote="該当行が飛び地なので、範囲検索でも各行にランダムアクセスが必要。"
        />
        <TableView
          title="クラスタ化表"
          caption="キー順に物理配置"
          rows={CLUSTERED_ROWS}
          range={range}
          footNote="該当行が連続領域に固まっているのでシーケンシャル読み取りで効率的。"
        />
      </div>
    </VizFrame>
  );
}

function TableView({
  title,
  caption,
  rows,
  range,
  footNote,
}: {
  title: string;
  caption: string;
  rows: Row[];
  range: [number, number];
  footNote: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
          {caption}
        </div>
      </div>
      <div className="border border-[var(--border)]">
        <div className="grid grid-cols-[4.5rem_3rem_1fr] items-center bg-[var(--muted)] px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          <div>行ID</div>
          <div>id</div>
          <div>name</div>
        </div>
        {rows.map((r, i) => {
          const inRange = r.id >= range[0] && r.id <= range[1];
          const { page, offset, label } = rowId(i);
          const isNewPage = offset === 0 && i > 0;
          return (
            <motion.div
              key={r.id}
              animate={{
                backgroundColor: inRange ? "#0a0a0a" : "#ffffff",
                color: inRange ? "#ffffff" : "#0a0a0a",
              }}
              className={`grid grid-cols-[4.5rem_3rem_1fr] items-center px-2 py-1 text-xs border-t border-[var(--border)] ${
                isNewPage ? "border-t-2 border-t-[var(--border-strong)]" : ""
              }`}
              title={`Page ${page} · offset ${offset}`}
            >
              <span className="font-mono opacity-80">{label}</span>
              <span className="font-mono font-bold">{r.id}</span>
              <span className="opacity-80">{r.name}</span>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
        {footNote}
      </p>
    </div>
  );
}
