import { VizFrame } from "@/components/viz/VizFrame";

export type FDGroupKind = "full" | "partial" | "transitive";

export type FDGroup = {
  kind: FDGroupKind;
  /** グループを識別するラベル (箱の上部見出し) */
  label: string;
  /** 決定関数の属性 (例: ["注文ID"] や ["注文ID", "商品ID"]) */
  determinant: string[];
  /** 従属する属性 */
  dependents: string[];
  /** グループの補足 (小さめの説明) */
  note?: string;
};

export function FDGroupBoxes({
  title,
  groups,
  caption,
}: {
  title: string;
  groups: FDGroup[];
  caption?: React.ReactNode;
}) {
  return (
    <VizFrame title={title}>
      <div className="flex flex-col gap-4">
        {groups.map((g, i) => (
          <GroupBox key={i} group={g} />
        ))}
        {caption && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
            {caption}
          </p>
        )}
      </div>
    </VizFrame>
  );
}

function GroupBox({ group }: { group: FDGroup }) {
  const kindLabel =
    group.kind === "full"
      ? "完全関数従属"
      : group.kind === "partial"
        ? "部分関数従属"
        : "推移関数従属";
  const kindBadgeCls =
    group.kind === "full"
      ? "bg-[var(--foreground)] text-[var(--primary-foreground)]"
      : "bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border-strong)]";

  return (
    <div className="border border-[var(--border-strong)] bg-[var(--card)] p-4">
      <div className="flex items-baseline flex-wrap gap-2 mb-3">
        <span
          className={
            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 " +
            kindBadgeCls
          }
        >
          {kindLabel}
        </span>
        <span className="text-sm font-bold text-[var(--foreground)]">
          {group.label}
        </span>
        {group.note && (
          <span className="text-xs text-[var(--muted-foreground)]">
            {group.note}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <AttrPillGroup items={group.determinant} strong />
        <ArrowIcon dashed={group.kind === "transitive"} />
        <AttrPillGroup items={group.dependents} />
      </div>
    </div>
  );
}

function AttrPillGroup({
  items,
  strong = false,
}: {
  items: string[];
  strong?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.map((a) => (
        <span
          key={a}
          className={
            "inline-flex items-center border px-3 py-1.5 font-mono text-xs " +
            (strong
              ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--primary-foreground)] font-bold"
              : "border-[var(--border-strong)] bg-[var(--card)] text-[var(--foreground)]")
          }
        >
          {a}
        </span>
      ))}
    </div>
  );
}

function ArrowIcon({ dashed = false }: { dashed?: boolean }) {
  return (
    <svg
      width="36"
      height="16"
      viewBox="0 0 36 16"
      aria-hidden
      className="text-[var(--foreground)] shrink-0"
    >
      <line
        x1="2"
        y1="8"
        x2="28"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={dashed ? "3 2" : undefined}
      />
      <path
        d="M24 3 L32 8 L24 13"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
