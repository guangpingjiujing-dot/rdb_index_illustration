import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { sections } from "@/content/sections";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = sections["data-modeling"].ogImageAlt;

export default function OGImage() {
  const sectionMeta = sections["data-modeling"];
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
            gap: 16,
            color: "#6b6b68",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {sectionMeta.label}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.2,
            color: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>関数従属と正規化を、</div>
          <div style={{ display: "flex" }}>体系で理解する。</div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#6b6b68",
            display: "flex",
            borderTop: "1px solid #d9d9d5",
            paddingTop: 24,
          }}
        >
          関数従属 / キー / 1NF / 2NF / 3NF / 非正規化
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 20,
            color: "#6b6b68",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          by {site.author.name}（{site.author.role}）
        </div>
      </div>
    ),
    { ...size }
  );
}
