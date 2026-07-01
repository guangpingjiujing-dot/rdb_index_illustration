import { site } from "@/lib/site";
import { findTopic } from "@/content/topics";

export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "ja-JP",
    author: {
      "@type": "Person",
      name: site.author.name,
      description: site.author.bio,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function TopicJsonLd({
  slug,
  faq,
}: {
  slug: string;
  faq?: { q: string; a: string }[];
}) {
  const topic = findTopic(slug);
  if (!topic) return null;
  const data: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: topic.title,
      description: topic.summary,
      inLanguage: "ja-JP",
      author: { "@type": "Person", name: site.author.name },
      publisher: { "@type": "Organization", name: site.name },
      mainEntityOfPage: `${site.url}${topic.path}`,
      keywords: topic.keywords.join(", "),
      abstract: topic.definition,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "トップ",
          item: site.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: topic.shortTitle,
          item: `${site.url}${topic.path}`,
        },
      ],
    },
  ];
  if (faq && faq.length > 0) {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    });
  }
  return (
    <>
      {data.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
