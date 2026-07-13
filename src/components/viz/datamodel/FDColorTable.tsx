import { VizFrame } from "@/components/viz/VizFrame";

export type ColorGroup = {
  /** グループのキー (columns.group から参照される) */
  key: string;
  /** 見出しに表示するマーカー (例: "◆", "■", "●") */
  marker: string;
  /** 凡例に表示する説明 (例: "主キー全体で決まる") */
  label: string;
  /** ヘッダーセルの背景色クラス */
  headerBgClass: string;
  /** データセルの背景色クラス */
  cellBgClass: string;
};

export type ColorColumn = {
  name: string;
  /** ColorGroup.key と一致 */
  group: string;
  /** true なら "PK" バッジを表示 */
  isPk?: boolean;
};

/**
 * 実データの表を、列ごとに「決定関数グループ」で色分けして示す。
 * 同じ色の列で同じ値が繰り返される = 冗長性 が視覚的に読める。
 */
export function FDColorTable({
  title,
  name,
  columns,
  rows,
  groups,
  caption,
}: {
  title: string;
  /** テーブル名 (表の上に小さく表示) */
  name: string;
  columns: ColorColumn[];
  rows: (string | number)[][];
  groups: ColorGroup[];
  caption?: React.ReactNode;
}) {
  const groupByKey = new Map(groups.map((g) => [g.key, g]));

  return (
    <VizFrame title={title}>
      <div className="flex flex-col gap-4">
        {/* 凡例 */}
        <div className="flex flex-wrap gap-3">
          {groups.map((g) => (
            <div
              key={g.key}
              className={
                "flex items-baseline gap-2 border border-[var(--border-strong)] px-3 py-1.5 " +
                g.headerBgClass
              }
            >
              <span className="font-mono text-sm font-bold">{g.marker}</span>
              <span className="text-xs text-[var(--foreground)]">
                {g.label}
              </span>
            </div>
          ))}
        </div>

        {/* テーブル */}
        <div className="overflow-x-auto border border-[var(--border-strong)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 font-mono text-xs font-bold text-[var(--foreground)]">
            {name}
          </div>
          <table className="min-w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--border-strong)]">
                {columns.map((c, i) => {
                  const g = groupByKey.get(c.group);
                  return (
                    <th
                      key={i}
                      className={
                        "px-3 py-2 text-left align-bottom " +
                        (g?.headerBgClass ?? "")
                      }
                    >
                      <div className="text-[10px] font-bold text-[var(--muted-foreground)] leading-none">
                        {g?.marker ?? ""}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5 font-bold text-[var(--foreground)]">
                        <span>{c.name}</span>
                        {c.isPk && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                            PK
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  {row.map((cell, j) => {
                    const g = groupByKey.get(columns[j].group);
                    return (
                      <td
                        key={j}
                        className={
                          "px-3 py-1.5 whitespace-nowrap text-[var(--foreground)] " +
                          (g?.cellBgClass ?? "")
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

        {caption && (
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {caption}
          </p>
        )}
      </div>
    </VizFrame>
  );
}
