"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VizFrame } from "../VizFrame";
import { Button } from "@/components/ui/Button";
import {
  buildInitialTree,
  insert,
  layout,
  searchPath,
  KEY_W,
  KEY_PAD,
  NODE_H,
  type BNode,
} from "./btree-model";

type Mode = "search" | "insert";

export function BTreeViz() {
  const [tree, setTree] = useState<BNode>(() => buildInitialTree());
  const [mode, setMode] = useState<Mode>("search");
  const [target, setTarget] = useState<number>(17);
  const [pathStep, setPathStep] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const [foundState, setFoundState] = useState<"idle" | "found" | "notfound">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const laid = useMemo(() => layout(tree), [tree]);
  const path = useMemo(() => searchPath(tree, target), [tree, target]);

  useEffect(() => {
    if (!running) return;
    if (pathStep >= path.length - 1) {
      setRunning(false);
      const last = path[path.length - 1];
      if (last?.matchIndex !== undefined) {
        setFoundState("found");
        setMessage(`ルートから ${path.length} ノード辿るだけで発見。`);
      } else {
        setFoundState("notfound");
        setMessage(`${target} は木の中に存在しない（${path.length} ノードで判定）。`);
      }
      return;
    }
    const t = setTimeout(() => {
      setPathStep(pathStep + 1);
    }, 600);
    return () => clearTimeout(t);
  }, [running, pathStep, path, target]);

  const startSearch = () => {
    setPathStep(-1);
    setFoundState("idle");
    setMessage("");
    setRunning(true);
  };
  const reset = () => {
    setPathStep(-1);
    setRunning(false);
    setFoundState("idle");
    setMessage("");
  };
  const resetTree = () => {
    setTree(buildInitialTree());
    reset();
  };

  const doInsert = () => {
    const raw = inputRef.current?.value;
    if (!raw) return;
    const v = Number(raw);
    if (Number.isNaN(v)) return;
    setTree((prev) => insert(prev, v));
    setMessage(`${v} を挿入。ノードのキー数が上限（3）を超えると自動で分割される。`);
    if (inputRef.current) inputRef.current.value = "";
  };

  const activeNodeId =
    pathStep >= 0 && path[pathStep] ? path[pathStep].node.id : undefined;
  const visitedIds = new Set(
    path.slice(0, Math.max(0, pathStep)).map((s) => s.node.id)
  );
  const activeEdgeKey =
    pathStep >= 0 && path[pathStep]?.childIndex !== undefined
      ? `${path[pathStep].node.id}::${path[pathStep].childIndex}`
      : undefined;

  return (
    <VizFrame
      title="B-treeインデックス（探索・挿入）"
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex overflow-hidden border border-[var(--border-strong)]">
            <button
              onClick={() => {
                setMode("search");
                reset();
              }}
              className={`px-3 py-1.5 text-xs font-semibold ${
                mode === "search"
                  ? "bg-[var(--foreground)] text-white"
                  : "bg-white hover:bg-[var(--muted)]"
              }`}
            >
              探索モード
            </button>
            <button
              onClick={() => {
                setMode("insert");
                reset();
              }}
              className={`px-3 py-1.5 text-xs font-semibold border-l border-[var(--border-strong)] ${
                mode === "insert"
                  ? "bg-[var(--foreground)] text-white"
                  : "bg-white hover:bg-[var(--muted)]"
              }`}
            >
              挿入モード
            </button>
          </div>

          {mode === "search" ? (
            <div key="search-controls" className="flex items-center gap-2">
              <label className="text-sm font-semibold">
                探すキー：
                <input
                  type="number"
                  value={Number.isFinite(target) ? target : ""}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    setTarget(Number.isFinite(v) ? v : 0);
                    reset();
                  }}
                  disabled={running}
                  className="ml-2 w-20 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm"
                />
              </label>
              <Button size="sm" onClick={startSearch} disabled={running}>
                探索開始
              </Button>
            </div>
          ) : (
            <div key="insert-controls" className="flex items-center gap-2">
              <label className="text-sm font-semibold">
                挿入キー：
                <input
                  ref={inputRef}
                  type="number"
                  defaultValue={45}
                  className="ml-2 w-20 border border-[var(--border-strong)] bg-white px-2 py-1 text-sm"
                />
              </label>
              <Button size="sm" onClick={doInsert}>
                挿入
              </Button>
            </div>
          )}
          <Button size="sm" variant="secondary" onClick={resetTree}>
            木をリセット
          </Button>
        </div>
      }
      legend={
        <span>
          この木は「1ノードあたり最大3キー」の設定。実際のRDBのB-treeはノードあたり数百キー入るため、数億件でも数段の辿りで済む。
        </span>
      }
    >
      <div className="overflow-x-auto">
        <svg
          width={Math.max(laid.width + 40, 640)}
          height={laid.height + 60}
          className="mx-auto block"
          role="img"
          aria-label="B-tree構造"
        >
          <g transform="translate(20, 20)">
            {laid.edges.map((e) => {
              const key = `${e.fromId}::${e.childIndex}`;
              const isActive = activeEdgeKey === key;
              return (
                <motion.line
                  key={`${e.fromId}-${e.toId}`}
                  initial={false}
                  animate={{
                    x1: e.fromX,
                    y1: e.fromY,
                    x2: e.toX,
                    y2: e.toY,
                    stroke: isActive ? "#0a0a0a" : "#d4d4d4",
                    strokeWidth: isActive ? 2 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              );
            })}
            <AnimatePresence>
              {laid.nodes.map((n) => {
                const isActive = activeNodeId === n.id;
                const isVisited = visitedIds.has(n.id);
                const isMatch =
                  foundState === "found" && activeNodeId === n.id;
                const isNotFoundLeaf =
                  foundState === "notfound" && activeNodeId === n.id;

                let stroke = "#d4d4d4";
                let fill = "#ffffff";
                let textColor = "#0a0a0a";
                let strokeWidth = 1;
                if (isMatch) {
                  stroke = "#0a0a0a";
                  fill = "#0a0a0a";
                  textColor = "#ffffff";
                  strokeWidth = 2;
                } else if (isNotFoundLeaf) {
                  stroke = "#0a0a0a";
                  fill = "#ffffff";
                  strokeWidth = 2;
                } else if (isActive) {
                  stroke = "#0a0a0a";
                  fill = "#f0f0ee";
                  strokeWidth = 2;
                } else if (isVisited) {
                  stroke = "#a3a39f";
                  fill = "#ffffff";
                  strokeWidth = 1;
                }
                return (
                  <motion.g
                    key={n.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{
                      x: n.x,
                      y: n.y,
                      opacity: 1,
                      scale: isActive ? 1.03 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  >
                    <motion.rect
                      width={n.width}
                      height={NODE_H}
                      rx={0}
                      initial={{
                        fill: "#ffffff",
                        stroke: "#d4d4d4",
                        strokeWidth: 1,
                      }}
                      animate={{ fill, stroke, strokeWidth }}
                    />
                    {n.keys.map((k, i) => (
                      <g key={`${n.id}-${k}-${i}`}>
                        {i > 0 && (
                          <line
                            x1={KEY_PAD + i * KEY_W}
                            y1={6}
                            x2={KEY_PAD + i * KEY_W}
                            y2={NODE_H - 6}
                            stroke={isMatch ? "#a3a39f" : "#d4d4d4"}
                            strokeWidth={1}
                          />
                        )}
                        <text
                          x={KEY_PAD + i * KEY_W + KEY_W / 2}
                          y={NODE_H / 2 + 5}
                          textAnchor="middle"
                          className="font-mono font-bold"
                          style={{ fontSize: 14 }}
                          fill={textColor}
                        >
                          {k}
                        </text>
                      </g>
                    ))}
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>
        </svg>
      </div>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          状況
        </div>
        <p className="mt-1 text-sm leading-relaxed">
          {message ||
            (mode === "search"
              ? "「探索開始」で、ルートから目的の値までノードを辿るアニメーションを再生。"
              : "「挿入」で値を追加。3キー超になったノードは中央値を親に押し上げて分割される。")}
        </p>
      </div>
    </VizFrame>
  );
}
