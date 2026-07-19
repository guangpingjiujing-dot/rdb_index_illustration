import { site } from "@/lib/site";

export type SectionKey = "rdb-index" | "data-modeling";

export type Section = {
  key: SectionKey;
  label: string;
  shortLabel: string;
  path: string;
  description: string;
  ogImageAlt: string;
};

export const sections: Record<SectionKey, Section> = {
  "rdb-index": {
    key: "rdb-index",
    label: "RDBインデックス図解",
    shortLabel: "RDBインデックス図解",
    path: "/rdb-index",
    description:
      "B-tree、ハッシュ、クラスタ化、複合インデックスなど、RDBのインデックスの仕組みを図解で理解するセクション。",
    ogImageAlt: "RDBインデックス図解",
  },
  "data-modeling": {
    key: "data-modeling",
    label: "データモデリング体系",
    shortLabel: "データモデリング体系",
    path: "/data-modeling",
    description:
      "関数従属性と正規化を中心に、リレーショナルデータベースの設計体系を厳密な定義と図解で整理するセクション。",
    ogImageAlt: "データモデリング体系",
  },
};

export type DataModelingCategoryKey = "er-diagram" | "normalization";

export type DataModelingCategory = {
  key: DataModelingCategoryKey;
  label: string;
  path: string;
  description: string;
};

export const dataModelingCategories: Record<DataModelingCategoryKey, DataModelingCategory> = {
  normalization: {
    key: "normalization",
    label: "正規化",
    path: "/data-modeling/normalization",
    description:
      "更新時異常を排除するためにテーブルを関数従属性に基づいて分割する、正規化の基礎から実務判断まで。",
  },
  "er-diagram": {
    key: "er-diagram",
    label: "ER図",
    path: "/data-modeling/er-diagram",
    description:
      "エンティティ・関連・カーディナリティ・弱エンティティなど ER 図の基礎を、身近な例と静的な図解で理解するカテゴリ。旗艦ページ「変なER図」で 9 つの違和感の謎解きから入る。",
  },
};

export function sectionUrl(key: SectionKey): string {
  return `${site.url}${sections[key].path}`;
}
