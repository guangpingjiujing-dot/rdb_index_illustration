"use client";

import { useState } from "react";
import { VizFrame } from "./VizFrame";

type Plan = {
  label: string;
  sql: string;
  tree: PlanNode;
};

type PlanNode = {
  name: string;
  cost: string;
  rows: string;
  detail: string;
  speed: "slow" | "fast" | "fastest";
};

const PLANS: Plan[] = [
  {
    label: "インデックスなし → SeqScan",
    sql: "SELECT * FROM users WHERE email = 'a@example.com';",
    tree: {
      name: "Seq Scan on users",
      cost: "cost=0..15420",
      rows: "推定 1 / 1,000,000",
      detail: "全行を舐めて email を比較。件数が多いほど遅い。",
      speed: "slow",
    },
  },
  {
    label: "B-treeインデックス → Index Scan",
    sql: "SELECT * FROM users WHERE email = 'a@example.com';",
    tree: {
      name: "Index Scan using idx_users_email",
      cost: "cost=0..8.30",
      rows: "推定 1 / 1,000,000",
      detail: "インデックスをたどって該当行を特定 → テーブルから該当行を取得。",
      speed: "fast",
    },
  },
  {
    label: "カバリング → Index Only Scan",
    sql: "SELECT email FROM users WHERE email = 'a@example.com';",
    tree: {
      name: "Index Only Scan using idx_users_email",
      cost: "cost=0..4.30",
      rows: "推定 1 / 1,000,000",
      detail: "インデックスだけで結果が返せるためテーブルアクセスが不要。",
      speed: "fastest",
    },
  },
];

const SPEED_LABEL: Record<PlanNode["speed"], string> = {
  slow: "遅い",
  fast: "速い",
  fastest: "最速",
};

export function ExplainViz() {
  const [i, setI] = useState(0);
  const plan = PLANS[i];

  return (
    <VizFrame
      title="EXPLAIN 出力の読み方"
      controls={
        <div className="flex flex-wrap gap-2">
          {PLANS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`px-3 py-1.5 text-xs font-semibold border ${
                i === idx
                  ? "bg-[var(--foreground)] text-white border-[var(--foreground)]"
                  : "bg-white border-[var(--border-strong)] hover:bg-[var(--muted)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
      legend={
        <span>
          EXPLAINは各ノードに「アクセス方法」「コスト見積り」「推定行数」を表示。<code>Seq Scan</code>が出ていたらまずインデックス化を検討。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3">{plan.sql}</pre>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            実行計画
          </div>
          <div className="mt-1 border-l-2 border-[var(--foreground)] pl-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-sm font-bold">
                {plan.tree.name}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider border border-[var(--foreground)] px-1.5 py-0.5">
                {SPEED_LABEL[plan.tree.speed]}
              </span>
            </div>
            <div className="mt-1 text-xs font-mono text-[var(--muted-foreground)]">
              {plan.tree.cost} / {plan.tree.rows}
            </div>
            <p className="mt-3 text-sm leading-relaxed">{plan.tree.detail}</p>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
