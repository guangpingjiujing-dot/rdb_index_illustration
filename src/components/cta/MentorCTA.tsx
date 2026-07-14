import Link from "next/link";
import { site } from "@/lib/site";

const MENTA_REVIEWS_URL = "https://menta.work/user/179723/review/recieves";

type Testimonial = {
  quote: string;
  name: string;
  meta: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "教え方も上手で、お人柄も良いメンターです。DB周りの知識はもちろん、何より、しっかり教えてあげようという姿勢がとてもありがたかったです。データベース、SQLの学習を考えている方にはおススメです。",
    name: "H 様",
    meta: "DB・SQL コース受講",
  },
  {
    quote:
      "体系的に知識を教えてくださり、実際の業務でも大変役立っております。特に短い時間で効率よく知識の習得や、練習をできているのは期待以上でした。",
    name: "M 様",
    meta: "DB・SQL コース受講",
  },
  {
    quote:
      "大変充実したコンテンツでわかりやすいご説明をありがとうございました。基本的な質問にも丁寧にご説明いただき、また業務のご相談にも乗って頂き大変有意義な時間でした。",
    name: "K 様",
    meta: "DB・SQL コース受講",
  },
];

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
      <div className="border-t border-[var(--foreground)] px-6 md:px-10 py-8 md:py-10">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            受講者の声
          </div>
          <Link
            href={MENTA_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
          >
            menta レビュー原文を見る →
          </Link>
        </div>
        <ul className="mt-5 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <li
              key={t.name + t.quote.slice(0, 8)}
              className="border border-[var(--border)] bg-[var(--background)] p-5 flex flex-col"
            >
              <div
                aria-label="5段階評価のうち5"
                className="text-sm tracking-widest text-[var(--foreground)]"
              >
                <span aria-hidden="true">{"★★★★★"}</span>
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
                「{t.quote}」
              </blockquote>
              <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                — {t.name}（{t.meta}）
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
