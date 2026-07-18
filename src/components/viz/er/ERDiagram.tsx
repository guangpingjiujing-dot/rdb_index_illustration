import { VizFrame } from "@/components/viz/VizFrame";

export type CardinalityMark =
  | "one"
  | "zero-one"
  | "one-many"
  | "zero-many"
  | "many";

export type ERNotation = "ie" | "idef1x" | "chen";

export type EREntity = {
  id: string;
  label: string;
  /** 左上座標 */
  x: number;
  y: number;
  width?: number;
  height?: number;
  attributes?: string[];
  primaryKey?: string[];
  isWeak?: boolean;
  /** ハイライト (旗艦ページの答え合わせで違和感箇所を強調) */
  highlighted?: boolean;
  /** ハイライト時に付ける番号バッジ */
  badge?: number;
};

export type ERRelationship = {
  id?: string;
  from: string;
  to: string;
  fromCardinality: CardinalityMark;
  toCardinality: CardinalityMark;
  label?: string;
  isIdentifying?: boolean;
  /** true にすると線が破線になる (非識別関係の視覚化に補助的に使う) */
  dashed?: boolean;
  highlighted?: boolean;
  badge?: number;
  /** 特定の関連だけ記法を変える (旗艦ページで「記法混在」の違和感を仕込むため) */
  notation?: ERNotation;
  /** 自己参照ループの描画側 (`right` = 右側にループ、`top` = 上側にループ、既定 `right`) */
  loopSide?: "right" | "top";
};

export type ERDiagramProps = {
  entities: EREntity[];
  relationships: ERRelationship[];
  width?: number;
  height?: number;
  title?: string;
  caption?: string;
  legend?: React.ReactNode;
  /** 全体の描画記法。個別関連の notation で上書き可能 */
  notation?: ERNotation;
};

const DEFAULT_ENTITY_WIDTH = 180;
const DEFAULT_ENTITY_HEIGHT_BASE = 44;
const ATTR_LINE_HEIGHT = 18;
const HIGHLIGHT_COLOR = "#e07a3c";
const STROKE_COLOR = "#0a0a0a";
const MUTED_COLOR = "#6b6b68";
const BG_COLOR = "#ffffff";
const WEAK_INSET = 5;
const PARALLEL_SPACING = 44; // 同一エンティティ間の複数関連の平行オフセット幅

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

function entityBox(e: EREntity) {
  const w = e.width ?? DEFAULT_ENTITY_WIDTH;
  const attrCount = e.attributes?.length ?? 0;
  const h =
    e.height ?? DEFAULT_ENTITY_HEIGHT_BASE + attrCount * ATTR_LINE_HEIGHT + (attrCount > 0 ? 8 : 0);
  return { x: e.x, y: e.y, w, h, cx: e.x + w / 2, cy: e.y + h / 2 };
}

function rectEdge(
  box: { x: number; y: number; w: number; h: number; cx: number; cy: number },
  towardX: number,
  towardY: number,
): { x: number; y: number } {
  const dx = towardX - box.cx;
  const dy = towardY - box.cy;
  if (dx === 0 && dy === 0) return { x: box.cx, y: box.cy };
  const halfW = box.w / 2;
  const halfH = box.h / 2;
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);
  return { x: box.cx + dx * scale, y: box.cy + dy * scale };
}

/**
 * カーディナリティマーカーを SVG で描画。
 *
 * ローカル座標系:
 * - 原点 (0,0) は「エンティティ辺上の、線の入口点」
 * - +x 方向 = 線に沿って対向エンティティ側 (線の内側)
 *
 * IE 記法の描画順 (エンティティ側から順に線に沿って):
 *   [エンティティ] --鳥足-- --縦棒/円-- ...線... [対向]
 * 各マーカーとエンティティ辺の間には gap を空ける。
 */
function CardinalityMarker({
  x,
  y,
  angle,
  mark,
  notation,
  color,
}: {
  x: number;
  y: number;
  angle: number;
  mark: CardinalityMark;
  notation: ERNotation;
  color: string;
}) {
  const deg = (angle * 180) / Math.PI;
  const hasMany =
    mark === "one-many" || mark === "zero-many" || mark === "many";
  const hasOne = mark === "one" || mark === "one-many";
  const hasZero = mark === "zero-one" || mark === "zero-many";

  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  if (notation === "chen") {
    const label =
      mark === "one"
        ? "1"
        : mark === "zero-one"
          ? "0,1"
          : mark === "one-many"
            ? "1,N"
            : mark === "zero-many"
              ? "0,N"
              : "N";
    // ラベルはエンティティ端から線方向に 22 単位入った位置、水平表示
    const lx = x + dx * 22;
    const ly = y + dy * 22;
    const w = label.length * 10 + 8;
    return (
      <g>
        <rect x={lx - w / 2} y={ly - 10} width={w} height={20} fill={BG_COLOR} />
        <text
          x={lx}
          y={ly + 5}
          textAnchor="middle"
          fontSize="14"
          fontFamily="monospace"
          fontWeight="700"
          fill={color}
        >
          {label}
        </text>
      </g>
    );
  }

  if (notation === "idef1x") {
    // 円は線に沿って エンティティ端から 18 単位、ラベル文字はさらに 14 単位先
    const cx = x + dx * 18;
    const cy = y + dy * 18;
    const lx = x + dx * 34;
    const ly = y + dy * 34;
    return (
      <g>
        {mark === "one" && (
          <circle cx={cx} cy={cy} r={6} fill={color} stroke={color} strokeWidth={1.4} />
        )}
        {mark === "zero-one" && (
          <>
            <circle cx={cx} cy={cy} r={6} fill={BG_COLOR} stroke={color} strokeWidth={1.4} />
            <text x={lx} y={ly + 5} textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="700" fill={color}>Z</text>
          </>
        )}
        {mark === "one-many" && (
          <>
            <circle cx={cx} cy={cy} r={6} fill={color} />
            <text x={lx} y={ly + 5} textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="700" fill={color}>P</text>
          </>
        )}
        {mark === "zero-many" && (
          <>
            <circle cx={cx} cy={cy} r={6} fill={BG_COLOR} stroke={color} strokeWidth={1.4} />
            <text x={lx} y={ly + 5} textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="700" fill={color}>M</text>
          </>
        )}
        {mark === "many" && (
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="700" fill={color}>N</text>
        )}
      </g>
    );
  }

  // IE (crow's foot) 記法
  //
  // 規則 (Wikipedia / Vertabelo / dbdiagram 等の標準):
  //   エンティティに **近い** 側 = 最大基数 (max cardinality)
  //   エンティティから **遠い** 側 = 最小基数 (min cardinality = 参加制約)
  //
  // 5 種類のカーディナリティで描く記号:
  //   one       (max=1, min=1) → 縦棒 1 本   = `|`   ← max=min=1 なので 1 本だけ (dbdiagram 等の慣習)
  //   zero-one  (max=1, min=0) → 縦棒 + 円   = `|○`
  //   one-many  (max=N, min=1) → 鳥足 + 縦棒 = `<|`
  //   zero-many (max=N, min=0) → 鳥足 + 円   = `<○`
  //   many      (max=N,     ) → 鳥足のみ    = `<`
  //
  // Layout (エンティティ辺 x=0、+x が線内側方向):
  //   [entity edge] -- max at [FOOT_INNER..FOOT_OUTER] or [BAR_MAX] -- min at [MIN_POS]
  const maxIsOne = mark === "one" || mark === "zero-one";
  const maxIsMany = hasMany;
  // 最小基数は「max と異なるとき」だけ 2 番目の記号として描く。
  // mark === "one" (min=1) は max=1 と同じなので 2 番目は描かない。
  const minIsOneAsSecond = mark === "one-many";
  const minIsZero = hasZero;
  const FOOT_INNER = 0; // 鳥足の指先はエンティティ辺 (x=0) に届く
  const FOOT_OUTER = 22;
  const BAR_MAX = 14;
  const MIN_POS = maxIsMany ? 34 : 28;

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${deg})`}
      stroke={color}
      strokeWidth={1.8}
      fill="none"
      strokeLinecap="round"
    >
      {/* 最大基数 (エンティティ側) */}
      {maxIsMany && (
        <>
          {/* 鳥足: 頂点 (FOOT_OUTER, 0) から entity 側 (FOOT_INNER, ±11) と (FOOT_INNER, 0) へ */}
          <line x1={FOOT_OUTER} y1={0} x2={FOOT_INNER} y2={-11} />
          <line x1={FOOT_OUTER} y1={0} x2={FOOT_INNER} y2={0} />
          <line x1={FOOT_OUTER} y1={0} x2={FOOT_INNER} y2={11} />
        </>
      )}
      {maxIsOne && (
        <line x1={BAR_MAX} y1={-11} x2={BAR_MAX} y2={11} />
      )}
      {/* 最小基数 (線側) - max と異なる場合のみ */}
      {minIsOneAsSecond && (
        <line x1={MIN_POS} y1={-11} x2={MIN_POS} y2={11} />
      )}
      {minIsZero && (
        <circle cx={MIN_POS} cy={0} r={7} fill={BG_COLOR} />
      )}
    </g>
  );
}

function EntityBox({
  entity,
  showAttrs,
  notation,
}: {
  entity: EREntity;
  showAttrs?: boolean;
  notation: ERNotation;
}) {
  const box = entityBox(entity);
  const color = entity.highlighted ? HIGHLIGHT_COLOR : STROKE_COLOR;
  const strokeWidth = entity.highlighted ? 2.5 : 1.5;
  const hasAttrs = showAttrs !== false && entity.attributes && entity.attributes.length > 0;
  // 弱エンティティを視覚的に区別するのは Chen 記法の慣習 (二重四角)。
  // IE (crow's foot) / IDEF1X では特別な視覚差を付けず、複合主キーの構造 (親の PK を含む) で識別する。
  const showDoubleBox = entity.isWeak && notation === "chen";
  return (
    <g>
      {showDoubleBox && (
        <rect
          x={box.x - WEAK_INSET}
          y={box.y - WEAK_INSET}
          width={box.w + WEAK_INSET * 2}
          height={box.h + WEAK_INSET * 2}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      )}
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill={BG_COLOR}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* エンティティ名 */}
      <text
        x={box.cx}
        y={box.y + 26}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fontFamily="sans-serif"
        fill={STROKE_COLOR}
      >
        {entity.label}
      </text>
      {hasAttrs && (
        <>
          <line
            x1={box.x + 8}
            y1={box.y + 36}
            x2={box.x + box.w - 8}
            y2={box.y + 36}
            stroke={MUTED_COLOR}
            strokeWidth={0.8}
          />
          {entity.attributes!.map((attr, i) => {
            const isPk = entity.primaryKey?.includes(attr);
            return (
              <text
                key={attr + i}
                x={box.x + 10}
                y={box.y + 52 + i * ATTR_LINE_HEIGHT}
                fontSize="11"
                fontFamily="monospace"
                fill={STROKE_COLOR}
                textDecoration={isPk ? "underline" : undefined}
                fontWeight={isPk ? 700 : 400}
              >
                {attr}
                {isPk ? " (PK)" : ""}
              </text>
            );
          })}
        </>
      )}
      {/* 番号バッジ (答え合わせ時) */}
      {entity.highlighted && entity.badge !== undefined && (
        <g>
          <circle cx={box.x + box.w - 12} cy={box.y - 12} r={12} fill={HIGHLIGHT_COLOR} />
          <text
            x={box.x + box.w - 12}
            y={box.y - 8}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="sans-serif"
            fill="#ffffff"
          >
            {entity.badge}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * 自己参照 (再帰関連) のループを描画する。
 * ループはエンティティの右辺 (loopSide=right、既定) or 上辺 (loopSide=top) から出て
 * ぐるっと同じ辺の少し離れた点に戻る半円状のパス。
 * 両端にカーディナリティマーカーを配置する。
 */
function SelfReferenceLoop({
  entity,
  rel,
  notation,
}: {
  entity: EREntity;
  rel: ERRelationship;
  notation: ERNotation;
}) {
  const box = entityBox(entity);
  const color = rel.highlighted ? HIGHLIGHT_COLOR : STROKE_COLOR;
  const strokeWidth = rel.highlighted ? 2.5 : 1.5;
  const side = rel.loopSide ?? "right";
  const loopReach = 60;

  // 右辺 or 上辺の 2 点を選び、その 2 点を結ぶ半円上の弧
  let p1: { x: number; y: number };
  let p2: { x: number; y: number };
  let control: { x: number; y: number };
  let tangent1: number; // p1 の外向き接線角度
  let tangent2: number; // p2 の外向き接線角度

  if (side === "top") {
    const midX = box.cx;
    p1 = { x: midX - 40, y: box.y };
    p2 = { x: midX + 40, y: box.y };
    control = { x: midX, y: box.y - loopReach };
    tangent1 = -Math.PI / 2; // 上向き
    tangent2 = -Math.PI / 2; // 上向き
  } else {
    // right
    const midY = box.cy;
    p1 = { x: box.x + box.w, y: midY - 30 };
    p2 = { x: box.x + box.w, y: midY + 30 };
    control = { x: box.x + box.w + loopReach, y: midY };
    tangent1 = 0; // 右向き
    tangent2 = 0; // 右向き
  }

  // 3 次ベジェ 2 制御点 (ループの膨らみを綺麗に)
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const c1 = { x: p1.x + (control.x - mid.x) * 0.8, y: p1.y + (control.y - mid.y) * 0.6 };
  const c2 = { x: p2.x + (control.x - mid.x) * 0.8, y: p2.y + (control.y - mid.y) * 0.6 };

  return (
    <g>
      <path
        d={`M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <CardinalityMarker x={p1.x} y={p1.y} angle={tangent1} mark={rel.fromCardinality} notation={notation} color={color} />
      <CardinalityMarker x={p2.x} y={p2.y} angle={tangent2} mark={rel.toCardinality} notation={notation} color={color} />
      {rel.label && (
        <g>
          <rect
            x={control.x - rel.label.length * 8 - 6}
            y={control.y - 12}
            width={rel.label.length * 16 + 12}
            height={22}
            fill={BG_COLOR}
            stroke="none"
          />
          <text
            x={control.x}
            y={control.y + 4}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill={STROKE_COLOR}
            fontFamily="sans-serif"
          >
            {rel.label}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * 通常の関連線 (エンティティ間) を描画。parallelOffset で垂直方向のオフセットを受ける。
 * 直線ではなく、オフセットが非零のときは緩やかな曲線で描く。
 */
function RelationshipLine({
  rel,
  entities,
  defaultNotation,
  parallelOffset,
}: {
  rel: ERRelationship;
  entities: EREntity[];
  defaultNotation: ERNotation;
  parallelOffset: number;
}) {
  const from = entities.find((e) => e.id === rel.from);
  const to = entities.find((e) => e.id === rel.to);
  if (!from || !to) return null;

  const color = rel.highlighted ? HIGHLIGHT_COLOR : STROKE_COLOR;
  const strokeWidth = rel.highlighted ? 2.5 : 1.5;
  const dashArray = rel.dashed ? "6 4" : undefined;
  const notation = rel.notation ?? defaultNotation;

  // 自己参照はループ描画に委譲
  if (rel.from === rel.to) {
    return <SelfReferenceLoop entity={from} rel={rel} notation={notation} />;
  }

  // orthogonal routing: エンティティ配置に応じて水平/垂直に折れる Z 字型 or 直線で描く。
  //
  // ルーティング軸の決定:
  //   1. 縦方向に重なりがある (y 範囲が交差する) → 水平ルーティング
  //   2. 横方向に重なりがある → 垂直ルーティング
  //   3. 両方向とも重なりがない (対角配置): エンティティ間の「隙間 (gap)」を計算し、
  //      より大きい gap の軸を主軸にする。「監査担当が下にある」ようなレイアウトでは
  //      縦 gap が大きいので縦ルーティング (下から出る) が選ばれる。
  const fromBox = entityBox(from);
  const toBox = entityBox(to);
  const centerDx = toBox.cx - fromBox.cx;
  const centerDy = toBox.cy - fromBox.cy;
  const vertOverlap =
    Math.min(fromBox.y + fromBox.h, toBox.y + toBox.h) -
    Math.max(fromBox.y, toBox.y);
  const horizOverlap =
    Math.min(fromBox.x + fromBox.w, toBox.x + toBox.w) -
    Math.max(fromBox.x, toBox.x);
  let horizontalDominant: boolean;
  if (vertOverlap > 0 && horizOverlap <= 0) {
    horizontalDominant = true; // 縦重なりあり → 水平ルーティング
  } else if (horizOverlap > 0 && vertOverlap <= 0) {
    horizontalDominant = false; // 横重なりあり → 垂直ルーティング
  } else if (vertOverlap > 0 && horizOverlap > 0) {
    // 両方重なる (エンティティが部分的に重なる、稀) → 中心距離で決める
    horizontalDominant = Math.abs(centerDx) >= Math.abs(centerDy);
  } else {
    // 対角配置 (両方重なりなし): 大きい gap の軸を主軸に
    const vertGap = -vertOverlap; // 重なり無しなら overlap は負値
    const horizGap = -horizOverlap;
    horizontalDominant = horizGap >= vertGap;
  }

  // 平行オフセットは水平寄りなら y に、垂直寄りなら x に加える
  let fp: { x: number; y: number };
  let tp: { x: number; y: number };
  let fromAngle: number;
  let toAngle: number;
  let pathD: string;
  let midX: number;
  let midY: number;

  // 「ほぼ揃っている」しきい値: これ以内なら直線にスナップ
  const STRAIGHT_SNAP_PX = 40;

  // 対角配置か (両方向とも重なりなし) — このときは L 字型ルーティング (源が主軸方向に出て、
  // 目標が直交方向から入る) を使う。それ以外は Z 字 or 直線。
  const isDiagonal = vertOverlap <= 0 && horizOverlap <= 0;

  if (horizontalDominant) {
    // 水平ルーティング: 源は左右の辺から出る
    const fromRight = centerDx > 0;
    const fpX = fromRight ? fromBox.x + fromBox.w : fromBox.x;
    const rawFpY = fromBox.cy + parallelOffset;
    const fpY = clamp(rawFpY, fromBox.y + 6, fromBox.y + fromBox.h - 6);
    fromAngle = fromRight ? 0 : Math.PI;

    if (isDiagonal) {
      // L 字: 源から水平 → 直交 (垂直) で目標の上/下辺に入る
      const targetFromTop = centerDy > 0; // 目標が下にあるなら上辺入り
      const tpY = targetFromTop ? toBox.y : toBox.y + toBox.h;
      const rawTpX = toBox.cx;
      const tpX = clamp(rawTpX, toBox.x + 6, toBox.x + toBox.w - 6);
      fp = { x: fpX, y: fpY };
      tp = { x: tpX, y: tpY };
      toAngle = targetFromTop ? -Math.PI / 2 : Math.PI / 2;
      // L: 源 → (tpX, fpY) → 目標
      pathD = `M ${fpX} ${fpY} L ${tpX} ${fpY} L ${tpX} ${tpY}`;
      midX = tpX;
      midY = (fpY + tpY) / 2;
    } else {
      // Z 字 or 直線: 源も目標も左右辺で入出
      const tpX = fromRight ? toBox.x : toBox.x + toBox.w;
      const rawTpY = toBox.cy + parallelOffset;
      let tpY = clamp(rawTpY, toBox.y + 6, toBox.y + toBox.h - 6);
      let fpYAdjusted = fpY;
      if (Math.abs(fpYAdjusted - tpY) < STRAIGHT_SNAP_PX) {
        const overlapMinY = Math.max(fromBox.y, toBox.y) + 6;
        const overlapMaxY = Math.min(fromBox.y + fromBox.h, toBox.y + toBox.h) - 6;
        if (overlapMaxY >= overlapMinY) {
          const targetY = clamp((fpYAdjusted + tpY) / 2, overlapMinY, overlapMaxY);
          fpYAdjusted = targetY;
          tpY = targetY;
        }
      }
      fp = { x: fpX, y: fpYAdjusted };
      tp = { x: tpX, y: tpY };
      toAngle = fromRight ? Math.PI : 0;
      if (Math.abs(fpYAdjusted - tpY) < 1) {
        pathD = `M ${fpX} ${fpYAdjusted} L ${tpX} ${tpY}`;
        midX = (fpX + tpX) / 2;
        midY = fpYAdjusted;
      } else {
        const zMidX = (fpX + tpX) / 2;
        pathD = `M ${fpX} ${fpYAdjusted} L ${zMidX} ${fpYAdjusted} L ${zMidX} ${tpY} L ${tpX} ${tpY}`;
        midX = zMidX;
        midY = (fpYAdjusted + tpY) / 2;
      }
    }
  } else {
    // 垂直ルーティング: 源は上下の辺から出る
    const fromBottom = centerDy > 0;
    const fpY = fromBottom ? fromBox.y + fromBox.h : fromBox.y;
    const rawFpX = fromBox.cx + parallelOffset;
    const fpX = clamp(rawFpX, fromBox.x + 6, fromBox.x + fromBox.w - 6);
    fromAngle = fromBottom ? Math.PI / 2 : -Math.PI / 2;

    if (isDiagonal) {
      // L 字: 源から垂直 → 直交 (水平) で目標の左/右辺に入る
      const targetFromLeft = centerDx > 0;
      const tpX = targetFromLeft ? toBox.x : toBox.x + toBox.w;
      const rawTpY = toBox.cy;
      const tpY = clamp(rawTpY, toBox.y + 6, toBox.y + toBox.h - 6);
      fp = { x: fpX, y: fpY };
      tp = { x: tpX, y: tpY };
      toAngle = targetFromLeft ? Math.PI : 0;
      // L: 源 → (fpX, tpY) → 目標
      pathD = `M ${fpX} ${fpY} L ${fpX} ${tpY} L ${tpX} ${tpY}`;
      midX = (fpX + tpX) / 2;
      midY = tpY;
    } else {
      // Z 字 or 直線
      const tpY = fromBottom ? toBox.y : toBox.y + toBox.h;
      const rawTpX = toBox.cx + parallelOffset;
      let tpX = clamp(rawTpX, toBox.x + 6, toBox.x + toBox.w - 6);
      let fpXAdjusted = fpX;
      if (Math.abs(fpXAdjusted - tpX) < STRAIGHT_SNAP_PX) {
        const overlapMinX = Math.max(fromBox.x, toBox.x) + 6;
        const overlapMaxX = Math.min(fromBox.x + fromBox.w, toBox.x + toBox.w) - 6;
        if (overlapMaxX >= overlapMinX) {
          const targetX = clamp((fpXAdjusted + tpX) / 2, overlapMinX, overlapMaxX);
          fpXAdjusted = targetX;
          tpX = targetX;
        }
      }
      fp = { x: fpXAdjusted, y: fpY };
      tp = { x: tpX, y: tpY };
      toAngle = fromBottom ? -Math.PI / 2 : Math.PI / 2;
      if (Math.abs(fpXAdjusted - tpX) < 1) {
        pathD = `M ${fpXAdjusted} ${fpY} L ${tpX} ${tpY}`;
        midX = fpXAdjusted;
        midY = (fpY + tpY) / 2;
      } else {
        const zMidY = (fpY + tpY) / 2;
        pathD = `M ${fpXAdjusted} ${fpY} L ${fpXAdjusted} ${zMidY} L ${tpX} ${zMidY} L ${tpX} ${tpY}`;
        midX = (fpXAdjusted + tpX) / 2;
        midY = zMidY;
      }
    }
  }

  // 識別関係の 2 重パス (Chen 記法のみ) 用に、パスを平行にずらして描くための単純ラッパー
  const buildDoublePath = (offset: number): string => {
    // 単純化のため、線が水平/垂直 だけを想定して y or x を offset する。
    // ここでは Z 字を扱うので、パス全体を "太めに描く" 近似として offset だけずらして描画。
    // 現時点で Chen 記法は notation ページの短い直線しか使わないので、これで十分。
    if (horizontalDominant) {
      return pathD.replace(/L (\S+) (\S+)/g, (_, x, y) => `L ${x} ${Number(y) + offset}`)
        .replace(/^M (\S+) (\S+)/, (_, x, y) => `M ${x} ${Number(y) + offset}`);
    } else {
      return pathD.replace(/L (\S+) (\S+)/g, (_, x, y) => `L ${Number(x) + offset} ${y}`)
        .replace(/^M (\S+) (\S+)/, (_, x, y) => `M ${Number(x) + offset} ${y}`);
    }
  };

  // 識別関係の描画:
  // - IE (crow's foot): 特別な視覚差なし。単一実線。識別かどうかは 子側の PK が親の PK を含むかで表現
  // - IDEF1X: 単一実線 (識別) / 破線 (非識別) で区別
  // - Chen: 二重線 (原典は 二重菱形 だが本サイトは菱形省略のため二重線で代替)
  const useDoubleForIdentifying = rel.isIdentifying && notation === "chen";
  // IDEF1X で非識別関係は破線、それ以外は dashed prop の指定に従う
  const finalDashArray = notation === "idef1x" && !rel.isIdentifying ? "6 4" : dashArray;

  return (
    <g>
      {useDoubleForIdentifying ? (
        <>
          <path d={buildDoublePath(-2.5)} fill="none" stroke={color} strokeWidth={strokeWidth} />
          <path d={buildDoublePath(2.5)} fill="none" stroke={color} strokeWidth={strokeWidth} />
        </>
      ) : (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={finalDashArray}
        />
      )}
      <CardinalityMarker x={fp.x} y={fp.y} angle={fromAngle} mark={rel.fromCardinality} notation={notation} color={color} />
      <CardinalityMarker x={tp.x} y={tp.y} angle={toAngle} mark={rel.toCardinality} notation={notation} color={color} />
      {rel.label && (
        <g>
          <rect
            x={midX - (rel.label.length * 15) / 2 - 6}
            y={midY - 12}
            width={rel.label.length * 15 + 12}
            height={22}
            fill={BG_COLOR}
            stroke="none"
          />
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill={STROKE_COLOR}
            fontFamily="sans-serif"
          >
            {rel.label}
          </text>
        </g>
      )}
      {rel.highlighted && rel.badge !== undefined && (
        <g>
          <circle cx={midX} cy={midY - 22} r={12} fill={HIGHLIGHT_COLOR} />
          <text
            x={midX}
            y={midY - 18}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="sans-serif"
            fill="#ffffff"
          >
            {rel.badge}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * 同一エンティティ間の複数関連を検出して、各関連に対する平行オフセットを計算する。
 * (from, to) と (to, from) は同じ組と見なす。
 */
function computeParallelOffsets(relationships: ERRelationship[]): number[] {
  const groupIndex: Record<string, number[]> = {};
  const key = (r: ERRelationship) =>
    [r.from, r.to].sort().join("::");
  relationships.forEach((r, i) => {
    if (r.from === r.to) return; // 自己参照は独立扱い
    const k = key(r);
    if (!groupIndex[k]) groupIndex[k] = [];
    groupIndex[k].push(i);
  });
  const offsets: number[] = new Array(relationships.length).fill(0);
  for (const group of Object.values(groupIndex)) {
    if (group.length <= 1) continue;
    const n = group.length;
    group.forEach((relIdx, i) => {
      // -N/2 * spacing … +N/2 * spacing (中央 = 0)
      offsets[relIdx] = (i - (n - 1) / 2) * PARALLEL_SPACING;
    });
  }
  return offsets;
}

export function ERDiagram({
  entities,
  relationships,
  width = 1200,
  height = 700,
  title = "ER図",
  caption,
  legend,
  notation = "ie",
}: ERDiagramProps) {
  const parallelOffsets = computeParallelOffsets(relationships);
  return (
    <VizFrame title={title} legend={legend}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[75vh]"
          role="img"
          aria-label={title}
        >
          <rect x={0} y={0} width={width} height={height} fill="#fafafa" />
          {relationships.map((r, i) => (
            <RelationshipLine
              key={r.id ?? `${r.from}-${r.to}-${i}`}
              rel={r}
              entities={entities}
              defaultNotation={notation}
              parallelOffset={parallelOffsets[i]}
            />
          ))}
          {entities.map((e) => (
            <EntityBox key={e.id} entity={e} notation={notation} />
          ))}
        </svg>
      </div>
      {caption && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
          {caption}
        </p>
      )}
    </VizFrame>
  );
}
