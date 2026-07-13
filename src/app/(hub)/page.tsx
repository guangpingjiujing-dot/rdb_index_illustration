import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MentorCTA } from "@/components/cta/MentorCTA";
import { HubHomeJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";
import { sections } from "@/content/sections";

const DATA_MODELING_READY = true;

export const metadata: Metadata = {
  title: { absolute: site.fullName },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: site.fullName,
    description: site.description,
    url: "/",
  },
};

export default function Home() {
  return (
    <>
      <HubHomeJsonLd />
      <Hero />
      <TwoPillars />
      <MentorSection />
      <WhyThisSite />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-[var(--border)]">
      <Container size="wide" className="py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              たいてっく
            </div>
            <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              RDBとデータモデリングを、動く図解と厳密な定義で。
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-[var(--muted-foreground)] leading-relaxed">
              教科書で挫折しがちな概念を、実際に触れる図解と辞書的な厳密な定義で解説します。
              新人エンジニアの独学から、IPAデータベーススペシャリスト対策まで、必要な深さで読める2本柱の学習サイト。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={sections["rdb-index"].path}
                className="inline-flex items-center gap-2 bg-[var(--foreground)] text-white px-6 py-3 text-sm font-bold hover:bg-[#262626]"
              >
                RDBインデックスから見る →
              </Link>
              {DATA_MODELING_READY ? (
                <Link
                  href={sections["data-modeling"].path}
                  className="inline-flex items-center gap-2 border border-[var(--foreground)] px-6 py-3 text-sm font-bold hover:bg-[var(--muted)]"
                >
                  データモデリングから見る →
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex items-center gap-2 border border-[var(--border)] px-6 py-3 text-sm font-bold text-[var(--muted-foreground)] cursor-not-allowed"
                >
                  データモデリング (近日公開)
                </span>
              )}
            </div>
          </div>
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[4/3] w-full max-w-md justify-self-end">
      <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label="2本柱">
        <rect x="0" y="0" width="400" height="300" fill="#f2f2f0" />
        <g transform="translate(60, 40)" fontFamily="monospace">
          <rect x="0" y="0" width="130" height="180" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />
          <text x="65" y="30" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="3" fill="#6b6b68">INDEX</text>
          <line x1="15" y1="52" x2="115" y2="52" stroke="#d9d9d5" strokeWidth="1" />
          <text x="15" y="76" fontSize="12" fontWeight="700" fill="#0a0a0a">B-tree</text>
          <text x="15" y="98" fontSize="12" fontWeight="700" fill="#0a0a0a">Hash</text>
          <text x="15" y="120" fontSize="12" fontWeight="700" fill="#0a0a0a">Clustered</text>
          <text x="15" y="142" fontSize="12" fontWeight="700" fill="#0a0a0a">Composite</text>
          <text x="15" y="164" fontSize="12" fontWeight="700" fill="#0a0a0a">Covering</text>

          <rect x="150" y="0" width="130" height="180" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />
          <text x="215" y="30" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="3" fill="#6b6b68">MODELING</text>
          <line x1="165" y1="52" x2="265" y2="52" stroke="#d9d9d5" strokeWidth="1" />
          <text x="165" y="76" fontSize="12" fontWeight="700" fill="#0a0a0a">FD</text>
          <text x="165" y="98" fontSize="12" fontWeight="700" fill="#0a0a0a">Keys</text>
          <text x="165" y="120" fontSize="12" fontWeight="700" fill="#0a0a0a">1NF</text>
          <text x="165" y="142" fontSize="12" fontWeight="700" fill="#0a0a0a">2NF</text>
          <text x="165" y="164" fontSize="12" fontWeight="700" fill="#0a0a0a">3NF</text>
        </g>
        <text x="200" y="250" textAnchor="middle" fontSize="11" fill="#6b6b68" fontFamily="monospace" letterSpacing="2">
          TAITECH · 2 SERIES
        </text>
      </svg>
    </div>
  );
}

function TwoPillars() {
  const pillars = [
    {
      key: "rdb-index" as const,
      href: sections["rdb-index"].path,
      title: sections["rdb-index"].label,
      lead: "B-treeやハッシュ、複合インデックスの動きを、値を変えられる図解で辿る。",
      bullets: [
        "B-tree の探索を可視化",
        "複合インデックスのカラム順",
        "EXPLAIN の読み方 / 統計情報",
      ],
      links: [
        { href: "/rdb-index/basics/why-index", label: "なぜインデックスが必要か" },
        { href: "/rdb-index/btree", label: "B-tree インデックス" },
      ],
      ready: true,
    },
    {
      key: "data-modeling" as const,
      href: sections["data-modeling"].path,
      title: sections["data-modeling"].label,
      lead: "関数従属性と正規化を、辞書的な定義と静的な図解で体系的に整理する。",
      bullets: [
        "関数従属で正規化を判定",
        "1NF → 2NF → 3NF の手続き",
        "非正規化の実務判断",
      ],
      links: [
        { href: "/data-modeling/normalization/why", label: "なぜ正規化が必要か" },
        { href: "/data-modeling/normalization/functional-dependency", label: "関数従属性" },
      ],
      ready: DATA_MODELING_READY,
    },
  ];

  return (
    <section id="pillars" className="scroll-mt-16 border-b border-[var(--border)]">
      <Container size="wide" className="py-16 md:py-20">
        <h2 className="mb-10 text-2xl md:text-3xl font-bold tracking-tight">
          2本の柱
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((p) => (
            <article
              key={p.key}
              className="border border-[var(--border)] p-6 md:p-8 flex flex-col"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                {p.key === "rdb-index" ? "SERIES 01" : "SERIES 02"}
              </div>
              <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight">
                {p.title}
                {!p.ready && (
                  <span className="ml-2 text-xs font-bold text-[var(--muted-foreground)]">
                    (近日公開)
                  </span>
                )}
              </h3>
              <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
                {p.lead}
              </p>
              <ul className="mt-5 space-y-1.5 text-sm">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-[var(--muted-foreground)]">—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex-1" />
              {p.ready ? (
                <>
                  <Link
                    href={p.href}
                    className="mt-6 inline-flex items-center gap-2 bg-[var(--foreground)] text-white px-5 py-2.5 text-sm font-bold hover:bg-[#262626] self-start"
                  >
                    このシリーズを見る →
                  </Link>
                  <ul className="mt-5 space-y-1 text-sm text-[var(--muted-foreground)]">
                    {p.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="hover:text-[var(--foreground)] hover:underline underline-offset-4"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <span
                  aria-disabled="true"
                  className="mt-6 inline-flex items-center gap-2 border border-[var(--border)] px-5 py-2.5 text-sm font-bold text-[var(--muted-foreground)] self-start cursor-not-allowed"
                >
                  準備中
                </span>
              )}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function WhyThisSite() {
  const features = [
    {
      title: "定義から入る",
      body: "各トピックの冒頭に、辞書レベルの厳密な定義を1文で置いています。曖昧な理解ではなく、そのまま引用できる定義から入ります。",
    },
    {
      title: "動く図解 / 静的な図解",
      body: "インデックス側はインタラクティブに値を変えて確かめられ、正規化側は Before/After と関数従属図で構造を追えます。",
    },
    {
      title: "実務判断まで踏み込む",
      body: "何を選ぶか、いつ崩すか。教科書の先にある「現場で決める」ための材料まで扱います。個別指導への導線もあります。",
    },
  ];
  return (
    <section className="border-b border-[var(--border)]">
      <Container size="wide" className="py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          このサイトの特徴
        </h2>
        <div className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-3 md:divide-x md:divide-[var(--border)]">
          {features.map((f, i) => (
            <div key={i} className="md:px-8 first:md:pl-0 last:md:pr-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                特徴 {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 text-lg font-bold">{f.title}</div>
              <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function MentorSection() {
  return (
    <Container size="wide" className="pt-4 pb-16">
      <MentorCTA />
    </Container>
  );
}
