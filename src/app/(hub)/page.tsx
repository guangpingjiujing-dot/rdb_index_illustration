import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MentorCTA } from "@/components/cta/MentorCTA";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.author.name} — エンジニア講師 / データエンジニア`,
  description: `${site.author.name}（${site.author.role}）のポータル。RDBインデックス図解など技術学習コンテンツと、個別指導・無料相談の窓口。`,
  alternates: { canonical: "/" },
};

export default function HubPage() {
  return (
    <Container size="narrow" className="py-20 md:py-28">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          taitech.dev
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
          {site.author.name}
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-lg">
          {site.author.role}。SQL・データベース・クラウド・AI活用を個別指導。
        </p>
      </header>

      <section className="mt-16">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          コンテンツ
        </h2>
        <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          <li>
            <Link
              href="/rdb-index"
              className="group flex items-center justify-between gap-4 py-5 px-2 -mx-2 hover:bg-[var(--muted)]/60 transition-colors"
            >
              <div>
                <div className="text-lg font-bold group-hover:underline underline-offset-4">
                  RDBインデックス図解
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  B-tree・ハッシュ・クラスタ化・複合など、インデックスの仕組みを動く図解で理解する。
                </p>
              </div>
              <span className="text-[var(--muted-foreground)] text-lg shrink-0">→</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-16">
        <MentorCTA />
      </section>
    </Container>
  );
}