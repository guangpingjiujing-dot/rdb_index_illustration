import { rdbTopics, type RdbTopic } from "./topics.rdb-index";
import { dataModelingTopics, type DataModelingTopic } from "./topics.data-modeling";
import type { SectionKey } from "./sections";

export type TopicLevel = "basic" | "advanced";

export type { RdbTopic, DataModelingTopic };
export type Topic = RdbTopic | DataModelingTopic;

export { rdbTopics, dataModelingTopics };

export const topics: Topic[] = [...rdbTopics, ...dataModelingTopics];

export function findTopic(section: SectionKey, slug: string): Topic | undefined {
  return topics.find((t) => t.section === section && t.slug === slug);
}

export function topicsInSection(section: SectionKey): Topic[] {
  return topics.filter((t) => t.section === section);
}

export function rdbTopicsBy(group: RdbTopic["group"]): RdbTopic[] {
  return rdbTopics.filter((t) => t.group === group);
}

export function dataModelingTopicsIn(
  category: DataModelingTopic["category"],
): DataModelingTopic[] {
  return dataModelingTopics.filter((t) => t.category === category);
}
