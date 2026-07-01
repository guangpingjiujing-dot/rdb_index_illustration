import { VizFrame } from "./VizFrame";

export function StorageHierarchyViz() {
  return (
    <VizFrame
      title="物理ストレージの階層"
      legend={
        <span>
          ズームインしていく形で「ファイル → エクステント → ページ → 行」の入れ子構造を示している。RDBの物理I/Oはすべてこの階層のどこかを触っている。
        </span>
      }
    >
      <div className="overflow-x-auto">
        <svg viewBox="0 0 820 260" className="mx-auto block w-full min-w-[720px]">
          {/* Level 1: File */}
          <Level
            x={10}
            label="FILE"
            size="数百MB 〜 数GB"
            note="PostgreSQL / MySQL InnoDB では 1 テーブル 1 ファイルが基本"
          >
            {/* many extent slots stacked vertically to show file contains many extents */}
            {Array.from({ length: 6 }).map((_, i) => (
              <rect
                key={i}
                x={16}
                y={12 + i * 14}
                width={148}
                height={10}
                fill={i === 0 ? "#0a0a0a" : "#d9d9d5"}
              />
            ))}
          </Level>

          <Arrow x={190} />

          {/* Level 2: Extent */}
          <Level
            x={210}
            label="EXTENT"
            size="64KB 〜 1MB"
            note="連続した複数ページの束。ディスク上の割り当て単位"
          >
            {/* extent contains several pages horizontally */}
            <rect x={12} y={10} width={156} height={100} fill="#f0f0ee" stroke="#a3a39f" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x={16 + i * 19}
                y={20}
                width={16}
                height={80}
                fill={i === 0 ? "#0a0a0a" : "#ffffff"}
                stroke="#a3a39f"
                strokeWidth={0.8}
              />
            ))}
          </Level>

          <Arrow x={390} />

          {/* Level 3: Page */}
          <Level
            x={410}
            label="PAGE"
            size="8KB (InnoDB: 16KB)"
            note="ディスクとメモリのI/O単位。数行〜数十行が入る"
          >
            <rect x={12} y={10} width={156} height={100} fill="#ffffff" stroke="#0a0a0a" strokeWidth={1.5} />
            <text x={20} y={26} fontSize={9} fill="#6b6b68" fontFamily="monospace">
              header
            </text>
            <line x1={12} y1={30} x2={168} y2={30} stroke="#d9d9d5" />
            {Array.from({ length: 5 }).map((_, i) => (
              <g key={i}>
                <rect
                  x={16}
                  y={36 + i * 14}
                  width={148}
                  height={10}
                  fill={i === 0 ? "#0a0a0a" : "#f5f5f4"}
                />
                {i > 0 && (
                  <text
                    x={22}
                    y={44 + i * 14}
                    fontSize={7}
                    fill="#6b6b68"
                    fontFamily="monospace"
                  >
                    row · {i + 1}
                  </text>
                )}
              </g>
            ))}
          </Level>

          <Arrow x={590} />

          {/* Level 4: Row */}
          <Level
            x={610}
            label="ROW"
            size="数十 〜 数百バイト"
            note="行ID (page 番号, ページ内 offset) で一意に指せる"
          >
            <rect x={12} y={12} width={156} height={96} fill="#0a0a0a" />
            <text x={20} y={32} fontSize={10} fill="#ffffff" fontFamily="monospace">
              id = 42
            </text>
            <text x={20} y={50} fontSize={10} fill="#ffffff" fontFamily="monospace">
              name = &quot;Sato&quot;
            </text>
            <text x={20} y={68} fontSize={10} fill="#ffffff" fontFamily="monospace">
              email = &quot;s@…&quot;
            </text>
            <line x1={12} y1={82} x2={168} y2={82} stroke="#6b6b68" strokeDasharray="2 2" />
            <text x={20} y={98} fontSize={9} fill="#a3a39f" fontFamily="monospace">
              rowid = (1, 0)
            </text>
          </Level>
        </svg>
      </div>
    </VizFrame>
  );
}

function Level({
  x,
  label,
  size,
  note,
  children,
}: {
  x: number;
  label: string;
  size: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <g>
      {/* header label */}
      <text
        x={x}
        y={14}
        fontSize={10}
        fontFamily="monospace"
        fontWeight={700}
        fill="#6b6b68"
        style={{ letterSpacing: 2 }}
      >
        {label}
      </text>
      <text
        x={x + 180}
        y={14}
        fontSize={9}
        fontFamily="monospace"
        fill="#a3a39f"
        textAnchor="end"
      >
        {size}
      </text>

      {/* container box */}
      <rect x={x} y={22} width={180} height={130} fill="#ffffff" stroke="#0a0a0a" strokeWidth={1} />
      <g transform={`translate(${x}, 22)`}>{children}</g>

      {/* note beneath */}
      <foreignObject x={x} y={162} width={180} height={90}>
        <div
          style={{
            fontSize: 11,
            color: "#6b6b68",
            lineHeight: 1.5,
            fontFamily: "sans-serif",
          }}
        >
          {note}
        </div>
      </foreignObject>
    </g>
  );
}

function Arrow({ x }: { x: number }) {
  return (
    <g>
      <line x1={x} y1={87} x2={x + 20} y2={87} stroke="#0a0a0a" strokeWidth={1.5} />
      <polygon points={`${x + 20},82 ${x + 30},87 ${x + 20},92`} fill="#0a0a0a" />
      <text
        x={x + 15}
        y={77}
        textAnchor="middle"
        fontSize={9}
        fill="#6b6b68"
        fontFamily="monospace"
      >
        zoom
      </text>
    </g>
  );
}
