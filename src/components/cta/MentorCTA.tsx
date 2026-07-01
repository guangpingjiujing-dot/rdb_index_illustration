import Link from "next/link";
import { site } from "@/lib/site";

export function MentorCTA() {
  return (
    <section
      id="mentor"
      className="mt-20 border-y border-[var(--foreground)] bg-[var(--card)]"
    >
      <div className="py-10 md:py-12 px-6 md:px-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            オンライン個別指導
          </div>
          <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight leading-snug">
            もっと深くDBを学びたい方へ。
          </h3>
          <p className="mt-3 text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed">
            {site.author.name}が、SQL・データベース設計・パフォーマンスチューニング・
            IPAデータベーススペシャリスト対策まで、1対1で学習をサポートします。まずは無料相談から。
          </p>
        </div>
        <Link
          href={site.author.mentorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center bg-[var(--foreground)] text-white px-6 py-3 text-sm md:text-base font-bold hover:bg-[#262626] transition-colors"
        >
          無料相談を予約する →
        </Link>
      </div>
    </section>
  );
}
