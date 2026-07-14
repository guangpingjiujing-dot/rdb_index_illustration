"use client";

import { useState } from "react";
import { VizFrame } from "@/components/viz/VizFrame";
import { Button } from "@/components/ui/Button";

// ------------------------------------------------------------
// 共通型 / 定数
// ------------------------------------------------------------

const HEADERS = ["社員ID", "氏名", "部署ID", "部署名", "部署所在地"] as const;

type SqlLineState = "hidden" | "muted" | "active" | "danger";

type Row = {
  key: string;
  cells: (string | number)[];
};

const BASE_ROWS: Row[] = [
  { key: "E001", cells: ["E001", "山田", "D01", "営業部", "東京"] },
  { key: "E002", cells: ["E002", "田中", "D01", "営業部", "東京"] },
  { key: "E003", cells: ["E003", "佐藤", "D02", "開発部", "大阪"] },
  { key: "E004", cells: ["E004", "鈴木", "D02", "開発部", "大阪"] },
];

// ------------------------------------------------------------
// 共通 UI: コントロールバー / ステップラベル / テーブル枠 / SQL枠 / バナー
// ------------------------------------------------------------

function ControlBar({
  onReset,
  onPrev,
  onNext,
  step,
  stepCount,
  onStepSelect,
}: {
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  step: number;
  stepCount: number;
  onStepSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onPrev}
        disabled={step === 0}
        aria-label="前のステップ"
      >
        ◀ 前へ
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={onNext}
        disabled={step === stepCount - 1}
        aria-label="次のステップ"
      >
        次へ ▶
      </Button>
      <Button variant="ghost" size="sm" onClick={onReset}>
        リセット
      </Button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: stepCount }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onStepSelect(i)}
            aria-label={`ステップ ${i + 1}`}
            className={
              "h-2 w-6 transition-colors " +
              (i === step
                ? "bg-[var(--foreground)]"
                : "bg-[var(--border)] hover:bg-[var(--border-strong)]")
            }
          />
        ))}
      </div>
      <span className="ml-auto text-xs text-[var(--muted-foreground)]">
        STEP {step + 1} / {stepCount}
      </span>
    </div>
  );
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-[var(--border-strong)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 font-mono text-xs font-bold text-[var(--foreground)]">
        従業員_部署
      </div>
      <table className="min-w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]/60">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-3 py-1.5 text-left font-bold text-[var(--foreground)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/**
 * SQL 表示枠。全ラインを常に描画してレイアウトを固定する。
 * 各ラインの visible/muted を step に応じて切り替える。
 */
function SqlBlock({
  lines,
}: {
  lines: { text: string; state: SqlLineState }[];
}) {
  return (
    <div
      className="border border-[var(--border-strong)] bg-[var(--muted)] font-mono text-xs whitespace-pre px-4 py-3 leading-relaxed overflow-x-auto"
      aria-live="polite"
    >
      {lines.map((l, i) => {
        const cls =
          l.state === "hidden"
            ? "text-transparent select-none"
            : l.state === "muted"
              ? "text-[var(--muted-foreground)]"
              : l.state === "danger"
                ? "text-[var(--foreground)] font-bold"
                : "text-[var(--foreground)]";
        return (
          <div
            key={i}
            className={cls}
            aria-hidden={l.state === "hidden"}
          >
            {l.text || " "}
          </div>
        );
      })}
    </div>
  );
}

/**
 * 現在の STEP の要点を大きく表示する。
 * 各 step のテキストが「今 何が起きているか」を 1 文で言い切る主役ラベル。
 * min-h 指定で 2 行までの変動を吸収してレイアウトが動かないようにする。
 */
function PromoStepLabel({
  steps,
  current,
  count,
}: {
  steps: readonly string[];
  current: number;
  count: number;
}) {
  return (
    <div className="border-l-4 border-[var(--foreground)] bg-[var(--muted)]/60 px-4 py-3 min-h-[4rem]">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
        STEP {current + 1} / {count}
      </div>
      <p className="mt-1 text-sm md:text-base font-bold text-[var(--foreground)] leading-relaxed">
        {steps[current]}
      </p>
    </div>
  );
}

/**
 * この Viz 全体で「なぜこの異常が起きるのか」を伝える説明。
 * 凡例より格上げして、事実 (table/SQL/STEP) の下に太字の見出し付きカードで置く。
 */
function WhyCallout({
  title = "なぜこの異常が起きるか",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--foreground)] bg-[var(--card)] p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
        {title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
        {children}
      </p>
    </div>
  );
}

/**
 * セル。step に応じて意味的な色分けで異常箇所を強調する。
 */
function Cell({
  children,
  danger = false,
  strong = false,
  highlightGroup,
}: {
  children: React.ReactNode;
  /** 「間違っている / 更新漏れ」のセル — アンバー背景 */
  danger?: boolean;
  /** 「更新後の新しい値」のセル — ブルー背景 */
  strong?: boolean;
  /** 「同じグループに属する」ことを示す共通ハイライト (D01 が共通なことを示すなど) */
  highlightGroup?: boolean;
}) {
  let cellBg = "";
  if (danger) cellBg = "bg-[#fef1c7] outline outline-1 outline-[var(--foreground)] -outline-offset-1";
  else if (strong) cellBg = "bg-[#dbeafe] outline outline-1 outline-[var(--foreground)] -outline-offset-1";
  else if (highlightGroup) cellBg = "bg-[var(--muted)]/60";
  const weight = danger || strong ? "font-bold" : "";
  return (
    <td
      className={
        "px-3 py-1.5 whitespace-nowrap align-middle " + cellBg
      }
    >
      <span className={weight}>{children}</span>
    </td>
  );
}

// ------------------------------------------------------------
// Viz 共通のコントロール制御 hook
// ------------------------------------------------------------

function useVizControls(stepCount: number) {
  const [step, setStep] = useState(0);
  const goTo = (i: number) =>
    setStep(Math.max(0, Math.min(stepCount - 1, i)));
  return {
    step,
    controls: (
      <ControlBar
        onReset={() => setStep(0)}
        onPrev={() => goTo(step - 1)}
        onNext={() => goTo(step + 1)}
        step={step}
        stepCount={stepCount}
        onStepSelect={goTo}
      />
    ),
  };
}

// ------------------------------------------------------------
// 挿入異常
// ------------------------------------------------------------

const INSERT_STEPS = [
  "初期状態: D03 (人事部) はまだ存在しない",
  "INSERT 試行: 社員がまだ 1 人も居ないので、社員ID を NULL にせざるを得ない",
  "主キー違反: 社員ID を NULL にできず登録失敗 → D03 の情報はテーブルに載せられない",
] as const;

export function InsertAnomalyViz() {
  const { step, controls } = useVizControls(INSERT_STEPS.length);
  // 追加試行行: step0 では "?" プレースホルダ / step1〜 で実値
  const attemptCells =
    step === 0
      ? ["?", "?", "?", "?", "?"]
      : ["NULL", "—", "D03", "人事部", "東京"];
  const isFail = step >= 2;

  const sqlLines = [
    {
      text: "INSERT INTO 従業員_部署",
      state: (step >= 1 ? "active" : "muted") as SqlLineState,
    },
    {
      text: "  (社員ID, 氏名, 部署ID, 部署名, 部署所在地)",
      state: (step >= 1 ? "active" : "muted") as SqlLineState,
    },
    {
      text: "VALUES (NULL, NULL, 'D03', '人事部', '東京');",
      state: (step >= 2 ? "danger" : step >= 1 ? "active" : "muted") as SqlLineState,
    },
  ];

  return (
    <VizFrame
      title="挿入異常 — 所属者のいない新部署を登録できない"
      controls={controls}
    >
      <div className="flex flex-col gap-4">
        <TableCard>
          {BASE_ROWS.map((r) => (
            <tr
              key={r.key}
              className="border-b border-[var(--border)] last:border-b-0"
            >
              {r.cells.map((c, j) => (
                <Cell key={j}>{String(c)}</Cell>
              ))}
            </tr>
          ))}
          <tr
            className="border-b border-[var(--border)] last:border-b-0 bg-[var(--muted)]/40"
            aria-label="挿入試行行"
          >
            {attemptCells.map((c, j) => {
              const dangerCell = isFail && j === 0;
              const mutedText = step === 0;
              return (
                <Cell key={j} danger={dangerCell}>
                  <span
                    className={
                      mutedText && !dangerCell
                        ? "text-[var(--muted-foreground)]"
                        : ""
                    }
                  >
                    {c}
                  </span>
                </Cell>
              );
            })}
          </tr>
        </TableCard>

        <SqlBlock lines={sqlLines} />

        <PromoStepLabel
          steps={INSERT_STEPS}
          current={step}
          count={INSERT_STEPS.length}
        />

        <WhyCallout>
          「D03 = 人事部 (東京)」を登録したくても、
          このテーブルでは <strong>社員行としてしか事実を書けない</strong>。
          社員が居ないと社員ID を NULL にせざるを得ず、主キー制約に引っかかって登録できない。
          「部署」という事実の格納先がそもそも独立して存在していないことが根本原因。
        </WhyCallout>
      </div>
    </VizFrame>
  );
}

// ------------------------------------------------------------
// 更新異常
// ------------------------------------------------------------

const UPDATE_STEPS = [
  "初期状態: D01 の 2 行はどちらも「営業部」",
  "E001 の部署名だけを「セールス部」に更新",
  "更新漏れ: E002 は「営業部」のまま — 同じ D01 が「営業部」と「セールス部」の 2 つの部署名を持つ矛盾状態",
] as const;

export function UpdateAnomalyViz() {
  const { step, controls } = useVizControls(UPDATE_STEPS.length);

  const rowValueFor = (rowKey: string, colIdx: number): string => {
    const base = BASE_ROWS.find((r) => r.key === rowKey)!;
    if (colIdx === 3 && rowKey === "E001" && step >= 1) return "セールス部";
    return String(base.cells[colIdx]);
  };

  const sqlLines = [
    {
      text: "UPDATE 従業員_部署",
      state: (step >= 1 ? "active" : "muted") as SqlLineState,
    },
    {
      text: "SET 部署名 = 'セールス部'",
      state: (step >= 1 ? "active" : "muted") as SqlLineState,
    },
    {
      text: "WHERE 社員ID = 'E001';",
      state: (step >= 2 ? "danger" : step >= 1 ? "active" : "muted") as SqlLineState,
    },
  ];

  return (
    <VizFrame
      title="更新異常 — 部署名の変更が全行に伝わらない"
      controls={controls}
    >
      <div className="flex flex-col gap-4">
        <TableCard>
          {BASE_ROWS.map((r) => (
            <tr
              key={r.key}
              className="border-b border-[var(--border)] last:border-b-0"
            >
              {HEADERS.map((_, j) => {
                const value = rowValueFor(r.key, j);
                const isDeptID = j === 2;
                const isDeptName = j === 3;
                const isD01Row = r.key === "E001" || r.key === "E002";
                // D01 の 部署ID 列 (共通性を視覚化)
                const showGroupHighlight =
                  step >= 1 && isDeptID && isD01Row;
                // step 1 で E001 だけ更新された「新しい値」(セールス部)
                const isNewValueE001 =
                  step >= 1 && isDeptName && r.key === "E001";
                // step 2 で「本来は更新されるべきだったのに残っている」E002 の値 (営業部)
                const isStaleE002 =
                  step >= 2 && isDeptName && r.key === "E002";
                return (
                  <Cell
                    key={j}
                    strong={isNewValueE001}
                    danger={isStaleE002}
                    highlightGroup={showGroupHighlight}
                  >
                    {value}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </TableCard>

        <SqlBlock lines={sqlLines} />

        <PromoStepLabel
          steps={UPDATE_STEPS}
          current={step}
          count={UPDATE_STEPS.length}
        />

        <WhyCallout>
          「D01 = 営業部」という 1 つの事実が、社員の数だけ複製されている。
          改称のためには D01 を持つ <strong>全行</strong> を漏れなく更新する必要があり、
          1 行でも忘れると同じ D01 が「営業部」と「セールス部」の 2 つの部署名を持つ矛盾状態になる。
          「部署」の事実が独立していれば 1 行の UPDATE で済むはずのもの。
        </WhyCallout>
      </div>
    </VizFrame>
  );
}

// ------------------------------------------------------------
// 削除異常
// ------------------------------------------------------------

const DELETE_STEPS = [
  "初期状態: D02 (開発部/大阪) には 佐藤 (E003)・鈴木 (E004) の 2 名",
  "佐藤 (E003) が退職 → 行を削除",
  "鈴木 (E004) も退職 → D02 = 開発部 (大阪) という部署そのものの情報がテーブルから消失",
] as const;

export function DeleteAnomalyViz() {
  const { step, controls } = useVizControls(DELETE_STEPS.length);

  const isDeleted = (rowKey: string): boolean => {
    if (step >= 1 && rowKey === "E003") return true;
    if (step >= 2 && rowKey === "E004") return true;
    return false;
  };

  const sqlLines = [
    {
      text: "DELETE FROM 従業員_部署 WHERE 社員ID = 'E003';",
      state: (step >= 1 ? "active" : "muted") as SqlLineState,
    },
    {
      text: "DELETE FROM 従業員_部署 WHERE 社員ID = 'E004';",
      state: (step >= 2 ? "danger" : "muted") as SqlLineState,
    },
  ];

  return (
    <VizFrame
      title="削除異常 — 最後の所属者を消すと部署情報も消える"
      controls={controls}
    >
      <div className="flex flex-col gap-4">
        <TableCard>
          {BASE_ROWS.map((r) => {
            const deleted = isDeleted(r.key);
            return (
              <tr
                key={r.key}
                className={
                  "border-b border-[var(--border)] last:border-b-0 " +
                  (deleted
                    ? "bg-[var(--muted)]/40 text-[var(--muted-foreground)] line-through"
                    : "")
                }
                aria-label={deleted ? "削除済み" : undefined}
              >
                {r.cells.map((c, j) => (
                  <td
                    key={j}
                    className="px-3 py-1.5 whitespace-nowrap align-middle"
                  >
                    {String(c)}
                  </td>
                ))}
              </tr>
            );
          })}
        </TableCard>

        <SqlBlock lines={sqlLines} />

        <PromoStepLabel
          steps={DELETE_STEPS}
          current={step}
          count={DELETE_STEPS.length}
        />

        <WhyCallout>
          「D02 = 開発部 (大阪)」という <strong>部署そのものの事実</strong> は、
          このテーブルでは「社員行」の中にしか存在していない。
          最後の所属者を消した瞬間、部署情報も一緒に失われる。
          後で新しい社員を D02 に配属したくても、部署名や所在地はもう分からない。
        </WhyCallout>
      </div>
    </VizFrame>
  );
}
