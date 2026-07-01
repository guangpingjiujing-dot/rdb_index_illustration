import { cn } from "@/lib/utils";

export function LevelBadge({ level }: { level: "basic" | "advanced" }) {
  const label = level === "basic" ? "基礎" : "発展";
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border",
        level === "basic"
          ? "border-[var(--border-strong)] text-[var(--muted-foreground)] bg-transparent"
          : "border-[var(--foreground)] text-[var(--foreground)] bg-transparent"
      )}
      aria-label={`難易度: ${label}`}
    >
      {label}
    </span>
  );
}
