import Link from "next/link";

/**
 * インデックス表を「ソート済みリスト」として描いているvizに添える注記。
 * 「フルスキャンでは？」という誤解を防ぐため、実際はB-treeであること・
 * 探索が O(log N) で済むことを明示する。
 */
export function BTreeNote() {
  return (
    <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted-foreground)]">
      ※ ここでは分かりやすさのためソート済みリスト風に描いているが、
      実際はB-treeで保持されるので探索は <code>O(log N)</code>。
      詳しくは{" "}
      <Link
        href="/rdb-index/btree"
        className="underline underline-offset-2 hover:no-underline"
      >
        B-treeの仕組み
      </Link>
      {" "}へ。
    </p>
  );
}
