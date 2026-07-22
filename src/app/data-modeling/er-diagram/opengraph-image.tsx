import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "変なER図｜あなたには、この ER 図の異常さがわかりますか？";

/**
 * 旗艦ページ専用 OG 画像。変な ER 図の全景 PNG を丸ごとキャンバスに載せる。
 *
 * 経緯: WeirdERDiagram の SVG を Satori 経由でラスタライズしようとしたが、
 * Satori (next/og) は SVG 内の `<text>` 要素と複雑な path を安定的に扱えず、
 * 「Input buffer has corrupt header」で prerender エラーになった。
 * 代わりに事前に生成した PNG (`public/og/weird-er-diagram.png`) を読み込んで
 * `<img>` として貼り、ImageResponse でそのまま出力する。
 */
export default function OGImage() {
  const pngPath = path.join(
    process.cwd(),
    "public",
    "og",
    "weird-er-diagram.png",
  );
  const buffer = fs.readFileSync(pngPath);
  const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fafafa",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt={alt}
          width={size.width}
          height={size.height}
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
      </div>
    ),
    { ...size },
  );
}
