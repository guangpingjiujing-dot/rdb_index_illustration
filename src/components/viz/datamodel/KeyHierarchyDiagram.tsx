import { VizFrame } from "@/components/viz/VizFrame";

type KeyDef = {
  code: string;
  label: string;
  description: React.ReactNode;
};

const DEFAULT_KEYS: KeyDef[] = [
  {
    code: "SUPERKEY",
    label: "スーパーキー (superkey)",
    description: (
      <>
        行を一意に識別できる属性集合すべて。関係のない属性を追加しても一意性は保たれるので、
        極端に言えば「全属性」もスーパーキーになる。
      </>
    ),
  },
  {
    code: "CANDIDATE KEY",
    label: "候補キー (candidate key)",
    description: (
      <>
        スーパーキーのうち <strong>極小</strong> なもの
        (真部分集合ではその一意性が失われる)。1 つのテーブルに候補キーが複数存在することもある。
      </>
    ),
  },
  {
    code: "PK",
    label: "主キー (primary key, PK)",
    description: (
      <>
        候補キーのうち、実装上「これを行の識別に使う」と選んだ 1 つ。
        外部キーが参照する対象になる。
      </>
    ),
  },
  {
    code: "AK",
    label: "代替キー (alternate key, AK)",
    description: (
      <>
        候補キーのうち、主キーに選ばれなかったもの。
        UNIQUE 制約を張るなどして一意性は保証される。
      </>
    ),
  },
];

export function KeyHierarchyDiagram({
  title,
  keys = DEFAULT_KEYS,
}: {
  title?: string;
  keys?: KeyDef[];
}) {
  return (
    <VizFrame title={title ?? "キーの階層 (集合図)"}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,240px)_1fr] md:gap-8 md:items-start">
        {/* 左: 楕円の集合図 */}
        <div className="flex justify-center md:justify-start">
          <svg
            viewBox="0 0 260 220"
            className="w-full max-w-[260px]"
            role="img"
            aria-label="スーパーキー、候補キー、主キー、代替キーの集合関係"
          >
            {/* スーパーキー (最外楕円) */}
            <ellipse
              cx="130"
              cy="110"
              rx="128"
              ry="108"
              fill="#f2f2f0"
              stroke="#a3a39f"
              strokeWidth="1.5"
            />
            <text
              x="14"
              y="24"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="700"
              fill="#0a0a0a"
              letterSpacing="1.5"
            >
              SUPERKEY
            </text>

            {/* 候補キー (中楕円) */}
            <ellipse
              cx="130"
              cy="125"
              rx="105"
              ry="78"
              fill="#ebebe8"
              stroke="#0a0a0a"
              strokeWidth="1.5"
            />
            <text
              x="42"
              y="66"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="700"
              fill="#0a0a0a"
              letterSpacing="1.5"
            >
              CANDIDATE KEY
            </text>

            {/* 主キー (左) */}
            <ellipse
              cx="90"
              cy="140"
              rx="42"
              ry="42"
              fill="#0a0a0a"
              stroke="#0a0a0a"
              strokeWidth="1.5"
            />
            <text
              x="90"
              y="148"
              fontSize="18"
              fontFamily="monospace"
              fontWeight="700"
              fill="#fafafa"
              textAnchor="middle"
            >
              PK
            </text>

            {/* 代替キー (右) */}
            <ellipse
              cx="180"
              cy="140"
              rx="42"
              ry="42"
              fill="#ffffff"
              stroke="#0a0a0a"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x="180"
              y="148"
              fontSize="18"
              fontFamily="monospace"
              fontWeight="700"
              fill="#0a0a0a"
              textAnchor="middle"
            >
              AK
            </text>
          </svg>
        </div>

        {/* 右: 説明パネル */}
        <div className="not-prose flex flex-col gap-4">
          {keys.map((k) => (
            <div key={k.code}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {k.code}
                </span>
                <span className="text-base font-bold text-[var(--foreground)]">
                  {k.label}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]">
                {k.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-[var(--muted-foreground)] leading-relaxed">
        外側から順に「一意性を持つ属性集合」を絞り込んでいくと、
        <strong>スーパーキー ⊃ 候補キー ⊃ 主キー</strong> の階層になる。
        代替キーは候補キーのうち主キーに選ばれなかったもの。
      </p>
    </VizFrame>
  );
}
