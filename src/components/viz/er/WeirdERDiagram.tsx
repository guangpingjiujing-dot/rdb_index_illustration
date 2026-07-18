import {
  ERDiagram,
  type EREntity,
  type ERRelationship,
} from "@/components/viz/er/ERDiagram";

/**
 * 「変なER図」旗艦ページの Hero に置く SVG。
 *
 * シェアハウス「たいてっく荘」運営システムをモチーフに、9 つの意図的な違和感を仕込む。
 * highlightIds でハイライトする違和感箇所を制御する (答え合わせモードで全 ON)。
 */

export const WEIRD_ENTITY_IDS = {
  TENANT: "tenant",
  ROOM: "room",
  SPOUSE: "spouse",
  FACILITY: "facility",
  GUARANTOR: "guarantor",
  PAYMENT: "payment",
  CONTRACT: "contract",
} as const;

export const WEIRD_REL_IDS = {
  LIVE: "rel-live", // #1 カーディナリティ矛盾, #6 役割名重複, #8 参加制約矛盾
  BELONG: "rel-belong", // #6 役割名重複
  USE: "rel-use", // #2 多対多 中間実体なし
  GUARANTEE: "rel-guarantee", // #7 循環参照 (自己参照)
  PAYMENT_OF: "rel-payment", // #4 識別関係だが PK 非継承
  CONTRACT_OF: "rel-contract", // #9 記法混在 (IDEF1X)
  // 配偶者 (#3) は関連自体を張らないことが違和感なので rel は無し
} as const;

/** 番号バッジ用: 違和感番号 → 対象要素 id のマップ */
export const ANOMALY_TARGETS: Record<number, { entityIds?: string[]; relIds?: string[] }> = {
  1: { relIds: [WEIRD_REL_IDS.LIVE] }, // カーディナリティ 1:1 の誤用
  2: { relIds: [WEIRD_REL_IDS.USE] }, // 多対多、中間実体なし
  3: { entityIds: [WEIRD_ENTITY_IDS.SPOUSE] }, // 弱エンティティが親を持たない
  4: { entityIds: [WEIRD_ENTITY_IDS.PAYMENT], relIds: [WEIRD_REL_IDS.PAYMENT_OF] }, // 識別関係だが PK 非継承
  5: { entityIds: [WEIRD_ENTITY_IDS.TENANT] }, // 属性の粒度破綻 (1NF違反)
  6: { relIds: [WEIRD_REL_IDS.BELONG, WEIRD_REL_IDS.LIVE] }, // 関連の役割名重複
  7: { entityIds: [WEIRD_ENTITY_IDS.GUARANTOR], relIds: [WEIRD_REL_IDS.GUARANTEE] }, // 循環参照
  8: { relIds: [WEIRD_REL_IDS.LIVE] }, // 参加制約矛盾
  9: { relIds: [WEIRD_REL_IDS.CONTRACT_OF] }, // 記法混在 (IDEF1X)
};

function buildEntities(highlightIds: Set<string>, badges: Map<string, number>): EREntity[] {
  return [
    // 配偶者 - #3 独立主キーで親なし (二重四角なのに親エンティティと繋がらない)
    {
      id: WEIRD_ENTITY_IDS.SPOUSE,
      label: "配偶者",
      x: 60,
      y: 40,
      width: 180,
      attributes: ["配偶者ID", "名前"],
      primaryKey: ["配偶者ID"],
      isWeak: true,
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.SPOUSE),
      badge: badges.get(WEIRD_ENTITY_IDS.SPOUSE),
    },
    // 共用設備
    {
      id: WEIRD_ENTITY_IDS.FACILITY,
      label: "共用設備",
      x: 960,
      y: 40,
      width: 180,
      attributes: ["設備ID", "設備名"],
      primaryKey: ["設備ID"],
      highlighted: false,
    },
    // 入居者 - #5 属性欄破綻
    {
      id: WEIRD_ENTITY_IDS.TENANT,
      label: "入居者",
      x: 60,
      y: 280,
      width: 220,
      attributes: [
        "入居者ID",
        "名前",
        "家賃履歴JSON",
        "全部屋番号",
        "血液型",
        "保証人情報",
      ],
      primaryKey: ["入居者ID"],
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.TENANT),
      badge: badges.get(WEIRD_ENTITY_IDS.TENANT),
    },
    // 部屋
    {
      id: WEIRD_ENTITY_IDS.ROOM,
      label: "部屋",
      x: 620,
      y: 300,
      width: 180,
      attributes: ["部屋ID", "部屋名", "家賃"],
      primaryKey: ["部屋ID"],
      highlighted: false,
    },
    // 保証人 - #7 循環参照
    {
      id: WEIRD_ENTITY_IDS.GUARANTOR,
      label: "保証人",
      x: 60,
      y: 560,
      width: 180,
      attributes: ["保証人ID", "名前", "保証対象入居者ID"],
      primaryKey: ["保証人ID"],
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.GUARANTOR),
      badge: badges.get(WEIRD_ENTITY_IDS.GUARANTOR),
    },
    // 家賃履歴 - #4 弱っぽく描いてるが PK 独立
    {
      id: WEIRD_ENTITY_IDS.PAYMENT,
      label: "家賃履歴",
      x: 620,
      y: 560,
      width: 180,
      attributes: ["履歴ID", "支払日", "金額"],
      primaryKey: ["履歴ID"],
      isWeak: true, // 弱として描画 → 二重四角
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.PAYMENT),
      badge: badges.get(WEIRD_ENTITY_IDS.PAYMENT),
    },
    // 契約書 - #9 記法混在
    {
      id: WEIRD_ENTITY_IDS.CONTRACT,
      label: "契約書",
      x: 960,
      y: 560,
      width: 180,
      attributes: ["契約ID", "契約日"],
      primaryKey: ["契約ID"],
      highlighted: false,
    },
  ];
}

function buildRelationships(highlightIds: Set<string>, badges: Map<string, number>): ERRelationship[] {
  return [
    // #1 + #6 + #8: 入居者 —住む— 部屋 の 1:1 固定 + 役割名が同じエンティティ間に 2 本
    {
      id: WEIRD_REL_IDS.LIVE,
      from: WEIRD_ENTITY_IDS.TENANT,
      to: WEIRD_ENTITY_IDS.ROOM,
      fromCardinality: "one", // 1 人 1 部屋固定 (シェアハウスなのに変)
      toCardinality: "one", // 1 部屋 1 人 (シェアハウスなのに変) + 参加制約矛盾
      label: "住む",
      highlighted: highlightIds.has(WEIRD_REL_IDS.LIVE),
      badge: badges.get(WEIRD_REL_IDS.LIVE),
    },
    // #6: 別線の「所属」— 意味不明
    {
      id: WEIRD_REL_IDS.BELONG,
      from: WEIRD_ENTITY_IDS.TENANT,
      to: WEIRD_ENTITY_IDS.ROOM,
      fromCardinality: "one-many",
      toCardinality: "one",
      label: "所属",
      dashed: true,
      highlighted: highlightIds.has(WEIRD_REL_IDS.BELONG),
      badge: badges.get(WEIRD_REL_IDS.BELONG),
    },
    // #2: 入居者 ⟷ 共用設備 が直接 N:M
    {
      id: WEIRD_REL_IDS.USE,
      from: WEIRD_ENTITY_IDS.TENANT,
      to: WEIRD_ENTITY_IDS.FACILITY,
      fromCardinality: "zero-many",
      toCardinality: "zero-many",
      label: "利用",
      highlighted: highlightIds.has(WEIRD_REL_IDS.USE),
      badge: badges.get(WEIRD_REL_IDS.USE),
    },
    // #7: 入居者 —保証— 保証人 (循環参照)
    {
      id: WEIRD_REL_IDS.GUARANTEE,
      from: WEIRD_ENTITY_IDS.TENANT,
      to: WEIRD_ENTITY_IDS.GUARANTOR,
      fromCardinality: "one-many",
      toCardinality: "one-many",
      label: "保証",
      highlighted: highlightIds.has(WEIRD_REL_IDS.GUARANTEE),
      badge: badges.get(WEIRD_REL_IDS.GUARANTEE),
    },
    // #4: 家賃履歴 —記録— 入居者 (二重線 = 識別関係のはずが PK 継承なし)
    {
      id: WEIRD_REL_IDS.PAYMENT_OF,
      from: WEIRD_ENTITY_IDS.TENANT,
      to: WEIRD_ENTITY_IDS.PAYMENT,
      fromCardinality: "one",
      toCardinality: "one-many",
      label: "記録",
      isIdentifying: true,
      highlighted: highlightIds.has(WEIRD_REL_IDS.PAYMENT_OF),
      badge: badges.get(WEIRD_REL_IDS.PAYMENT_OF),
    },
    // #9: 家賃履歴 —紐付く— 契約書 だけ IDEF1X 記法 (● / P) で描く
    {
      id: WEIRD_REL_IDS.CONTRACT_OF,
      from: WEIRD_ENTITY_IDS.PAYMENT,
      to: WEIRD_ENTITY_IDS.CONTRACT,
      fromCardinality: "one-many",
      toCardinality: "one",
      label: "紐付く",
      notation: "idef1x",
      highlighted: highlightIds.has(WEIRD_REL_IDS.CONTRACT_OF),
      badge: badges.get(WEIRD_REL_IDS.CONTRACT_OF),
    },
  ];
}

/** highlightAnomalies: 表示中の違和感番号のセット (1..9)。空なら通常表示 */
export function WeirdERDiagram({
  highlightAnomalies = new Set<number>(),
  title = "シェアハウス「たいてっく荘」運営システム ER 図",
  caption = "作: たいてっく / モデル: 架空。この ER 図には 9 つの明らかにおかしい箇所があります。",
}: {
  highlightAnomalies?: Set<number>;
  title?: string;
  caption?: string;
}) {
  const highlightIds = new Set<string>();
  const badges = new Map<string, number>();
  for (const n of highlightAnomalies) {
    const targets = ANOMALY_TARGETS[n];
    if (!targets) continue;
    for (const id of targets.entityIds ?? []) {
      highlightIds.add(id);
      // 同じ id に複数バッジが乗る場合は小さい番号を優先
      const existing = badges.get(id);
      if (existing === undefined || n < existing) badges.set(id, n);
    }
    for (const id of targets.relIds ?? []) {
      highlightIds.add(id);
      const existing = badges.get(id);
      if (existing === undefined || n < existing) badges.set(id, n);
    }
  }
  const entities = buildEntities(highlightIds, badges);
  const relationships = buildRelationships(highlightIds, badges);
  return (
    <ERDiagram
      title={title}
      caption={caption}
      entities={entities}
      relationships={relationships}
      width={1200}
      height={780}
      notation="ie"
    />
  );
}
