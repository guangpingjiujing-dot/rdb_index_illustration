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
    title: "「住む」の線、両端が「必ず 1」に固定されている",
    hint: "シェアハウスなのに、その多重度は物理的に成立する？",
    answer:
      "「入居者 —住む— 部屋」の両端に縦棒 2 本 (=必ず 1) が付いているので、1 人の入居者は 1 部屋にしか住めず、1 部屋には必ず 1 人の入居者がいる、という 1:1 固定の意味になる。シェアハウスなら 1 部屋に複数人、空き部屋も許容するはずで、実世界と矛盾している。",
    concept: "カーディナリティ (多重度) の誤用",
    href: "/data-modeling/er-diagram/cardinality",
  },
  {
    n: 2,
    title: "「入居者 ⟷ 共用設備」に中間実体がない",
    hint: "誰が いつ 何を使ったかを記録する場所はある？",
    answer:
      "多対多 (N:M) の関連は必ず連関実体 (中間テーブル) に分解する。この図では直接鳥足×鳥足で線が引かれているため、「田中さんが 8/1 に洗濯機を使った」という利用履歴を格納する場所が存在しない。",
    concept: "多対多に連関実体なし",
    href: "/data-modeling/er-diagram/many-to-many",
  },
  {
    n: 3,
    title: "「配偶者」が独立主キーを持ち、親エンティティと繋がっていない",
    hint: "「田中さんの配偶者」という文脈なしで、この配偶者は誰？",
    answer:
      "「配偶者」は 意味的には 入居者 に従属する弱エンティティ (「田中さんの配偶者」という文脈なしには成立しない)。IE 記法の適切な設計なら、入居者との関連を明示し、主キーを (入居者ID, 配偶者連番) 等の複合キーにする。この図では入居者と一切の関連が引かれず、独立の配偶者ID だけで単独存在する形になっており、実世界の意味と噛み合っていない。",
    concept: "弱エンティティが親を持たない",
    href: "/data-modeling/er-diagram/weak-entity",
  },
  {
    n: 4,
    title: "「家賃履歴」の主キーが独立で、親エンティティに従属していない",
    hint: "家賃履歴だけを見て「これは誰のいつの支払い？」と答えられる？",
    answer:
      "家賃履歴は本来「入居者に対する家賃の支払い」なので、入居者 なしには意味を持たない弱エンティティ。IE 記法では、弱エンティティは主キー欄に親の主キーを含めた複合キー ((入居者ID, 支払日) 等) で表現するべき。この図では 履歴ID 単独の主キーになっていて、履歴だけを見ても誰のいつの支払いか分からず、識別関係の設計として破綻している。",
    concept: "弱エンティティの PK 設計不備",
    href: "/data-modeling/er-diagram/identifying",
  },
  {
    n: 5,
    title: "「入居者」の属性欄が破綻している",
    hint: "「家賃履歴JSON」を 1 属性に持たせて、更新のたびに何が起きる？",
    answer:
      "入居者に「家賃履歴JSON」「全部屋番号」「血液型」「保証人情報」など、粒度もライフサイクルも違う値がフラットに並んでいる。特に JSON や複数値属性は 1NF 違反で、更新時異常の温床。属性として持つべきものと別エンティティに切り出すべきものを分離する必要がある。",
    concept: "属性の粒度破綻 (1NF 違反)",
    href: "/data-modeling/er-diagram/entity",
  },
  {
    n: 6,
    title: "「入居者 ⇔ 部屋」の間に「住む」と「所属」が同時に引かれている",
    hint: "この 2 本の線、どっちがどんな意味？",
    answer:
      "同じエンティティ間に複数の関連を描く場合、必ず役割名で区別し、それぞれ独立した意味を持たせる必要がある。「住む」と「所属」が並行して引かれている一方で、意味の区別が図から読み取れず、読者は 2 本の線の違いを推測するしかない。",
    concept: "関連の役割名なし・重複",
    href: "/data-modeling/er-diagram/relationship",
  },
  {
    n: 7,
    title: "「入居者 → 保証人」の関係が循環参照になっている",
    hint: "保証人も入居者？だとしたらこの構造で誰を辿れる？",
    answer:
      "「保証人」が実は入居者と同じ存在で、しかも保証対象入居者ID を保証人が持ち、入居者は保証人ID を持ち…と循環している。自己参照 (再帰関連) にすべきところを別エンティティに分解した挙げ句、方向と参加制約が定義されていないため無限にたどれてしまう。",
    concept: "自己参照 (再帰関連) の設計不備",
    href: "/data-modeling/er-diagram/relationship",
  },
  {
    n: 8,
    title: "「住む」線に、必須 (縦棒) と任意 (円) の記号が矛盾している",
    hint: "「必ず 1 部屋に住む」なのに「0 個も許容」ってどういう状態？",
    answer:
      "同じ関連の同じ端に、必須参加を意味する縦棒 (`|`) と、任意参加を意味する円 (`○`) が同居している。設計上「必ず 1 つ以上の部屋を持つ」なのか「0 個でも許容する」なのか判断がつかない。参加制約はどちらか片方を明示するべき。",
    concept: "参加制約の矛盾",
    href: "/data-modeling/er-diagram/optionality",
  },
  {
    n: 9,
    title: "「家賃履歴 —紐付く— 契約書」の線だけ記法が違う",
    hint: "この線の記号、他とテイストが違わない？",
    answer:
      "他の関連は IE 記法 (crow's foot: 鳥足と縦棒) で描かれているが、契約書との関連だけ IDEF1X 記法 (● / ○ / P / M) で描かれている。図全体で記法を統一しないと、読者は同じ記号を違う意味で誤読する。",
    concept: "記法混在",
    href: "/data-modeling/er-diagram/notation",
  },
];

type Mode = "puzzle" | "hint" | "reveal";

export function AnomalyList() {
  const [mode, setMode] = useState<Mode>("puzzle");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const highlight = mode === "reveal"
    ? new Set(ANOMALIES.map((a) => a.n))
    : new Set<number>();

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          9 つの違和感
        </h2>
        <div className="flex flex-wrap gap-2">
          <ModeButton current={mode} value="puzzle" onChange={setMode}>
            謎かけモード
          </ModeButton>
          <ModeButton current={mode} value="hint" onChange={setMode}>
            ヒント表示
          </ModeButton>
          <ModeButton current={mode} value="reveal" onChange={setMode}>
            全て答え合わせ
          </ModeButton>
        </div>
      </div>

      {mode === "puzzle" && (
        <p className="mb-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
          自分で数え終わったら「ヒント表示」→「全て答え合わせ」の順で押してください。
          答え合わせを押すと Hero の ER 図上に 9 つのオレンジの番号バッジが乗ります。
        </p>
      )}

      {mode !== "puzzle" && (
        <div className="mb-8 not-prose">
          <WeirdERDiagram
            highlightAnomalies={highlight}
            title={mode === "reveal" ? "答え合わせ: 9 つの違和感" : "変な ER 図 (再掲)"}
            caption={
              mode === "reveal"
                ? "オレンジの番号バッジが 9 つの違和感箇所。詳細は下記リストを参照。"
                : "各項目のタイトルをクリックすると答え合わせが展開されます。"
            }
          />
        </div>
      )}

      <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {ANOMALIES.map((a) => {
          const isOpen = mode === "reveal" || openIds.has(a.n);
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
                  {mode !== "puzzle" && (
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
                  <p className="text-sm leading-relaxed">{a.answer}</p>
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

function ModeButton({
  current,
  value,
  onChange,
  children,
}: {
  current: Mode;
  value: Mode;
  onChange: (m: Mode) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={
        "border px-3 py-1.5 text-xs font-bold transition-colors " +
        (active
          ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
          : "border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--muted)]/60")
      }
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
