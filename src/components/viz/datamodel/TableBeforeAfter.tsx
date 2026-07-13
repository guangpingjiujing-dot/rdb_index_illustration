import { VizFrame } from "@/components/viz/VizFrame";
import type { ColorGroup } from "./FDColorTable";

export type NormalizedTable = {
  name: string;
  columns: string[];
  rows: (string | number)[][];
  primaryKey?: string[];
  highlightColumns?: string[];
  /** true にすると After 側で単独の行にフル幅で表示される (残りは下段で横並び) */
  wide?: boolean;
  /** 列名 → カラーグループキー のマップ (colorGroups と組み合わせて使う) */
  columnGroups?: Record<string, string>;
};

export function TableBeforeAfter({
  title,
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  legend,
  colorGroups,
}: {
  title: string;
  before: NormalizedTable;
  after: NormalizedTable[];
  beforeLabel?: string;
  afterLabel?: string;
  legend?: React.ReactNode;
  /** カラーグループ定義。テーブルの columnGroups と組み合わせて列を色分けする */
  colorGroups?: ColorGroup[];
}) {
  return (
    <VizFrame title={title} legend={legend}>
      <div className="flex flex-col gap-6">
        <div>
          <SectionLabel>{beforeLabel}</SectionLabel>
          <div className="mt-2">
            <NormalizedTableView data={before} colorGroups={colorGroups} />
          </div>
        </div>

        <Arrow />

        <div>
          <SectionLabel>{afterLabel}</SectionLabel>
          <div className="mt-2 flex flex-col gap-4">
            {(() => {
              const wideTables = after.filter((t) => t.wide);
              const narrowTables = after.filter((t) => !t.wide);
              return (
                <>
                  {wideTables.map((t) => (
                    <div key={t.name} className="w-full">
                      <NormalizedTableView data={t} colorGroups={colorGroups} />
                    </div>
                  ))}
                  {narrowTables.length > 0 && (
                    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
                      {narrowTables.map((t) => (
                        <div key={t.name} className="min-w-0 flex-1">
                          <NormalizedTableView data={t} colorGroups={colorGroups} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </VizFrame>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center py-1">
      <svg
        width="24"
        height="20"
        viewBox="0 0 24 20"
        aria-hidden
        className="text-[var(--muted-foreground)]"
      >
        <path
          d="M12 2 L12 16 M6 12 L12 18 L18 12"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * NormalizedTable を単体で描画するコンポーネント。
 * TableBeforeAfter 内部でも使うし、練習問題などで単体テーブルを出したい時にも import して使える。
 */
export function NormalizedTableView({
  data,
  colorGroups,
}: {
  data: NormalizedTable;
  colorGroups?: ColorGroup[];
}) {
  const pk = new Set(data.primaryKey ?? []);
  const highlight = new Set(data.highlightColumns ?? []);
  const groupByKey = new Map((colorGroups ?? []).map((g) => [g.key, g]));
  const getGroup = (colName: string) => {
    const key = data.columnGroups?.[colName];
    return key ? groupByKey.get(key) : undefined;
  };

  return (
    <div className="overflow-x-auto border border-[var(--border-strong)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 font-mono text-xs font-bold text-[var(--foreground)]">
        {data.name}
      </div>
      <table className="min-w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]/60">
            {data.columns.map((c) => {
              const isPk = pk.has(c);
              const isHi = highlight.has(c);
              const g = getGroup(c);
              const headerBg =
                g?.headerBgClass ?? (isHi ? "bg-[var(--warn-soft)]" : "");
              return (
                <th
                  key={c}
                  className={
                    "px-3 py-1.5 text-left font-bold text-[var(--foreground)] " +
                    headerBg
                  }
                >
                  <span className="flex items-baseline gap-1.5">
                    <span>{c}</span>
                    {isPk && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                        PK
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border)] last:border-b-0"
            >
              {row.map((cell, j) => {
                const col = data.columns[j];
                const isHi = highlight.has(col);
                const g = getGroup(col);
                const cellBg =
                  g?.cellBgClass ?? (isHi ? "bg-[var(--warn-soft)]" : "");
                return (
                  <td
                    key={j}
                    className={
                      "px-3 py-1.5 whitespace-nowrap text-[var(--foreground)] " +
                      cellBg
                    }
                  >
                    {String(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
