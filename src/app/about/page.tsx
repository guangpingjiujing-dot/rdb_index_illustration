import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MentorCTA } from "@/components/cta/MentorCTA";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "著者について",
  description: `${site.author.name}のプロフィール。SQL・データベース・クラウド・IPA試験対策を1対1で教えるオンラインエンジニア講師。`,
  alternates: { canonical: "/about" },
};

const experiences = [
  {
    title: "5年以上のWeb系実務経験",
    body: "自社開発企業でバックエンド・データエンジニア・クラウド設計を担当。",
  },
  {
    title: "SQL・データベース設計が専門",
    body: "PostgreSQL / MySQL / BigQuery / Redshift 等を実務で運用。dbt・Airflowなどのデータ基盤も構築。",
  },
  {
    title: "AWS認定全冠",
    body: "AWS認定資格を全て取得。クラウドインフラ〜サーバーレスまでカバー。",
  },
  {
    title: "IPAデータベーススペシャリスト ほか",
    body: "IPAデータベーススペシャリスト、応用情報技術者ほか多数の資格を保有。",
  },
];

const plans = [
  {
    title: "月額プラン（共通）",
    description:
      "個人の希望に合わせてSQL、データベース、クラウド、資格対策など柔軟に対応。まずは無料相談から。",
  },
  {
    title: "データベース特化プラン",
    description:
      "SQL基礎〜応用、データベース設計、パフォーマンスチューニング、データパイプライン構築まで。",
  },
  {
    title: "IPAデータベーススペシャリスト対策",
    description:
      "試験範囲の体系学習、過去問解説、記述式・午後II対策まで実務者視点で。",
  },
];

export default function AboutPage() {
  return (
    <Container size="narrow" className="py-12 md:py-16">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
        著者について
      </div>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
        {site.author.name}
      </h1>
      <div className="mt-2 text-[var(--muted-foreground)]">
        {site.author.role}
      </div>

      <p className="mt-8 leading-relaxed">{site.author.bio}</p>
      <p className="mt-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
        話しやすいと言われることが多く、生徒の希望・レベルに合わせて内容をカスタマイズします。
        現在10名前後の生徒がSQL・DB・クラウド・資格対策を学習中。
      </p>

      <h2 className="mt-16 text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
        実績・強み
      </h2>
      <ul className="mt-4 border-y border-[var(--border)] divide-y divide-[var(--border)]">
        {experiences.map((e) => (
          <li key={e.title} className="py-4">
            <div className="font-bold">{e.title}</div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)] leading-relaxed">
              {e.body}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-16 text-xs font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
        提供プラン
      </h2>
      <ul className="mt-4 border-y border-[var(--border)] divide-y divide-[var(--border)]">
        {plans.map((p) => (
          <li key={p.title} className="py-4">
            <div className="font-bold">{p.title}</div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)] leading-relaxed">
              {p.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-sm">
        <Link
          href={site.author.mentorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:no-underline"
        >
          プラン詳細と申込みはこちら →
        </Link>
      </div>

      <MentorCTA />
    </Container>
  );
}
