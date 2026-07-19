import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.taitech.dev" }],
        destination: "https://taitech.dev/:path*",
        permanent: true,
      },
      // 2026-07-20: 「識別関係」ページを「弱エンティティ」に統合。
      // 旧 URL は GSC 履歴・外部リンクのために 308 で新 URL に流す。
      {
        source: "/data-modeling/er-diagram/identifying",
        destination: "/data-modeling/er-diagram/weak-entity",
        permanent: true,
      },
      // 2026-07-20: 「読み方チェックリスト」ページを削除し、旗艦ページの末尾に
      // コピペテンプレートとして吸収。旧 URL は旗艦へ流す。
      {
        source: "/data-modeling/er-diagram/reading",
        destination: "/data-modeling/er-diagram",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
