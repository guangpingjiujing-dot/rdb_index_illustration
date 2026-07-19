"use client";
import { useState } from "react";
import {
  ERDiagram,
  type CardinalityMark,
} from "@/components/viz/er/ERDiagram";

type EntityDef = {
  id: string;
  label: string;
  attributes: string[];
  primaryKey: string[];
};

type Problem = {
  id: string;
  title: string;
  scenario: string;
  parent: EntityDef;
  child: EntityDef;
  /** 質問文中で「◯◯ は弱/強？」の◯◯部分に入る名前 */
  childName: string;
  fromCardinality: CardinalityMark;
  toCardinality: CardinalityMark;
  isIdentifying: boolean;
  correct: "weak" | "strong";
  explanation: string;
};

const PROBLEMS: Problem[] = [
  {
    id: "building-room",
    title: "問 1: 建物 と 部屋",
    scenario:
      "オフィスビルの部屋管理システム。部屋番号は各建物の中で 101, 102, 201... と付番される (別の建物にも「101 号室」が存在する)。",
    parent: {
      id: "bldg",
      label: "建物",
      attributes: ["建物ID", "名称"],
      primaryKey: ["建物ID"],
    },
    child: {
      id: "room",
      label: "部屋",
      attributes: ["建物ID", "部屋番号", "用途"],
      primaryKey: ["建物ID", "部屋番号"],
    },
    childName: "部屋",
    fromCardinality: "one",
    toCardinality: "one-many",
    isIdentifying: true,
    correct: "weak",
    explanation:
      "部屋の主キーは (建物ID, 部屋番号) の複合キー。親の 建物ID を含んでいるので弱エンティティ。「101 号室」だけではどのビルの 101 号室か特定できず、建物なしでは存在意義を持たない。建物を消したら部屋も一緒に消える (ON DELETE CASCADE) のが自然。",
  },
  {
    id: "company-employee",
    title: "問 2: 会社 と 従業員",
    scenario:
      "従業員データベース。従業員には社会保険番号ベースの独立 ID (E001, E002...) が付与されており、転職・部署移動をしても同じ ID で追跡される。",
    parent: {
      id: "co",
      label: "会社",
      attributes: ["会社ID", "会社名"],
      primaryKey: ["会社ID"],
    },
    child: {
      id: "emp",
      label: "従業員",
      attributes: ["従業員ID", "氏名", "会社ID"],
      primaryKey: ["従業員ID"],
    },
    childName: "従業員",
    fromCardinality: "one",
    toCardinality: "one-many",
    isIdentifying: false,
    correct: "strong",
    explanation:
      "従業員の主キーは 従業員ID 単独。会社ID は FK として持つが主キーには含まれていない。「E001」だけで一意に識別できる = 会社なしでも意味を持つので強エンティティ。会社を消しても従業員データは消さずに残す (親の変更を許容する) のが自然。",
  },
  {
    id: "event-registration",
    title: "問 3: イベント と 参加登録",
    scenario:
      "イベント運営システム。「誰がどのイベントに参加登録したか」を記録する。同じ顧客が同じイベントに 2 回登録することはない。",
    parent: {
      id: "evt",
      label: "イベント",
      attributes: ["イベントID", "開催日"],
      primaryKey: ["イベントID"],
    },
    child: {
      id: "reg",
      label: "参加登録",
      attributes: ["イベントID", "顧客ID", "登録日"],
      primaryKey: ["イベントID", "顧客ID"],
    },
    childName: "参加登録",
    fromCardinality: "one",
    toCardinality: "one-many",
    isIdentifying: true,
    correct: "weak",
    explanation:
      "参加登録の主キーは (イベントID, 顧客ID) の複合キー。親の イベントID (と顧客ID) を含んでいるので弱エンティティ。これはイベント⇔顧客 の多対多を分解する連関実体の典型形。イベントを消したら参加登録も消えるのが自然。",
  },
];

export function WeakEntityQuiz() {
  return (
    <div className="not-prose space-y-8">
      {PROBLEMS.map((p) => (
        <ProblemCard key={p.id} problem={p} />
      ))}
    </div>
  );
}

type Guess = "weak" | "strong";

function ProblemCard({ problem }: { problem: Problem }) {
  const [guess, setGuess] = useState<Guess | null>(null);
  const answered = guess !== null;
  const correct = answered && guess === problem.correct;

  return (
    <div className="border border-[var(--border)] p-5 md:p-6">
      <h3 className="text-lg font-bold">{problem.title}</h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
        {problem.scenario}
      </p>

      <div className="my-4">
        <ERDiagram
          title={`${problem.parent.label} — ${problem.child.label}`}
          width={800}
          height={240}
          entities={[
            {
              id: problem.parent.id,
              label: problem.parent.label,
              x: 60,
              y: 70,
              width: 220,
              attributes: problem.parent.attributes,
              primaryKey: problem.parent.primaryKey,
            },
            {
              id: problem.child.id,
              label: problem.child.label,
              x: 500,
              y: 70,
              width: 240,
              attributes: problem.child.attributes,
              primaryKey: problem.child.primaryKey,
            },
          ]}
          relationships={[
            {
              from: problem.parent.id,
              to: problem.child.id,
              fromCardinality: problem.fromCardinality,
              toCardinality: problem.toCardinality,
              isIdentifying: problem.isIdentifying,
            },
          ]}
          notation="ie"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-sm font-bold">
          「{problem.childName}」は弱エンティティ？ 強エンティティ？
        </p>
        <GuessButton
          label="弱エンティティ"
          active={guess === "weak"}
          fill={pickFill("weak", guess, problem.correct)}
          onClick={() => setGuess("weak")}
        />
        <GuessButton
          label="強エンティティ"
          active={guess === "strong"}
          fill={pickFill("strong", guess, problem.correct)}
          onClick={() => setGuess("strong")}
        />
        {answered && (
          <span
            className={
              "text-sm font-bold " +
              (correct
                ? "text-[var(--correct)]"
                : "text-[var(--wrong)]")
            }
          >
            {correct
              ? "正解"
              : `不正解 (正解: ${problem.correct === "weak" ? "弱エンティティ" : "強エンティティ"})`}
          </span>
        )}
      </div>

      {answered && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
          {problem.explanation}
        </p>
      )}
    </div>
  );
}

function pickFill(
  label: Guess,
  guess: Guess | null,
  correct: Guess,
): "none" | "correct" | "wrong" {
  if (guess === null) return "none";
  if (label !== guess) return "none";
  return label === correct ? "correct" : "wrong";
}

function GuessButton({
  label,
  active,
  fill,
  onClick,
}: {
  label: string;
  active: boolean;
  fill: "none" | "correct" | "wrong";
  onClick: () => void;
}) {
  const style =
    fill === "correct"
      ? "border-[var(--correct)] bg-[var(--correct-soft)] text-[var(--correct)]"
      : fill === "wrong"
        ? "border-[var(--wrong)] bg-[var(--wrong-soft)] text-[var(--wrong)]"
        : "border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--muted)]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "border px-4 py-1.5 text-sm font-bold transition-colors " + style
      }
    >
      {label}
    </button>
  );
}
