import { cn } from "@/lib/utils";

export function VizFrame({
  title,
  children,
  className,
  controls,
  legend,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  controls?: React.ReactNode;
  legend?: React.ReactNode;
}) {
  return (
    <figure
      className={cn(
        "my-8 border border-[var(--border-strong)] bg-[var(--card)]",
        className
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        <span>{title}</span>
      </figcaption>
      {controls && (
        <div className="border-b border-[var(--border)] px-4 py-3">
          {controls}
        </div>
      )}
      <div className="p-4 md:p-6">{children}</div>
      {legend && (
        <div className="border-t border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
          {legend}
        </div>
      )}
    </figure>
  );
}
