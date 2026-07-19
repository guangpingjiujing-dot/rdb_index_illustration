import {
  ERDiagram,
  type EREntity,
  type ERRelationship,
} from "@/components/viz/er/ERDiagram";

/**
 * 「変なER図」旗艦ページの Hero に置く SVG。
 *
 * 架空 EC サイト「たいてっくストア」運営システムをモチーフに、9 つの意図的な違和感を仕込む。
 * highlightIds でハイライトする違和感箇所を制御する (答え合わせモードで全 ON)。
 */

export const WEIRD_ENTITY_IDS = {
  ADDRESS: "address", // 配送先 — #3 独立主キー、親なし
  CATEGORY: "category", // カテゴリ — #7 循環一方
  PRODUCT: "product", // 商品 — #2/#9 の相手側
  CUSTOMER: "customer", // 顧客 — #5 属性欄破綻、#1/#6/#8 の主体
  ORDER: "order", // 注文 — #1/#6/#8 の相手
  REVIEW: "review", // レビュー — #9 記法混在
  SUBCATEGORY: "subcategory", // サブカテゴリ — #7 循環もう一方
  ORDER_LINE: "order_line", // 注文明細 — #4 識別関係だが PK 非継承
} as const;

export const WEIRD_REL_IDS = {
  PLACE: "rel-place", // #1 カーディナリティ矛盾, #6 役割名重複, #8 参加制約矛盾
  CONFIRM: "rel-confirm", // #6 役割名重複 (2 本目)
  FAVORITE: "rel-favorite", // #2 多対多 中間実体なし
  HIERARCHY: "rel-hierarchy", // #7 循環参照
  LINE_OF: "rel-line-of", // #4 識別関係だが PK 非継承
  REVIEW_OF: "rel-review", // #9 記法混在 (IDEF1X)
  BELONG: "rel-belong", // 通常の関連 (商品→カテゴリ、違和感なし)
  // 配送先 (#3) は関連自体を張らないことが違和感なので rel は無し
} as const;

/** 番号バッジ用: 違和感番号 → 対象要素 id のマップ */
export const ANOMALY_TARGETS: Record<number, { entityIds?: string[]; relIds?: string[] }> = {
  1: { relIds: [WEIRD_REL_IDS.PLACE] }, // カーディナリティ 1:1 の誤用
  2: { relIds: [WEIRD_REL_IDS.FAVORITE] }, // 多対多、中間実体なし
  3: { entityIds: [WEIRD_ENTITY_IDS.ADDRESS] }, // 弱エンティティが親を持たない
  4: { entityIds: [WEIRD_ENTITY_IDS.ORDER_LINE], relIds: [WEIRD_REL_IDS.LINE_OF] }, // 識別関係だが PK 非継承
  5: { entityIds: [WEIRD_ENTITY_IDS.CUSTOMER] }, // 属性の粒度破綻 (1NF違反)
  6: { relIds: [WEIRD_REL_IDS.PLACE, WEIRD_REL_IDS.CONFIRM] }, // 関連の役割名重複
  7: {
    entityIds: [WEIRD_ENTITY_IDS.SUBCATEGORY],
    relIds: [WEIRD_REL_IDS.HIERARCHY],
  }, // 循環参照
  8: { relIds: [WEIRD_REL_IDS.PLACE] }, // 参加制約矛盾
  9: { relIds: [WEIRD_REL_IDS.REVIEW_OF] }, // 記法混在 (IDEF1X)
};

function buildEntities(highlightIds: Set<string>, badges: Map<string, number>): EREntity[] {
  return [
    // 配送先 - #3 独立主キーで親なし。左下に配置して孤立感を出す
    {
      id: WEIRD_ENTITY_IDS.ADDRESS,
      label: "配送先",
      x: 60,
      y: 580,
      width: 180,
      attributes: ["配送先ID", "郵便番号", "住所"],
      primaryKey: ["配送先ID"],
      isWeak: true,
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.ADDRESS),
      badge: badges.get(WEIRD_ENTITY_IDS.ADDRESS),
    },
    // カテゴリ - #7 循環の一方
    {
      id: WEIRD_ENTITY_IDS.CATEGORY,
      label: "カテゴリ",
      x: 460,
      y: 40,
      width: 180,
      attributes: ["カテゴリID", "名称", "サブカテゴリID"],
      primaryKey: ["カテゴリID"],
      highlighted: false,
    },
    // 商品
    {
      id: WEIRD_ENTITY_IDS.PRODUCT,
      label: "商品",
      x: 960,
      y: 40,
      width: 180,
      attributes: ["商品ID", "商品名", "価格", "カテゴリID"],
      primaryKey: ["商品ID"],
      highlighted: false,
    },
    // 顧客 - #5 属性欄破綻
    {
      id: WEIRD_ENTITY_IDS.CUSTOMER,
      label: "顧客",
      x: 60,
      y: 300,
      width: 220,
      attributes: [
        "顧客ID",
        "氏名",
        "注文履歴JSON",
        "カート内商品ID配列",
        "レビュー全て",
        "血液型",
      ],
      primaryKey: ["顧客ID"],
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.CUSTOMER),
      badge: badges.get(WEIRD_ENTITY_IDS.CUSTOMER),
    },
    // 注文 - 発注/確定 2 本の平行線用に属性 3 個 + 空白 2 行分の余裕を確保
    {
      id: WEIRD_ENTITY_IDS.ORDER,
      label: "注文",
      x: 460,
      y: 300,
      width: 180,
      height: 142,
      attributes: ["注文ID", "注文日", "顧客ID"],
      primaryKey: ["注文ID"],
      highlighted: false,
    },
    // レビュー - #9 記法混在。商品 (右上) の右下にずらして配置。
    // 商品と同一 x に置くと 対象線 (I 型 x=1050) と 購入線 (L の垂直区間 x=1050) が
    // 完全に重なるので、x を 200 右にずらして 対象線を L 字化し重なりを回避する。
    {
      id: WEIRD_ENTITY_IDS.REVIEW,
      label: "レビュー",
      x: 1160,
      y: 580,
      width: 180,
      attributes: ["レビューID", "評価", "本文"],
      primaryKey: ["レビューID"],
      highlighted: false,
    },
    // サブカテゴリ - #7 循環のもう一方 (実質カテゴリと同じ)。
    // カテゴリの左隣 (y=40) に置いて 階層線を水平直線にする。
    {
      id: WEIRD_ENTITY_IDS.SUBCATEGORY,
      label: "サブカテゴリ",
      x: 60,
      y: 40,
      width: 180,
      attributes: ["サブカテゴリID", "名称", "親カテゴリID"],
      primaryKey: ["サブカテゴリID"],
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.SUBCATEGORY),
      badge: badges.get(WEIRD_ENTITY_IDS.SUBCATEGORY),
    },
    // 注文明細 - #4 弱っぽく描いてるが PK 独立
    {
      id: WEIRD_ENTITY_IDS.ORDER_LINE,
      label: "注文明細",
      x: 460,
      y: 580,
      width: 180,
      attributes: ["明細ID", "商品名", "数量"],
      primaryKey: ["明細ID"],
      isWeak: true, // 弱として描画 → PK 独立との矛盾
      highlighted: highlightIds.has(WEIRD_ENTITY_IDS.ORDER_LINE),
      badge: badges.get(WEIRD_ENTITY_IDS.ORDER_LINE),
    },
  ];
}

function buildRelationships(highlightIds: Set<string>, badges: Map<string, number>): ERRelationship[] {
  return [
    // #1 + #6 + #8: 顧客 —発注— 注文 の 1:0..1 (実質 1:1 固定) + 参加制約矛盾
    // 注文側を "zero-one" にすることで縦棒+円 (|○) を実際に描画し、
    // 「必須と任意の記号が同居している」という #8 の違和感を視覚化する。
    {
      id: WEIRD_REL_IDS.PLACE,
      from: WEIRD_ENTITY_IDS.CUSTOMER,
      to: WEIRD_ENTITY_IDS.ORDER,
      fromCardinality: "one", // 顧客側は | のみ (max=min=1)
      toCardinality: "zero-one", // 注文側は |○ = max=1, min=0 → #8 の視覚的違和感の材料
      label: "発注",
      highlighted: highlightIds.has(WEIRD_REL_IDS.PLACE),
      badge: badges.get(WEIRD_REL_IDS.PLACE),
    },
    // #6: 別線の「確定」— 「発注」とほぼ同じ意味で読み手には区別不能
    {
      id: WEIRD_REL_IDS.CONFIRM,
      from: WEIRD_ENTITY_IDS.CUSTOMER,
      to: WEIRD_ENTITY_IDS.ORDER,
      fromCardinality: "one-many",
      toCardinality: "one",
      label: "確定",
      dashed: true,
      highlighted: highlightIds.has(WEIRD_REL_IDS.CONFIRM),
      badge: badges.get(WEIRD_REL_IDS.CONFIRM),
    },
    // #2: 顧客 ⟷ 商品 が直接 N:M (別途 注文明細 が存在するのに迂回してない)。
    // 自動ルーティングで 顧客 right → 水平 → 商品 bottom の L 字。
    // (routingHint="vertical" は 配送先/カテゴリ を貫通するため使わない。
    // 現状の水平優先ルーティングは 注文 box を通るが白 fill で隠れる。)
    {
      id: WEIRD_REL_IDS.FAVORITE,
      from: WEIRD_ENTITY_IDS.CUSTOMER,
      to: WEIRD_ENTITY_IDS.PRODUCT,
      fromCardinality: "zero-many",
      toCardinality: "zero-many",
      label: "購入",
      highlighted: highlightIds.has(WEIRD_REL_IDS.FAVORITE),
      badge: badges.get(WEIRD_REL_IDS.FAVORITE),
    },
    // #7: カテゴリ ⇔ サブカテゴリ の相互参照 (自己参照にすべきを別エンティティに分けて循環)
    {
      id: WEIRD_REL_IDS.HIERARCHY,
      from: WEIRD_ENTITY_IDS.CATEGORY,
      to: WEIRD_ENTITY_IDS.SUBCATEGORY,
      fromCardinality: "one-many",
      toCardinality: "one-many",
      label: "階層",
      highlighted: highlightIds.has(WEIRD_REL_IDS.HIERARCHY),
      badge: badges.get(WEIRD_REL_IDS.HIERARCHY),
    },
    // 通常の関連: 商品 → カテゴリ
    {
      id: WEIRD_REL_IDS.BELONG,
      from: WEIRD_ENTITY_IDS.PRODUCT,
      to: WEIRD_ENTITY_IDS.CATEGORY,
      fromCardinality: "one-many",
      toCardinality: "one",
      label: "所属",
      highlighted: false,
    },
    // #4: 注文 —明細— 注文明細 (識別関係のはずが PK 継承なし)
    {
      id: WEIRD_REL_IDS.LINE_OF,
      from: WEIRD_ENTITY_IDS.ORDER,
      to: WEIRD_ENTITY_IDS.ORDER_LINE,
      fromCardinality: "one",
      toCardinality: "one-many",
      label: "明細",
      isIdentifying: true,
      highlighted: highlightIds.has(WEIRD_REL_IDS.LINE_OF),
      badge: badges.get(WEIRD_REL_IDS.LINE_OF),
    },
    // #9: 商品 — レビュー だけ IDEF1X 記法 (● / P) で描く。
    // routingHint="horizontal" で 商品 right → 水平 → 下 → レビュー top の L 字にする。
    // (未指定だと垂直ドミナントになり、縦区間が商品 cx=1050 から出て 購入線の縦区間と重なる)
    {
      id: WEIRD_REL_IDS.REVIEW_OF,
      from: WEIRD_ENTITY_IDS.PRODUCT,
      to: WEIRD_ENTITY_IDS.REVIEW,
      fromCardinality: "one",
      toCardinality: "one-many",
      label: "対象",
      notation: "idef1x",
      routingHint: "horizontal",
      highlighted: highlightIds.has(WEIRD_REL_IDS.REVIEW_OF),
      badge: badges.get(WEIRD_REL_IDS.REVIEW_OF),
    },
  ];
}

/** highlightAnomalies: 表示中の違和感番号のセット (1..9)。空なら通常表示 */
export function WeirdERDiagram({
  highlightAnomalies = new Set<number>(),
  title = "架空 EC サイト運営システム ER 図",
  caption,
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
      width={1400}
      height={780}
      notation="ie"
    />
  );
}
