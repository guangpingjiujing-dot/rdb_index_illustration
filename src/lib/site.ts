export const site = {
  name: "RDBインデックス図解",
  fullName: "RDBインデックスの仕組みを動く図解で理解する",
  description:
    "B-tree、ハッシュ、クラスタ化インデックス、複合インデックス…RDBのインデックスの仕組みを図解とアニメーションで直感的に理解できるサイト。",
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
