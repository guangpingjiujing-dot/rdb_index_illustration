import { VizFrame } from "./VizFrame";

type Variant = "btree" | "hash" | "covering-off" | "covering-on";

const VARIANTS: Record<
  Variant,
  { title: string; indexLabel: string; skipTable?: boolean }
> = {
  btree: {
    title: "B-treeの葉ノードから実データへ",
    indexLabel: "B-tree 葉ノード",
  },
  hash: {
    title: "ハッシュバケットから実データへ",
    indexLabel: "ハッシュバケット",
  },
  "covering-off": {
    title: "通常インデックス: 追加のページ読み取りが発生",
    indexLabel: "B-tree 葉ノード",
  },
  "covering-on": {
    title: "カバリング: インデックスだけで完結（ページ読まない）",
    indexLabel: "カバリング葉ノード",
    skipTable: true,
  },
};

export function IndexToRowFlow({ variant }: { variant: Variant }) {
  const v = VARIANTS[variant];
  const skip = v.skipTable;
  return (
    <VizFrame title={v.title}>
      <svg viewBox="0 0 720 220" className="w-full h-auto" role="img">
        {/* Index block */}
        <g>
          <rect x="16" y="60" width="200" height="100" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />
          <text x="116" y="80" textAnchor="middle" fontSize="11" fill="#6b6b68" fontFamily="monospace" style={{ textTransform: "uppercase", letterSpacing: 1.5 }}>
            {v.indexLabel}
          </text>
          <line x1="16" y1="90" x2="216" y2="90" stroke="#d9d9d5" />
          <text x="30" y="110" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#0a0a0a">
            key = 42
          </text>
          <text x="30" y="128" fontSize="11" fontFamily="monospace" fill="#6b6b68">
            → 行ID (page=1, offset=0)
          </text>
          {variant === "covering-on" && (
            <text x="30" y="146" fontSize="11" fontFamily="monospace" fill="#0a0a0a" fontWeight="700">
              + name=&quot;Sato&quot;
            </text>
          )}
        </g>

        {/* Arrow 1 */}
        <line
          x1="220"
          y1="110"
          x2="290"
          y2="110"
          stroke={skip ? "#d9d9d5" : "#0a0a0a"}
          strokeWidth="1.5"
          strokeDasharray={skip ? "4 4" : undefined}
        />
        <polygon
          points="290,105 300,110 290,115"
          fill={skip ? "#d9d9d5" : "#0a0a0a"}
        />
        <text
          x="255"
          y="100"
          textAnchor="middle"
          fontSize="10"
          fill={skip ? "#a3a39f" : "#0a0a0a"}
          fontFamily="monospace"
        >
          {skip ? "不要" : "ページ読み込み"}
        </text>

        {/* Table page block */}
        <g opacity={skip ? 0.35 : 1}>
          <rect x="300" y="60" width="400" height="100" fill="#ffffff" stroke={skip ? "#d9d9d5" : "#0a0a0a"} strokeWidth="1.5" />
          <text x="500" y="80" textAnchor="middle" fontSize="11" fill="#6b6b68" fontFamily="monospace" style={{ textTransform: "uppercase", letterSpacing: 1.5 }}>
            テーブル本体 Page 1（約8KB）
          </text>
          <line x1="300" y1="90" x2="700" y2="90" stroke="#d9d9d5" />
          {[
            { off: 0, id: 42, name: "Sato", email: "sato@example.com" },
            { off: 1, id: 15, name: "Tanaka", email: "tanaka@example.com" },
            { off: 2, id: 83, name: "Suzuki", email: "suzuki@example.com" },
            { off: 3, id: 27, name: "Ito", email: "ito@example.com" },
          ].map((r, i) => {
            const isTarget = r.off === 0;
            return (
              <g key={i}>
                <rect
                  x="300"
                  y={92 + i * 17}
                  width="400"
                  height="17"
                  fill={isTarget && !skip ? "#0a0a0a" : "transparent"}
                />
                <text
                  x="310"
                  y={104 + i * 17}
                  fontSize="11"
                  fontFamily="monospace"
                  fill={isTarget && !skip ? "#ffffff" : "#0a0a0a"}
                >
                  offset {r.off} · id={r.id} · {r.name} · {r.email}
                </text>
              </g>
            );
          })}
        </g>

        {/* Bottom labels */}
        <text x="116" y="185" textAnchor="middle" fontSize="11" fill="#6b6b68">
          {skip ? "1回のI/O（インデックスだけ）" : "インデックスから行IDを取得"}
        </text>
        <text
          x="500"
          y="185"
          textAnchor="middle"
          fontSize="11"
          fill={skip ? "#a3a39f" : "#6b6b68"}
        >
          {skip ? "本体ページは読まない" : "そのページを読んで該当行を取り出す"}
        </text>
      </svg>
    </VizFrame>
  );
}
