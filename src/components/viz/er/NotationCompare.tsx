import {
  ERDiagram,
  type EREntity,
  type ERRelationship,
  type ERNotation,
} from "@/components/viz/er/ERDiagram";

/**
 * 同じ ER 図 (顧客 / 注文 / 注文明細) を IE / IDEF1X / Chen の 3 記法で並置する。
 * `notation` ページの本文で使用。
 */

const ENTITIES: EREntity[] = [
  {
    id: "customer",
    label: "顧客",
    x: 60,
    y: 60,
    width: 200,
    attributes: ["顧客ID", "名前"],
    primaryKey: ["顧客ID"],
  },
  {
    id: "order",
    label: "注文",
    x: 380,
    y: 60,
    width: 200,
    attributes: ["注文ID", "顧客ID", "注文日"],
    primaryKey: ["注文ID"],
  },
  {
    id: "line",
    label: "注文明細",
    x: 380,
    y: 320,
    width: 200,
    attributes: ["注文ID", "明細番号", "商品名", "数量"],
    primaryKey: ["注文ID", "明細番号"],
    isWeak: true,
  },
];

const RELATIONSHIPS: ERRelationship[] = [
  {
    from: "customer",
    to: "order",
    fromCardinality: "one",
    toCardinality: "one-many",
  },
  {
    from: "order",
    to: "line",
    fromCardinality: "one",
    toCardinality: "one-many",
    isIdentifying: true,
  },
];

const NOTATION_LABEL: Record<ERNotation, string> = {
  ie: "IE (crow's foot)",
  idef1x: "IDEF1X",
  chen: "Chen",
};

export function NotationCompare({
  notations = ["ie", "idef1x", "chen"],
}: {
  notations?: ERNotation[];
}) {
  return (
    <div className="not-prose my-6 flex flex-col gap-6">
      {notations.map((n) => (
        <ERDiagram
          key={n}
          title={`同じ ER 図を ${NOTATION_LABEL[n]} 記法で描くと`}
          entities={ENTITIES}
          relationships={RELATIONSHIPS}
          notation={n}
          width={720}
          height={520}
          caption={
            n === "ie"
              ? "現代の作図ツール (dbdiagram / DrawSQL / Draw.io / Miro / Lucidchart) の既定記法。実務でもっとも見る"
              : n === "idef1x"
                ? "米国連邦標準の記法。防衛・官公庁系や大規模基幹系の設計書で残存。実線=識別関係、破線=非識別関係"
                : "Peter Chen 提唱の原初的記法。関連を菱形、属性を楕円で描き分ける。学術文献で頻出、実務はほぼ絶滅"
          }
        />
      ))}
    </div>
  );
}
