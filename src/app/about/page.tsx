import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MentorCTA } from "@/components/cta/MentorCTA";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "著者について",
  description: `${site.author.name}のプロフィール。SQL・データベース・クラウド・AI活用・IPA試験対策を1対1で教えるオンラインエンジニア講師。`,
  alternates: { canonical: "/about" },
};

const experiences = [
  {
    title: "6年以上のWeb系実務経験・現役エンジニア",
    body: "自社開発企業でバックエンド・データエンジニア・クラウド設計を担当。",
  },
  {
    title: "SQL・データベース設計・データ分析基盤とそのパイプライン開発と運用・データガバナンスが専門",
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
  {
    title: "AIエージェント自作 / AIプロダクト開発",
    body: "LLM を組み込んだプロダクトの設計・実装経験に加え、業務要件に合わせて AI エージェントを自ら作れる。Claude Code など既製エージェントを使いこなす立場と、内部を理解して作る立場の両方を持つ。当サイトも AI エージェントとの協働で構築。",
  },
];

const techStack = [
  {
    category: "クラウド",
    items: "AWS / GCP / Azure",
  },
  {
    category: "データベース・DWH",
    items: "PostgreSQL / MySQL / SQL Server / DuckDB / MongoDB / Supabase / Neon / BigQuery / Amazon RDS / Athena / Azure SQL Database / Treasure Data / Microsoft Access",
  },
  {
    category: "データ基盤・ETL/ELT・可視化",
    items: "dbt / Digdag / Dagster / Airflow / Redash / Lightdash / Evidence / Superset",
  },
  {
    category: "言語",
    items: "Python / SQL / Java / TypeScript",
  },
  {
    category: "AI・AI Agent",
    items: "Claude Code / Codex / Cursor / Google ADK / RAG / LangChain / Langfuse",
  },
  {
    category: "その他",
    items: "Power Platform / Apache Tomcat",
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
    title: "IPA・AWS試験対策",
    description:
      "試験範囲の体系学習、過去問解説、記述式・午後II対策まで実務者視点で。",
  },
  {
    title: "AIエージェント開発 / AIプロダクト開発",
    description:
      "LLM API を使ったプロダクト設計、AI エージェントの自作、Claude Code など既製エージェントの実務導入まで。「使う側」で止まらず「作る側」に回りたいエンジニア向け。",
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
        生徒の希望・レベルに合わせて内容をカスタマイズします。
        今まで数多くの生徒のSQL・DB・クラウド・開発・資格対策学習をサポート。
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
        技術スタック
      </h2>
      <ul className="mt-4 border-y border-[var(--border)] divide-y divide-[var(--border)]">
        {techStack.map((t) => (
          <li key={t.category} className="py-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {t.category}
            </div>
            <p className="mt-1 leading-relaxed">{t.items}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
        DX 推進、データ分析基盤の構築・運用、業務システム開発、可視化ツール開発など、複数プロジェクトで運用してきた技術群。
      </p>

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
