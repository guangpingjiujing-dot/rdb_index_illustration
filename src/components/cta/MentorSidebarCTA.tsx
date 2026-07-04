import Link from "next/link";
import { site } from "@/lib/site";

export function MentorSidebarCTA() {
  return (
    <div className="shrink-0 rounded-lg border border-[var(--foreground)] bg-[var(--foreground)] p-4 text-white">
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
        個別指導
      </div>
      <h3 className="mt-1 text-sm font-bold leading-snug">
        もっと深く学びたい方へ
      </h3>
      <p className="mt-2 text-xs leading-relaxed opacity-80">
        SQL・DB設計・パフォーマンスチューニングを1対1でサポート。
      </p>
      <Link
        href={site.author.mentorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center rounded bg-white px-3 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[#f5f5f5]"
      >
        無料相談を予約 →
      </Link>
    </div>
  );
}
