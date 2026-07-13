export const site = {
  name: "たいてっく",
  fullName: "たいてっく — RDBとデータモデリングを、動く図解と厳密な定義で。",
  description:
    "RDBインデックスの仕組みと、正規化を中心としたデータモデリングの体系を、動く図解と厳密な定義で解説するサイト。新人エンジニアからIPAデータベーススペシャリスト対策まで。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://taitech.dev",
  ogImage: "/og-default.png",
  author: {
    name: "たいてっく",
    handle: "taitech",
    role: "エンジニア講師 / データエンジニア",
    bio: "Web系自社開発企業のデータエンジニア。AWS認定全冠保持経験、IPAデータベーススペシャリスト、応用情報技術者ほかIPA系資格を多数保有。AIエージェント自作・AIプロダクト開発の実務経験もあり。個別指導でSQL・データベース・クラウド・AI活用を教えている。",
    mentorUrl: "https://menta.work/plan/17058",
  },
  contact: {
    email: "guangpingjiujing@gmail.com",
  },
} as const;

export type Site = typeof site;
