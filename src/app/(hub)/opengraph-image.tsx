import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.fullName;

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 88px",
          background: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#6b6b68",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          taitech.dev
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#0a0a0a",
            display: "flex",
          }}
        >
          {site.author.name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#6b6b68",
            display: "flex",
          }}
        >
          {site.author.role}
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 20,
            color: "#6b6b68",
            display: "flex",
            borderTop: "1px solid #d9d9d5",
            paddingTop: 24,
          }}
        >
          SQL · データベース · クラウド · AI活用 — 個別指導
        </div>
      </div>
    ),
    { ...size }
  );
}
