import {
  NormalizedTableView,
  type NormalizedTable,
} from "./TableBeforeAfter";
import type { ColorGroup } from "./FDColorTable";

/**
 * 練習問題ブロック。
 * - 問題テーブルは常時表示
 * - 解答は <details> で折りたたみ (JS 不要、SEO/AEOにも優しい)
 * - 解答テーブルは複数持てる (2NF/3NF は分割になるため)
 */
export function Practice({
  title,
  question,
  problem,
  answer,
  answerTables,
  colorGroups,
}: {
  title: string;
  question: React.ReactNode;
  problem: NormalizedTable;
  answer: React.ReactNode;
  answerTables: NormalizedTable[];
  colorGroups?: ColorGroup[];
}) {
  const wide = answerTables.filter((t) => t.wide);
  const narrow = answerTables.filter((t) => !t.wide);

  return (
    <figure className="my-8 border border-[var(--border-strong)] bg-[var(--card)]">
      <figcaption className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        <span>練習問題 — {title}</span>
      </figcaption>

      <div className="p-4 md:p-6 flex flex-col gap-4">
        <div className="text-sm leading-relaxed text-[var(--foreground)]">
          {question}
        </div>

        <NormalizedTableView data={problem} colorGroups={colorGroups} />

        <details className="group border border-[var(--border-strong)] bg-[var(--muted)]/40">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-2">
            <span
              className="inline-block transition-transform group-open:rotate-90"
              aria-hidden
            >
              ▶
            </span>
            答えを見る
          </summary>
          <div className="border-t border-[var(--border)] p-4 md:p-6 flex flex-col gap-4 bg-[var(--card)]">
            <div className="text-sm leading-relaxed text-[var(--foreground)]">
              {answer}
            </div>

            {wide.map((t) => (
              <div key={t.name} className="w-full">
                <NormalizedTableView data={t} colorGroups={colorGroups} />
              </div>
            ))}
            {narrow.length > 0 && (
              <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
                {narrow.map((t) => (
                  <div key={t.name} className="min-w-0 flex-1">
                    <NormalizedTableView data={t} colorGroups={colorGroups} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </div>
    </figure>
  );
}
