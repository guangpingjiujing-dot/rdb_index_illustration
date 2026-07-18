import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "変なER図｜あなたには、この間取りの異常さがわかりますか？";

/**
 * 旗艦ページ専用 OG 画像。
 *
 * Satori (next/og) は SVG の <text> ノードを未サポートのため、
 * 全ての文字は HTML div として描画する。ER 図のパーツ (箱・線) は
 * div の flex/absolute positioning で組む。
 */
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        {/* 左半分: ミニ ER 図 */}
        <div
          style={{
            width: 560,
            height: "100%",
            display: "flex",
            position: "relative",
            background: "#f2f2f0",
            borderRight: "1px solid #d9d9d5",
          }}
        >
          {/* 配偶者 (弱、変) — 左上 */}
          <MiniEntity
            style={{ left: 40, top: 30 }}
            label="配偶者"
            attrs={["配偶者ID"]}
            weak
            highlight
          />
          {/* 共用設備 — 右上 */}
          <MiniEntity
            style={{ left: 320, top: 30 }}
            label="共用設備"
            attrs={["設備ID"]}
          />
          {/* 入居者 (属性破綻、変) — 中央左 */}
          <MiniEntity
            style={{ left: 40, top: 200 }}
            label="入居者"
            attrs={["入居者ID", "家賃履歴JSON", "全部屋番号", "血液型"]}
            highlight
          />
          {/* 部屋 — 中央右 */}
          <MiniEntity
            style={{ left: 320, top: 220 }}
            label="部屋"
            attrs={["部屋ID", "家賃"]}
          />
          {/* オレンジバッジ (9) */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: 28,
              background: "#e07a3c",
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            9
          </div>
          {/* オレンジの "住む" 変な線 */}
          <div
            style={{
              position: "absolute",
              top: 250,
              left: 220,
              width: 100,
              height: 4,
              background: "#e07a3c",
              display: "flex",
            }}
          />
          {/* オレンジの "利用" 変な N:M 線 */}
          <div
            style={{
              position: "absolute",
              top: 100,
              left: 180,
              width: 200,
              height: 4,
              background: "#e07a3c",
              transform: "rotate(-25deg)",
              transformOrigin: "left center",
              display: "flex",
            }}
          />
          {/* フッター */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 40,
              fontSize: 14,
              color: "#6b6b68",
              letterSpacing: 2,
              display: "flex",
            }}
          >
            シェアハウス「たいてっく荘」運営システム
          </div>
        </div>

        {/* 右半分: タイトル */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#e07a3c",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 6,
              marginBottom: 20,
            }}
          >
            変な家 オマージュ企画
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#0a0a0a",
              letterSpacing: -1,
            }}
          >
            変なER図
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.4,
              color: "#0a0a0a",
              marginTop: 32,
            }}
          >
            あなたには、この間取りの
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.4,
              color: "#0a0a0a",
            }}
          >
            異常さがわかりますか？
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#6b6b68",
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid #d9d9d5",
            }}
          >
            9 つの違和感、全て指摘できますか？
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              color: "#6b6b68",
              marginTop: "auto",
              letterSpacing: 3,
            }}
          >
            taitech.dev / データモデリング体系 / ER図
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

function MiniEntity({
  style,
  label,
  attrs,
  weak,
  highlight,
}: {
  style: React.CSSProperties;
  label: string;
  attrs: string[];
  weak?: boolean;
  highlight?: boolean;
}) {
  const strokeColor = highlight ? "#e07a3c" : "#0a0a0a";
  const strokeWidth = highlight ? 3 : 2;
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    width: 200,
    background: "#ffffff",
    border: `${strokeWidth}px solid ${strokeColor}`,
    display: "flex",
    flexDirection: "column",
    padding: weak ? 4 : 0,
  };
  if (weak) {
    baseStyle.boxShadow = `inset 0 0 0 ${strokeWidth}px ${strokeColor}, inset 0 0 0 ${strokeWidth * 2}px #ffffff`;
  }
  return (
    <div style={{ ...baseStyle, ...style }}>
      <div
        style={{
          display: "flex",
          padding: "8px 12px",
          fontSize: 18,
          fontWeight: 700,
          color: "#0a0a0a",
          justifyContent: "center",
          borderBottom: "1px solid #d9d9d5",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "6px 12px" }}>
        {attrs.map((a) => (
          <div
            key={a}
            style={{
              display: "flex",
              fontSize: 12,
              color: "#0a0a0a",
              fontFamily: "monospace",
              lineHeight: 1.6,
            }}
          >
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}
