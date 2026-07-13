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
    ];
  },
};

export default nextConfig;
