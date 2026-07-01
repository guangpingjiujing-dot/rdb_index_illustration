"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VizFrame } from "./VizFrame";
import { Button } from "@/components/ui/Button";

type Row = { id: number; name: string };

const PAGES: Row[][] = [
  [
    { id: 42, name: "Sato" },
    { id: 15, name: "Tanaka" },
    { id: 83, name: "Suzuki" },
    { id: 27, name: "Ito" },
  ],
  [
    { id: 61, name: "Nakamura" },
    { id: 4, name: "Yamada" },
    { id: 99, name: "Kobayashi" },
    { id: 33, name: "Watanabe" },
  ],
  [
    { id: 71, name: "Takahashi" },
    { id: 8, name: "Saito" },
    { id: 55, name: "Kato" },
    { id: 19, name: "Yoshida" },
  ],
];

type Mode = "lookup" | "scan";

export function PageStorageViz() {
  const [mode, setMode] = useState<Mode>("lookup");
  const [rowIdText, setRowIdText] = useState("2:1");
  const [target, setTarget] = useState<{ page: number; offset: number } | null>({
    page: 2,
    offset: 1,
  });
  const [scanCursor, setScanCursor] = useState<number>(-1);

  const applyLookup = () => {
    const m = rowIdText.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
    if (!m) {
      setTarget(null);
      return;
    }
    const page = Number(m[1]);
    const offset = Number(m[2]);
    if (
      page < 1 ||
      page > PAGES.length ||
      offset < 0 ||
      offset >= PAGES[page - 1].length
    ) {
      setTarget(null);
      return;
    }
    setTarget({ page, offset });
  };

  const runScan = async () => {
    setScanCursor(-1);
    for (let i = 0; i < PAGES.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      setScanCursor(i);
    }
  };
  const reset = () => {
    setScanCursor(-1);
  };

  return (
    <VizFrame
      title="ページと行ID"
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex border border-[var(--border-strong)]">
            <button
              onClick={() => {
                setMode("lookup");
                reset();
              }}
              className={`px-3 py-1.5 text-xs font-semibold ${
                mode === "lookup"
                  ? "bg-[var(--foreground)] text-white"
                  : "bg-white hover:bg-[var(--muted)]"
              }`}
            >
              行IDで1ページだけ読む
            </button>
            <button
              onClick={() => {
                setMode("scan");
              }}
              className={`px-3 py-1.5 text-xs font-semibold border-l border-[var(--border-strong)] ${
                mode === "scan"
                  ? "bg-[var(--foreground)] text-white"
                  : "bg-white hover:bg-[var(--muted)]"
              }`}
            >
              全ページを順に読む
            </button>
          </div>

          {mode === "lookup" ? (
            <div key="lookup-controls" className="flex items-center gap-2">
              <label className="text-sm font-semibold">
                行ID (page:offset)：
                <input
                  type="text"
                  value={rowIdText}
                  onChange={(e) => setRowIdText(e.target.value)}
                  className="ml-2 w-20 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm font-mono"
                  placeholder="2:1"
                />
              </label>
              <Button size="sm" onClick={applyLookup}>
                読む
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={runScan}>
              スキャン再生
            </Button>
          )}
        </div>
      }
      legend={
        <span>
          RDBはディスクとの間で行ではなく <strong>ページ単位</strong>（多くは8KB前後）でデータをやり取りする。1回のI/Oで1ページ = 数行〜数十行が一緒に読まれる。
        </span>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            テーブル users のディスク配置
          </div>
          <div className="mt-2 space-y-3">
            {PAGES.map((rows, pageIdx) => {
              const pageNo = pageIdx + 1;
              const isLookupHit =
                mode === "lookup" && target?.page === pageNo;
              const isScanned =
                mode === "scan" && scanCursor >= pageIdx;
              const isReading = mode === "scan" && scanCursor === pageIdx;
              return (
                <motion.div
                  key={pageNo}
                  animate={{
                    borderColor:
                      isLookupHit || isReading ? "#0a0a0a" : "#d9d9d5",
                    borderWidth: isLookupHit || isReading ? 2 : 1,
                    backgroundColor: isScanned && !isReading ? "#f0f0ee" : "#ffffff",
                  }}
                  className="border"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    <span>Page {pageNo}</span>
                    <span className="font-mono lowercase tracking-normal">
                      約8KB
                    </span>
                  </div>
                  <div className="grid grid-cols-4">
                    {rows.map((r, i) => {
                      const isTargetRow =
                        isLookupHit && target?.offset === i;
                      return (
                        <motion.div
                          key={`${pageNo}-${i}`}
                          initial={{ backgroundColor: "#ffffff", color: "#0a0a0a" }}
                          animate={{
                            backgroundColor: isTargetRow ? "#0a0a0a" : "#ffffff",
                            color: isTargetRow ? "#ffffff" : "#0a0a0a",
                          }}
                          className="border-r last:border-r-0 border-[var(--border)] px-3 py-2 text-xs font-mono"
                        >
                          <div className="text-[9px] uppercase tracking-wider opacity-60">
                            offset {i}
                          </div>
                          <div className="mt-0.5 font-bold">id={r.id}</div>
                          <div className="opacity-70">{r.name}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            用語
          </div>
          <dl className="mt-2 space-y-3 text-sm">
            <div>
              <dt className="font-bold">ページ / ブロック</dt>
              <dd className="text-[var(--muted-foreground)] leading-relaxed">
                ディスクI/Oの単位。1ページに複数行がまとまって入る。
              </dd>
            </div>
            <div>
              <dt className="font-bold">行ID</dt>
              <dd className="text-[var(--muted-foreground)] leading-relaxed">
                <code>(page, offset)</code> の組。1行を一意に指すポインタ。
              </dd>
            </div>
            <div>
              <dt className="font-bold">物理I/O</dt>
              <dd className="text-[var(--muted-foreground)] leading-relaxed">
                ページをディスクから読む操作。1回で数ミリ秒かかる。
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-l-2 border-[var(--foreground)] pl-4 py-1 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              状況
            </div>
            <p className="mt-1 leading-relaxed">
              {mode === "lookup" ? (
                target ? (
                  <>
                    行ID <span className="font-mono font-bold">{target.page}:{target.offset}</span> が指すページを <strong>1回のI/O</strong> で読み込み、その中から目的の行を取り出す。
                  </>
                ) : (
                  <>形式は <span className="font-mono">page:offset</span>（例: <span className="font-mono">2:1</span>）。範囲は 1:0 〜 {PAGES.length}:{PAGES[0].length - 1}。</>
                )
              ) : scanCursor < 0 ? (
                <>フルスキャンは全ページを順に読む。1ページ読むごとに数ミリ秒 × ページ数分の時間がかかる。</>
              ) : scanCursor < PAGES.length - 1 ? (
                <>Page {scanCursor + 1} を読み込み中…（合計 {PAGES.length} ページを順に読む）</>
              ) : (
                <>全 {PAGES.length} ページを読み終えた。行数ではなく <strong>ページ数</strong> が実際のI/O回数。</>
              )}
            </p>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
