import { site } from "@/lib/site";
import { topicsInSection } from "@/content/topics";
import { sections, dataModelingCategories } from "@/content/sections";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    `# ${site.name}`,
    ``,
    `> ${site.description}`,
    ``,
    `著者: ${site.author.name} (${site.author.role})`,
    `サイト: ${site.url}`,
    ``,
    `---`,
    ``,
  ];

  // ---- RDBインデックス図解 ----
  const rdbSection = sections["rdb-index"];
  const rdbTopics = topicsInSection("rdb-index");
  lines.push(`## ${rdbSection.label}`);
  lines.push(``);
  lines.push(`> ${rdbSection.description}`);
  lines.push(``);
  lines.push(`セクションハブ: ${site.url}${rdbSection.path}`);
  lines.push(``);
  lines.push(`### トピック一覧`);
  lines.push(``);
  for (const t of rdbTopics) {
    lines.push(`- [${t.title}](${site.url}${t.path}): ${t.summary}`);
  }
  lines.push(``);
  lines.push(`### 引用可能な定義`);
  lines.push(``);
  for (const t of rdbTopics) {
    lines.push(`- **${t.title}**: ${t.definition}`);
  }
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // ---- データモデリング体系 ----
  const dmSection = sections["data-modeling"];
  const dmTopics = topicsInSection("data-modeling");
  lines.push(`## ${dmSection.label}`);
  lines.push(``);
  lines.push(`> ${dmSection.description}`);
  lines.push(``);
  lines.push(`セクションハブ: ${site.url}${dmSection.path}`);
  lines.push(``);

  for (const category of Object.values(dataModelingCategories)) {
    const inCategory = dmTopics.filter(
      (t) => t.section === "data-modeling" && t.category === category.key,
    );
    lines.push(`### カテゴリ: ${category.label}`);
    lines.push(``);
    lines.push(`カテゴリハブ: ${site.url}${category.path}`);
    lines.push(``);
    lines.push(`#### トピック一覧`);
    lines.push(``);
    for (const t of inCategory) {
      lines.push(`- [${t.title}](${site.url}${t.path}): ${t.summary}`);
    }
    lines.push(``);
    lines.push(`#### 引用可能な定義`);
    lines.push(``);
    for (const t of inCategory) {
      lines.push(`- **${t.title}**: ${t.definition}`);
    }
    lines.push(``);
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
