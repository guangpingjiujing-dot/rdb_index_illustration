"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";
import { Button } from "@/components/ui/Button";

type Row = { id: number; name: string; email: string };

const SAMPLE: Row[] = [
  { id: 42, name: "Sato", email: "sato@example.com" },
  { id: 15, name: "Tanaka", email: "tanaka@example.com" },
  { id: 83, name: "Suzuki", email: "suzuki@example.com" },
  { id: 27, name: "Ito", email: "ito@example.com" },
  { id: 61, name: "Nakamura", email: "nakamura@example.com" },
  { id: 4, name: "Yamada", email: "yamada@example.com" },
  { id: 99, name: "Kobayashi", email: "kobayashi@example.com" },
  { id: 33, name: "Watanabe", email: "watanabe@example.com" },
  { id: 71, name: "Takahashi", email: "takahashi@example.com" },
  { id: 8, name: "Saito", email: "saito@example.com" },
  { id: 55, name: "Kato", email: "kato@example.com" },
  { id: 19, name: "Yoshida", email: "yoshida@example.com" },
  { id: 88, name: "Yamamoto", email: "yamamoto@example.com" },
  { id: 66, name: "Kimura", email: "kimura@example.com" },
  { id: 12, name: "Hayashi", email: "hayashi@example.com" },
];

export function FullScanViz() {
  const [target, setTarget] = useState<number>(55);
  const [cursor, setCursor] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const [foundAt, setFoundAt] = useState<number | null>(null);

  const targetOptions = useMemo(
    () => Array.from(new Set(SAMPLE.map((r) => r.id))).sort((a, b) => a - b),
    []
  );

  useEffect(() => {
    if (!running) return;
    if (cursor >= SAMPLE.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => {
      const next = cursor + 1;
      if (SAMPLE[next]?.id === target) {
        setCursor(next);
        setFoundAt(next);
        setRunning(false);
        return;
      }
      setCursor(next);
    }, 220);
    return () => clearTimeout(t);
  }, [running, cursor, target]);

  const start = () => {
    setCursor(-1);
    setFoundAt(null);
    setRunning(true);
  };
  const reset = () => {
    setCursor(-1);
    setFoundAt(null);
    setRunning(false);
  };

  const scannedCount = cursor + 1;

  return (
    <VizFrame
      title="フルテーブルスキャンの動き"
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">
            探す id：
            <select
              className="ml-2 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm"
              value={target}
              onChange={(e) => {
                setTarget(Number(e.target.value));
                reset();
              }}
              disabled={running}
            >
              {targetOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <Button size="sm" onClick={start} disabled={running}>
            スキャン開始
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={reset}
            disabled={running}
          >
            リセット
          </Button>
          <div className="ml-auto text-sm text-[var(--muted-foreground)] font-mono">
            読んだ行数 <span className="font-bold text-[var(--foreground)]">{scannedCount}</span> / {SAMPLE.length}
          </div>
        </div>
      }
      legend={
        <span>
          テーブルは <code>id</code> でソートされていない前提。目的の行が末尾に近いほど、フルスキャンは遅くなる。
        </span>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_18rem]">
        <div className="border border-[var(--border)]">
          <div className="grid grid-cols-[4rem_1fr_1fr] bg-[var(--muted)] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            <div>id</div>
            <div>name</div>
            <div>email</div>
          </div>
          <ul>
            {SAMPLE.map((row, i) => {
              const isReading = i === cursor && foundAt === null;
              const isFound = foundAt === i;
              const isPast = i < cursor && !isFound;
              return (
                <motion.li
                  key={row.id}
                  animate={{
                    backgroundColor: isFound
                      ? "#0a0a0a"
                      : isReading
                      ? "#d9d9d5"
                      : isPast
                      ? "#f5f5f4"
                      : "#ffffff",
                    color: isFound ? "#ffffff" : "#0a0a0a",
                  }}
                  transition={{ duration: 0.12 }}
                  className="grid grid-cols-[4rem_1fr_1fr] items-center px-3 py-1.5 text-sm border-t border-[var(--border)]"
                >
                  <div className="font-mono font-semibold">{row.id}</div>
                  <div className="opacity-80">{row.name}</div>
                  <div className="opacity-80 truncate">{row.email}</div>
                </motion.li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            SQL
          </div>
          <pre className="mt-1 text-xs font-mono border border-[var(--border)] bg-white p-3">{`SELECT *\nFROM users\nWHERE id = ${target};`}</pre>

          <div className="mt-6 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            状況
          </div>
          <p className="mt-1 text-sm leading-relaxed">
            {foundAt !== null ? (
              <>
                <span className="font-bold">{scannedCount}行目で発見。</span>
                もし全部で1000万件あって対象が中央にあると、平均で500万行の読み取りが発生する。
              </>
            ) : running ? (
              <>先頭から1行ずつ順に読んでいる…</>
            ) : (
              <>
                「スキャン開始」を押すと、先頭から順に走査していく様子が見える。
                検索対象が末尾の <code>88</code> や <code>99</code> のときと、先頭付近の <code>4</code> のときで比べてみるとよい。
              </>
            )}
          </p>
        </div>
      </div>
    </VizFrame>
  );
}
