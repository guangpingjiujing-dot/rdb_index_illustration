"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";
import { BTreeNote } from "./BTreeNote";

const ROWS_PER_PAGE = 4;

function rowIdFor(i: number) {
  const page = Math.floor(i / ROWS_PER_PAGE) + 1;
  const offset = i % ROWS_PER_PAGE;
  return `(${page},${offset})`;
}

type User = { email: string; deleted_at: string | null };

const USERS: User[] = [
  { email: "alice@example.com", deleted_at: null },
  { email: "bob@example.com", deleted_at: "2025-06-01" },
  { email: "carol@example.com", deleted_at: null },
  { email: "dave@example.com", deleted_at: null },
  { email: "eve@example.com", deleted_at: "2025-05-20" },
  { email: "frank@example.com", deleted_at: null },
  { email: "grace@example.com", deleted_at: "2025-04-10" },
  { email: "henry@example.com", deleted_at: null },
  { email: "ivy@example.com", deleted_at: null },
  { email: "jack@example.com", deleted_at: null },
];

// インデックスは email 順にソート
const sortedIndex = USERS.map((u, i) => ({
  ...u,
  rowId: rowIdFor(i),
})).sort((a, b) => a.email.localeCompare(b.email));

export function PartialViz() {
  const [mode, setMode] = useState<"full" | "partial">("full");
  const partial = mode === "partial";
  const inIndex = (u: User) => (partial ? u.deleted_at === null : true);
  const included = USERS.filter(inIndex);

  const createIndexSql = partial
    ? `-- 部分インデックス（未削除ユーザーのみ）
CREATE INDEX idx_users_email_active
  ON users (email)
  WHERE deleted_at IS NULL;`
    : `-- 通常インデックス（全行を含む）
CREATE INDEX idx_users_email
  ON users (email);`;

  const selectSql = `-- 検索クエリ
SELECT *
FROM users
WHERE email = 'alice@example.com'
  AND deleted_at IS NULL;`;

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
            部分インデックス（deleted_at IS NULL）
          </button>
        </div>
      }
      legend={
        <span>
          論理削除された行を除外して「アクティブなユーザーだけのインデックス」を作る典型例。インデックスサイズと更新コストを大きく減らせる。
        </span>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3 leading-relaxed">{`${createIndexSql}

${selectSql}`}</pre>

          <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              効果
            </div>
            <p className="mt-1 text-sm leading-relaxed">
              {partial
                ? `対象は未削除の ${included.length} 件だけなので、インデックスサイズが小さく、統計情報も無駄がない。削除済みユーザーへの更新は部分インデックスに一切影響しない。`
                : `全 ${USERS.length} 件を対象とするインデックス。削除済みユーザーの分もインデックスに含まれ、その分だけ肥大化する。`}
            </p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <div className="text-sm font-bold">
              インデックス <code>(email)</code>
              {partial && (
                <span className="text-[var(--muted-foreground)]">
                  {" "}
                  WHERE deleted_at IS NULL
                </span>
              )}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              エントリ{" "}
              <span className="font-bold text-[var(--foreground)]">
                {included.length}
              </span>{" "}
              / {USERS.length}
            </div>
          </div>
          <BTreeNote />
          <div className="mt-2 border border-[var(--border)]">
            <div className="grid grid-cols-[1fr_5.5rem_4rem] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)]">
              <div>email</div>
              <div>deleted_at</div>
              <div>→ 行ID</div>
            </div>
            {sortedIndex.map((u) => {
              const active = inIndex(u);
              const isDeleted = u.deleted_at !== null;
              return (
                <motion.div
                  key={u.email}
                  animate={{
                    opacity: active ? 1 : 0.2,
                  }}
                  className="grid grid-cols-[1fr_5.5rem_4rem] items-center border-t border-[var(--border)] px-3 py-1.5 font-mono text-xs"
                >
                  <span>{u.email}</span>
                  <span
                    className={
                      isDeleted
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]"
                    }
                  >
                    {u.deleted_at ?? "NULL"}
                  </span>
                  <span className="opacity-70">{u.rowId}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
