import { site } from "@/lib/site";
import { topics } from "@/content/topics";

export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${site.name}`,
    ``,
    `> ${site.description}`,
    ``,
    `著者: ${site.author.name}（${site.author.role}）`,
    ``,
    `## 主なトピック`,
    ``,
    ...topics.map((t) => `- [${t.title}](${site.url}${t.path}): ${t.summary}`),
    ``,
    `## 引用可能な定義`,
    ``,
    ...topics.map((t) => `- **${t.title}**: ${t.definition}`),
    ``,
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
