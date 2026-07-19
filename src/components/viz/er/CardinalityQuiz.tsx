"use client";
import { useState } from "react";
import {
  ERDiagram,
  type CardinalityMark,
} from "@/components/viz/er/ERDiagram";

type Rule = {
  text: string;
  isTrue: (from: CardinalityMark, to: CardinalityMark) => boolean;
  explanation: string;
};

type Problem = {
  id: string;
  title: string;
  description: string;
  from: {
    id: string;
    label: string;
    attributes: string[];
    primaryKey: string[];
  };
  to: {
    id: string;
    label: string;
    attributes: string[];
    primaryKey: string[];
  };
  relLabel: string;
  initial: { from: CardinalityMark; to: CardinalityMark };
  /** 各側でトグル可能な記号 (2 択に絞ることで、テーマの軸だけを試させる) */
  optionsFrom: CardinalityMark[];
  optionsTo: CardinalityMark[];
  rules: Rule[];
};

export type QuizMode = "max" | "min";

const CARD_OPTIONS: Array<{
  value: CardinalityMark;
  symbol: string;
  reading: string;
}> = [
  { value: "one", symbol: "|", reading: "必ず 1" },
  { value: "zero-one", symbol: "|○", reading: "0 か 1" },
  { value: "one-many", symbol: "|＜", reading: "1 以上" },
  { value: "zero-many", symbol: "○＜", reading: "0 以上" },
];

function maxOf(c: CardinalityMark): 1 | "N" {
  return c === "one" || c === "zero-one" ? 1 : "N";
}

function minOf(c: CardinalityMark): 0 | 1 {
  return c === "zero-one" || c === "zero-many" ? 0 : 1;
}

// max-only モード用: 選択肢を「必ず 1 (|)」と「1 以上 (|＜)」の 2 択に絞る (min はどちらも 1 で固定)。
// これで参加制約 (最小基数) の概念を混ぜず、最大基数 = カーディナリティの本質だけを試させる。
const MAX_OPTIONS: CardinalityMark[] = ["one", "one-many"];

const PROBLEMS_MAX: Problem[] = [
  {
    id: "customer-order",
    title: "問 1: 顧客 と 注文",
    description:
      "EC サイトの顧客と注文の関連。初期状態は「1 人の顧客は 1 個以上の注文を持ち、1 つの注文は必ず 1 人の顧客に紐付く」設計。各エンティティの内側のボタンで「上限」を切り替えると、成立する業務ルールがどう変わるかを試せる。",
    from: {
      id: "cust",
      label: "顧客",
      attributes: ["顧客ID", "氏名"],
      primaryKey: ["顧客ID"],
    },
    to: {
      id: "ord",
      label: "注文",
      attributes: ["注文ID", "注文日", "顧客ID"],
      primaryKey: ["注文ID"],
    },
    relLabel: "発注",
    initial: { from: "one", to: "one-many" },
    optionsFrom: MAX_OPTIONS,
    optionsTo: MAX_OPTIONS,
    rules: [
      {
        text: "1 人の顧客は複数の注文 (2 個以上) を持てる",
        isTrue: (_f, t) => maxOf(t) === "N",
        explanation:
          "「1 顧客から複数注文にたどれる」= 注文側の上限 N。注文側が |＜ なら O。",
      },
      {
        text: "1 つの注文は必ずちょうど 1 人の顧客に紐付く",
        isTrue: (f) => maxOf(f) === 1,
        explanation:
          "「注文には 1 顧客まで」= 顧客側の上限 1。顧客側が | なら O。",
      },
      {
        text: "1 つの注文が複数の顧客に共同で紐付く (共同購入) ことがあってよい",
        isTrue: (f) => maxOf(f) === "N",
        explanation:
          "「1 注文に複数顧客」= 顧客側の上限 N。顧客側が |＜ なら O。",
      },
    ],
  },
  {
    id: "student-course",
    title: "問 2: 学生 と 履修科目",
    description:
      "大学の履修モデル。初期状態は両側「1 以上」= 学生は 1 科目以上履修し、科目にも 1 人以上の履修者がいる設計 (下限は「必ず 1 以上」で固定)。両端の上限を変えて履修ルールがどう変わるかを試そう。",
    from: {
      id: "stu",
      label: "学生",
      attributes: ["学籍番号", "氏名"],
      primaryKey: ["学籍番号"],
    },
    to: {
      id: "crs",
      label: "科目",
      attributes: ["科目ID", "科目名"],
      primaryKey: ["科目ID"],
    },
    relLabel: "履修",
    initial: { from: "one-many", to: "one-many" },
    optionsFrom: MAX_OPTIONS,
    optionsTo: MAX_OPTIONS,
    rules: [
      {
        text: "1 人の学生は同時に複数の科目を履修できる",
        isTrue: (_f, t) => maxOf(t) === "N",
        explanation:
          "「1 学生が複数科目」= 科目側の上限 N。科目側が |＜ なら O。",
      },
      {
        text: "1 つの科目を同時に複数の学生が履修できる",
        isTrue: (f) => maxOf(f) === "N",
        explanation:
          "「1 科目に複数学生」= 学生側の上限 N。学生側が |＜ なら O。",
      },
      {
        text: "1 人の学生が履修できる科目は最大 1 つまで",
        isTrue: (_f, t) => maxOf(t) === 1,
        explanation:
          "「学生あたり最大 1 科目」= 科目側の上限 1。科目側が | なら O。",
      },
    ],
  },
  {
    id: "employee-dept",
    title: "問 3: 社員 と 部署",
    description:
      "会社の所属モデル。初期状態は「社員は必ず 1 つの部署に所属」「部署には必ず 1 人以上の社員がいる」設計。兼務を許すか、1 部署のみに絞るか、上限側の記号 1 つで揺れる。",
    from: {
      id: "emp",
      label: "社員",
      attributes: ["社員ID", "氏名", "部署ID"],
      primaryKey: ["社員ID"],
    },
    to: {
      id: "dep",
      label: "部署",
      attributes: ["部署ID", "部署名"],
      primaryKey: ["部署ID"],
    },
    relLabel: "所属",
    initial: { from: "one-many", to: "one" },
    optionsFrom: MAX_OPTIONS,
    optionsTo: MAX_OPTIONS,
    rules: [
      {
        text: "1 人の社員は 1 つの部署にしか所属できない (兼務なし)",
        isTrue: (_f, t) => maxOf(t) === 1,
        explanation:
          "「社員あたり最大 1 部署」= 部署側の上限 1。部署側が | なら O。",
      },
      {
        text: "1 つの部署に複数の社員が所属できる",
        isTrue: (f) => maxOf(f) === "N",
        explanation:
          "「1 部署に複数社員」= 社員側の上限 N。社員側が |＜ なら O。",
      },
      {
        text: "1 人の社員が複数部署を兼務できる",
        isTrue: (_f, t) => maxOf(t) === "N",
        explanation:
          "「社員が複数部署に所属」= 部署側の上限 N。部署側が |＜ なら O。",
      },
    ],
  },
];

// min-only モード用: 各問題は最大基数 (max) を業務ルールに沿って固定し、
// 選択肢は各側で「min=1 (|)」か「min=0 (○)」の 2 択に絞る。参加制約 (最小基数) の概念だけを試させる。
const PROBLEMS_MIN: Problem[] = [
  {
    id: "customer-order",
    title: "問 1: 顧客 と 注文",
    description:
      "EC サイトの顧客と注文。上限は「1 顧客に複数注文 / 1 注文に 1 顧客」で固定してある (前ページで扱った軸)。ここで動かせるのは各側の「下限 = 0 個も許すか、必ず 1 個以上か」だけ。参加制約 (円 vs 縦棒) を切り替えて業務ルールがどう変わるかを試せる。",
    from: {
      id: "cust",
      label: "顧客",
      attributes: ["顧客ID", "氏名"],
      primaryKey: ["顧客ID"],
    },
    to: {
      id: "ord",
      label: "注文",
      attributes: ["注文ID", "注文日", "顧客ID"],
      primaryKey: ["注文ID"],
    },
    relLabel: "発注",
    // fromMax=1 (顧客側)、toMax=N (注文側) 固定。両側で min のみ切替。
    initial: { from: "one", to: "one-many" },
    optionsFrom: ["one", "zero-one"], // 顧客側: |=min1 / |○=min0
    optionsTo: ["one-many", "zero-many"], // 注文側: |＜=min1 / ○＜=min0
    rules: [
      {
        text: "注文したことがない顧客も登録してよい",
        isTrue: (_f, t) => minOf(t) === 0,
        explanation:
          "「注文 0 個の顧客がいてよい」= 注文側の下限 0。注文側が ○＜ なら O。",
      },
      {
        text: "どの顧客にも紐付かない注文が登録できる",
        isTrue: (f) => minOf(f) === 0,
        explanation:
          "「発注顧客なしの注文がいてよい」= 顧客側の下限 0。顧客側が |○ なら O。",
      },
    ],
  },
  {
    id: "student-course",
    title: "問 2: 学生 と 履修科目",
    description:
      "大学の履修モデル。上限は両側 N (多対多) で固定。動かせるのは「0 科目でも学生 OK か」「履修者 0 の科目を許すか」の下限だけ。",
    from: {
      id: "stu",
      label: "学生",
      attributes: ["学籍番号", "氏名"],
      primaryKey: ["学籍番号"],
    },
    to: {
      id: "crs",
      label: "科目",
      attributes: ["科目ID", "科目名"],
      primaryKey: ["科目ID"],
    },
    relLabel: "履修",
    // 両側 max=N 固定
    initial: { from: "zero-many", to: "zero-many" },
    optionsFrom: ["one-many", "zero-many"],
    optionsTo: ["one-many", "zero-many"],
    rules: [
      {
        text: "1 科目も履修していない学生が存在してよい",
        isTrue: (_f, t) => minOf(t) === 0,
        explanation:
          "「履修 0 の学生がいてよい」= 科目側の下限 0。科目側が ○＜ なら O。",
      },
      {
        text: "履修者が 0 人の科目が存在してよい",
        isTrue: (f) => minOf(f) === 0,
        explanation:
          "「履修者 0 の科目がいてよい」= 学生側の下限 0。学生側が ○＜ なら O。",
      },
    ],
  },
  {
    id: "employee-dept",
    title: "問 3: 社員 と 部署",
    description:
      "会社の所属モデル。上限は「社員は 1 部署に所属」「部署に複数社員」で固定 (前ページで扱った軸)。動かせるのは「配属前の社員 OK か」「無人部署 OK か」の下限だけ。",
    from: {
      id: "emp",
      label: "社員",
      attributes: ["社員ID", "氏名", "部署ID"],
      primaryKey: ["社員ID"],
    },
    to: {
      id: "dep",
      label: "部署",
      attributes: ["部署ID", "部署名"],
      primaryKey: ["部署ID"],
    },
    relLabel: "所属",
    // fromMax=N (社員側)、toMax=1 (部署側) 固定
    initial: { from: "one-many", to: "one" },
    optionsFrom: ["one-many", "zero-many"], // 社員側: |＜=min1 / ○＜=min0
    optionsTo: ["one", "zero-one"], // 部署側: |=min1 / |○=min0
    rules: [
      {
        text: "どこの部署にも所属していない社員 (配属前の内定者) を登録してよい",
        isTrue: (_f, t) => minOf(t) === 0,
        explanation:
          "「所属部署 0 の社員がいてよい」= 部署側の下限 0。部署側が |○ なら O。",
      },
      {
        text: "所属社員が 0 人の部署 (新設直後) が存在してよい",
        isTrue: (f) => minOf(f) === 0,
        explanation:
          "「所属社員 0 の部署がいてよい」= 社員側の下限 0。社員側が ○＜ なら O。",
      },
    ],
  },
];

export function CardinalityQuiz({ mode = "max" }: { mode?: QuizMode }) {
  const problems = mode === "max" ? PROBLEMS_MAX : PROBLEMS_MIN;
  return (
    <div className="not-prose space-y-10">
      {problems.map((p) => (
        <ProblemCard key={p.id} problem={p} />
      ))}
    </div>
  );
}

type Guess = "O" | "X";

function ProblemCard({ problem }: { problem: Problem }) {
  const [fromCard, setFromCard] = useState<CardinalityMark>(
    problem.initial.from,
  );
  const [toCard, setToCard] = useState<CardinalityMark>(problem.initial.to);
  const [guesses, setGuesses] = useState<Record<number, Guess>>({});
  const [revealAll, setRevealAll] = useState(false);

  const changeFrom = (v: CardinalityMark) => {
    setFromCard(v);
    setGuesses({});
    setRevealAll(false);
  };
  const changeTo = (v: CardinalityMark) => {
    setToCard(v);
    setGuesses({});
    setRevealAll(false);
  };

  const reset = () => {
    setFromCard(problem.initial.from);
    setToCard(problem.initial.to);
    setGuesses({});
    setRevealAll(false);
  };

  const guess = (i: number, choice: Guess) => {
    setGuesses((prev) => ({ ...prev, [i]: choice }));
  };

  return (
    <div className="border border-[var(--border)] p-5 md:p-6">
      <div className="mb-3">
        <h3 className="text-lg font-bold">{problem.title}</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
          {problem.description}
        </p>
      </div>

      <div className="relative my-4">
        <ERDiagram
          title={`${problem.from.label} — ${problem.relLabel} — ${problem.to.label}`}
          width={1000}
          height={260}
          entities={[
            {
              id: problem.from.id,
              label: problem.from.label,
              x: 60,
              y: 70,
              width: 220,
              attributes: problem.from.attributes,
              primaryKey: problem.from.primaryKey,
            },
            {
              id: problem.to.id,
              label: problem.to.label,
              x: 720,
              y: 70,
              width: 220,
              attributes: problem.to.attributes,
              primaryKey: problem.to.primaryKey,
            },
          ]}
          relationships={[
            {
              from: problem.from.id,
              to: problem.to.id,
              fromCardinality: fromCard,
              toCardinality: toCard,
              label: problem.relLabel,
            },
          ]}
          notation="ie"
        />
        {/* md+ のみ: エンティティ辺の外側 + 線より上にフローティング。
            viewBox 座標 (1000x260, entity 右辺 x=280 / 左辺 x=720、線 y≈120) を
            親コンテナの % に換算して配置。VizFrame の header+padding + SVG 上マージンを
            合算して top: 35% にすると、線 (~viewBox y=120) より十分上でマーカーを潰さない。 */}
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          <div
            className="pointer-events-auto absolute"
            style={{ left: "30%", top: "35%", transform: "translateY(-50%)" }}
          >
            <FloatingToggle
              entityLabel={problem.from.label}
              value={fromCard}
              options={problem.optionsFrom}
              onChange={changeFrom}
            />
          </div>
          <div
            className="pointer-events-auto absolute"
            style={{ right: "30%", top: "35%", transform: "translateY(-50%)" }}
          >
            <FloatingToggle
              entityLabel={problem.to.label}
              value={toCard}
              options={problem.optionsTo}
              onChange={changeTo}
            />
          </div>
        </div>
      </div>

      {/* mobile フォールバック: フローティングは狭幅では収まらないので、下に並べる */}
      <div className="grid gap-4 grid-cols-2 md:hidden">
        <FloatingToggle
          entityLabel={problem.from.label}
          value={fromCard}
          options={problem.optionsFrom}
          onChange={changeFrom}
        />
        <FloatingToggle
          entityLabel={problem.to.label}
          value={toCard}
          options={problem.optionsTo}
          onChange={changeTo}
        />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold">
            この図が現実世界で語っているルール — 各行、成立する (O) か成立しない (X) か答えよう
          </h4>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              onClick={() => setRevealAll((v) => !v)}
              className="text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
            >
              {revealAll ? "答え合わせを閉じる" : "全て答え合わせ"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
            >
              初期状態に戻す
            </button>
          </div>
        </div>
        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {problem.rules.map((rule, i) => {
            const truth: Guess = rule.isTrue(fromCard, toCard) ? "O" : "X";
            const g = guesses[i];
            const showResult = revealAll || g !== undefined;
            const correct = g !== undefined && g === truth;
            const buttonFill = (label: Guess): "none" | "correct" | "wrong" => {
              if (revealAll) return label === truth ? "correct" : "none";
              if (g === label) return label === truth ? "correct" : "wrong";
              return "none";
            };
            let resultText = "未回答";
            let resultColor = "text-transparent";
            if (revealAll) {
              resultText = `正解: ${truth}`;
              resultColor = "text-[var(--correct)]";
            } else if (g !== undefined) {
              if (correct) {
                resultText = "正解";
                resultColor = "text-[var(--correct)]";
              } else {
                resultText = "不正解";
                resultColor = "text-[var(--wrong)]";
              }
            }
            return (
              <li key={i} className="py-3 text-sm leading-relaxed">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">{rule.text}</span>
                  <span className="flex flex-shrink-0 items-center gap-2">
                    <GuessButton
                      active={g === "O"}
                      fill={buttonFill("O")}
                      onClick={() => guess(i, "O")}
                      label="O"
                    />
                    <GuessButton
                      active={g === "X"}
                      fill={buttonFill("X")}
                      onClick={() => guess(i, "X")}
                      label="X"
                    />
                    <span
                      className={
                        "block w-[5em] text-right text-xs font-bold " +
                        resultColor
                      }
                    >
                      {resultText}
                    </span>
                  </span>
                </div>
                {showResult && (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {rule.explanation}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function GuessButton({
  active,
  fill,
  onClick,
  label,
}: {
  active: boolean;
  fill: "none" | "correct" | "wrong";
  onClick: () => void;
  label: "O" | "X";
}) {
  const style =
    fill === "correct"
      ? "border-[var(--correct)] bg-[var(--correct-soft)] text-[var(--correct)]"
      : fill === "wrong"
        ? "border-[var(--wrong)] bg-[var(--wrong-soft)] text-[var(--wrong)]"
        : "border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--muted)]/60";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-colors " +
        style
      }
    >
      {label}
    </button>
  );
}

function FloatingToggle({
  entityLabel,
  value,
  options,
  onChange,
}: {
  entityLabel: string;
  value: CardinalityMark;
  options: CardinalityMark[];
  onChange: (v: CardinalityMark) => void;
}) {
  const visible = CARD_OPTIONS.filter((o) => options.includes(o.value));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="whitespace-nowrap rounded-sm bg-[var(--background)] px-1 text-[10px] font-bold text-[var(--muted-foreground)]">
        {entityLabel} 側
      </div>
      <div className="flex gap-1 rounded-sm bg-[var(--background)] p-1 shadow-sm ring-1 ring-[var(--border)]">
        {visible.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              title={opt.reading}
              className={
                "flex h-8 w-8 items-center justify-center border font-mono text-sm font-bold leading-none transition-colors " +
                (active
                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]")
              }
            >
              {opt.symbol}
            </button>
          );
        })}
      </div>
    </div>
  );
}
