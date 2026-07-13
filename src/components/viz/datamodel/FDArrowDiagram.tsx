import { VizFrame } from "@/components/viz/VizFrame";

export type FDKind = "full" | "partial" | "transitive";

export type FunctionalDependency = {
  from: string[];
  to: string[];
  kind?: FDKind;
  note?: string;
};

const KIND_LABEL: Record<FDKind, string> = {
  full: "完全関数従属",
  partial: "部分関数従属",
  transitive: "推移関数従属",
};

export function FDArrowDiagram({
  title,
  attributes,
  primaryKey = [],
  dependencies,
  caption,
  legend,
}: {
  title: string;
  attributes: string[];
  primaryKey?: string[];
  dependencies: FunctionalDependency[];
  caption?: string;
  legend?: React.ReactNode;
}) {
  const pk = new Set(primaryKey);
  return (
    <VizFrame title={title} legend={legend}>
      <div className="flex flex-col gap-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            属性
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {attributes.map((a) => {
              const isPk = pk.has(a);
              return (
                <span
                  key={a}
                  className={
                    "inline-flex items-baseline gap-1.5 border px-3 py-1.5 font-mono text-xs " +
                    (isPk
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--primary-foreground)] font-bold"
                      : "border-[var(--border-strong)] bg-[var(--card)] text-[var(--foreground)]")
                  }
                >
                  <span>{a}</span>
                  {isPk && (
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                      PK
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            関数従属
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {dependencies.map((fd, i) => (
              <li
                key={i}
                className="flex flex-col gap-2 border border-[var(--border-strong)] bg-[var(--card)] p-3 md:flex-row md:items-center md:gap-4"
              >
                <div className="flex flex-1 items-center gap-2 flex-wrap">
                  <AttrGroup items={fd.from} pk={pk} />
                  <ArrowIcon kind={fd.kind} />
                  <AttrGroup items={fd.to} pk={pk} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {fd.kind && (
                    <span
                      className={
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 " +
                        kindBadgeClass(fd.kind)
                      }
                    >
                      {KIND_LABEL[fd.kind]}
                    </span>
                  )}
                  {fd.note && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {fd.note}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
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

function AttrGroup({ items, pk }: { items: string[]; pk: Set<string> }) {
  const composite = items.length > 1;
  return (
    <span
      className={
        "inline-flex items-center gap-1 " +
        (composite
          ? "border-l border-r border-[var(--border-strong)] px-1"
          : "")
      }
    >
      {composite && (
        <span className="font-mono text-[var(--muted-foreground)] text-xs select-none">
          {"{"}
        </span>
      )}
      {items.map((a, i) => {
        const isPk = pk.has(a);
        return (
          <span key={a} className="flex items-baseline gap-1">
            <span
              className={
                "font-mono text-xs " +
                (isPk
                  ? "font-bold text-[var(--foreground)]"
                  : "text-[var(--foreground)]")
              }
            >
              {a}
            </span>
            {i < items.length - 1 && (
              <span className="text-[var(--muted-foreground)] text-xs">
                ,
              </span>
            )}
          </span>
        );
      })}
      {composite && (
        <span className="font-mono text-[var(--muted-foreground)] text-xs select-none">
          {"}"}
        </span>
      )}
    </span>
  );
}

function ArrowIcon({ kind }: { kind?: FDKind }) {
  const dashed = kind === "transitive";
  return (
    <svg
      width="28"
      height="14"
      viewBox="0 0 28 14"
      aria-hidden
      className="text-[var(--foreground)]"
    >
      <line
        x1="2"
        y1="7"
        x2="22"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={dashed ? "3 2" : undefined}
      />
      <path
        d="M18 3 L24 7 L18 11"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function kindBadgeClass(kind: FDKind): string {
  switch (kind) {
    case "full":
      return "bg-[var(--foreground)] text-[var(--primary-foreground)]";
    case "partial":
      return "bg-[var(--warn-soft)] text-[var(--foreground)] border border-[var(--border-strong)]";
    case "transitive":
      return "bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border-strong)]";
  }
}
