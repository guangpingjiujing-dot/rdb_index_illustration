"use client";
import { useState } from "react";
import Link from "next/link";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";

export type Anomaly = {
  n: number;
  title: string;
  hint: string;
  answer: string;
  concept: string;
  href: string;
};

export const ANOMALIES: Anomaly[] = [
  {
    n: 1,
    title: "「発注」の線、両端の最大基数が 1 に固定されている",
    hint: "EC サイトなのに、その多重度は業務として成立する？",
    answer:
      "「顧客 —発注— 注文」の顧客側は | (最大 1、必須参加)、注文側は | ○ (最大 1、任意参加)。両端とも最大基数が 1 に固定されているので、1 人の顧客は 最大 1 注文しか持てず、1 つの注文にも 最大 1 顧客しか紐づけられない、という実質 1:0..1 (ほぼ 1:1 固定) の関係になる。EC サイトなら 1 顧客が複数回注文するはずで、最大基数を 1 に固定した瞬間サイトが成立しない。",
    concept: "カーディナリティ (多重度) の誤用",
    href: "/data-modeling/er-diagram/cardinality",
  },
  {
    n: 2,
    title: "「顧客 ⟷ 商品」に中間実体がない",
    hint: "「田中さんがいつ、この商品を、いくつ買ったか」を記録する場所はどこ？",
    answer:
      "多対多 (N:M) の関連は必ず連関実体 (中間テーブル) に分解する。この図では 顧客⟷商品 が直接鳥足×鳥足で結ばれているため、「田中さんが 8/1 にこの商品を 2 個買った」という購入履歴を格納する場所が存在しない。別の場所に「注文明細」が描かれているのに、この線はなぜかそれを経由していない。",
    concept: "多対多に連関実体なし",
    href: "/data-modeling/er-diagram/many-to-many",
  },
  {
    n: 3,
    title: "「配送先」が独立主キーを持ち、親エンティティと繋がっていない",
    hint: "「田中さんの自宅」という文脈なしで、この配送先は誰の住所？",
    answer:
      "「配送先」は意味的には 顧客 に従属する弱エンティティ (「田中さんの自宅」「田中さんの会社宛」という文脈なしには成立しない)。IE 記法の適切な設計なら、顧客との関連を明示し、主キーを (顧客ID, 配送先連番) 等の複合キーにする。この図では顧客と一切の関連が引かれず、独立の配送先ID だけで単独存在する形になっており、実世界の意味と噛み合っていない。",
    concept: "弱エンティティが親を持たない",
    href: "/data-modeling/er-diagram/weak-entity",
  },
  {
    n: 4,
    title: "「注文明細」の主キーが独立で、親エンティティに従属していない",
    hint: "注文明細だけを見て「これはどの注文の何番目の商品？」と答えられる？",
    answer:
      "注文明細は本来「注文の中の 1 行」なので、注文 なしには意味を持たない弱エンティティ。IE 記法では、弱エンティティは主キー欄に親の主キーを含めた複合キー ((注文ID, 明細番号)) で表現するべき。この図では 明細ID 単独の主キーになっていて、明細だけを見てもどの注文の何番目か分からず、識別関係の設計として破綻している。",
    concept: "弱エンティティの PK 設計不備",
    href: "/data-modeling/er-diagram/identifying",
  },
  {
    n: 5,
    title: "「顧客」の属性欄が破綻している",
    hint: "「注文履歴JSON」を 1 属性に持たせて、注文が増えるたびに何が起きる？",
    answer:
      "顧客に「注文履歴JSON」「カート内商品ID配列」「レビュー全て」「血液型」など、粒度もライフサイクルも違う値がフラットに並んでいる。特に JSON や複数値属性は 1NF 違反で、更新時異常の温床。属性として持つべきものと別エンティティに切り出すべきものを分離する必要がある。",
    concept: "属性の粒度破綻 (1NF 違反)",
    href: "/data-modeling/er-diagram/entity",
  },
  {
    n: 6,
    title: "「顧客 ⇔ 注文」の間に「発注」と「確定」が同時に引かれている",
    hint: "この 2 本の線、どっちがどんな意味？「発注」と「確定」は別の関連？",
    answer:
      "同じエンティティ間に複数の関連を描く場合、必ず役割名で意味を区別し、それぞれ独立した意味を持たせる必要がある。「発注」と「確定」は日本語として似すぎていて、意味の差が図から読み取れず、読者は 2 本の線の違いを推測するしかない。",
    concept: "関連の役割名なし・重複",
    href: "/data-modeling/er-diagram/relationship",
  },
  {
    n: 7,
    title: "「カテゴリ ⇔ サブカテゴリ」の関係が循環参照になっている",
    hint: "サブカテゴリも実はカテゴリ？だとしたらこの構造で親子関係をどう辿る？",
    answer:
      "「サブカテゴリ」は本質的にカテゴリと同じ存在なのに、しかも カテゴリが サブカテゴリID を持ち、サブカテゴリが 親カテゴリID を持ち…と相互に参照している。カテゴリの階層は自己参照 (再帰関連) にすべきところを別エンティティに分解した挙げ句、方向と参加制約が定義されていないため無限に辿れてしまう。",
    concept: "自己参照 (再帰関連) の設計不備",
    href: "/data-modeling/er-diagram/relationship",
  },
  {
    n: 8,
    title: "「明細」線の参加制約が両側で食い違っている",
    hint: "注文側に ○ (最小 0)、注文明細側に | (最小 1) が並んでいるが、この 2 つは同時に成立する？",
    answer:
      "「注文 —明細— 注文明細」の線は、注文側が |○ (最大 1、最小 0 = 明細は親の注文なしでも存在できる)、注文明細側が 1..N (最大 N、最小 1 = 注文には明細が 1 件以上必ずある)。この 2 つは論理的に両立しない: 「注文に明細が 1 件以上ある」なら、その明細を逆から見れば必ず親を持つはず (min=1) で、親側 min=0 と食い違う。さらにこの線は識別関係 (弱エンティティ) なので、定義上「親なしでは存在できない」に対して親側 min=0 を許すのはそもそも意味を成さない。",
    concept: "参加制約の矛盾",
    href: "/data-modeling/er-diagram/optionality",
  },
  {
    n: 9,
    title: "「レビュー —対象— 商品」の線だけ記法が違う",
    hint: "この線の記号、他とテイストが違わない？",
    answer:
      "他の関連は IE 記法 (crow's foot: 鳥足と縦棒) で描かれているが、レビューと商品の間だけ IDEF1X 記法 (● / ○ / P / M) で描かれている。図全体で記法を統一しないと、読者は同じ記号を違う意味で誤読する。",
    concept: "記法混在",
    href: "/data-modeling/er-diagram/notation",
  },
];

type Mode = "closed" | "hint" | "reveal";

export function AnomalyList() {
  const [mode, setMode] = useState<Mode>("closed");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const revealAll = mode === "reveal";
  const showHint = mode === "hint" || mode === "reveal";
  const highlight = revealAll
    ? new Set(ANOMALIES.map((a) => a.n))
    : new Set<number>();

  const toggle = (target: Exclude<Mode, "closed">) => {
    setMode((m) => (m === target ? "closed" : target));
  };

  return (
    <section>
      <div className="not-prose">
        <WeirdERDiagram highlightAnomalies={highlight} />
      </div>

      <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          9 つの違和感
        </h2>
        <div className="flex flex-wrap gap-2">
          <ToggleButton
            active={mode === "hint"}
            onClick={() => toggle("hint")}
          >
            ヒント表示
          </ToggleButton>
          <ToggleButton
            active={mode === "reveal"}
            onClick={() => toggle("reveal")}
          >
            全て答え合わせ
          </ToggleButton>
        </div>
      </div>

      <p className="mb-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        各項目のタイトルをクリックすると、ヒントと答えが個別に展開されます。
        「ヒント表示」で全項目のヒントを一斉表示、「全て答え合わせ」で答え+バッジも表示します。
      </p>

      <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {ANOMALIES.map((a) => {
          const isOpen = revealAll || openIds.has(a.n);
          return (
            <li key={a.n} className="py-4">
              <button
                type="button"
                onClick={() =>
                  setOpenIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(a.n)) next.delete(a.n);
                    else next.add(a.n);
                    return next;
                  })
                }
                aria-expanded={isOpen}
                className="group flex w-full items-start gap-4 text-left"
              >
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[var(--foreground)] text-xs font-bold">
                  {a.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold group-hover:underline underline-offset-4">
                    {a.title}
                  </span>
                  {showHint && !isOpen && (
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                      ヒント: {a.hint}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="mt-1 text-[var(--muted-foreground)] transition-transform"
                  style={{ transform: isOpen ? "rotate(90deg)" : undefined }}
                >
                  ▶
                </span>
              </button>
              {isOpen && (
                <div className="mt-3 pl-11">
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    ヒント: {a.hint}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{a.answer}</p>
                  <p className="mt-3 text-xs">
                    <span className="mr-2 inline-block rounded-sm bg-[var(--foreground)] px-2 py-0.5 font-bold uppercase tracking-wider text-[var(--background)]">
                      {a.concept}
                    </span>
                    <Link
                      href={a.href}
                      className="text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
                    >
                      この違和感を言語化するページへ →
                    </Link>
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "border px-3 py-1.5 text-xs font-bold transition-colors " +
        (active
          ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
          : "border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--muted)]/60")
      }
    >
      {children}
    </button>
  );
}
