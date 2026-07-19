import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { ERDiagram } from "@/components/viz/er/ERDiagram";
import { WeirdERDiagram } from "@/components/viz/er/WeirdERDiagram";
import { findTopic } from "@/content/topics";

const slug = "entity";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "エンティティと属性の違いは？",
    a: "エンティティは「区別したい単位そのもの」で、属性はエンティティが持つ「性質」。生徒はエンティティ、生徒の血液型は属性。ただし血液型を集計軸として使いたくなったら別エンティティに切り出す判断もあり得る。",
  },
  {
    q: "何をエンティティにすべきかの基準は？",
    a: "(1) システムが区別したい対象か、(2) 独立にライフサイクルを持つか、(3) 複数の他のエンティティから参照されるか、の 3 点で判断する。",
  },
  {
    q: "強エンティティと弱エンティティの違いは？",
    a: "強エンティティは自前の主キーだけで一意に識別できる。弱エンティティは親エンティティのキーを借りて初めて識別できる。親を消したら子が意味を持たなくなる関係が目印。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>まず身近な例で: 表の 1 行を「何」にするか</h2>
      <p>
        Excel か Google Sheets で生徒の表を作るとき、いちばん最初に決めるのは
        <strong>「1 行を何にするか」</strong>。生徒 1 人 = 1 行にするのか、
        生徒とクラス担任のセット = 1 行にするのか、あるいは日々の出欠 = 1 行にするのか、
        で表の意味も列も全部変わる。この <strong>「1 行にしたい単位」</strong> こそが、
        ER 図でいう <strong>エンティティ</strong>。
      </p>
      <p>
        エンティティは<strong>実世界の名詞そのもの</strong>ではない。
        「システムが区別したい単位」だ。生徒 A と生徒 B を区別したいから「生徒」がエンティティになる。
        「日本語」と「英語」を区別したいなら「言語」もエンティティ。区別する必要がなければ、単なる属性で終わる。
      </p>

      <h2>ER 図でのエンティティの描き方</h2>
      <p>
        ER 図では四角い箱で描き、箱の中に「エンティティ名 (通常は名詞、単数形が慣例)」を上段、
        「属性のリスト」を下段に書く。主キー (行を一意に見分けるための列) には下線を引くのが IE 記法の慣習。
      </p>

      <ERDiagram
        title="エンティティの基本形"
        width={700}
        height={280}
        entities={[
          {
            id: "student",
            label: "生徒",
            x: 60,
            y: 40,
            width: 260,
            attributes: ["学籍番号", "氏名", "学年", "血液型"],
            primaryKey: ["学籍番号"],
          },
          {
            id: "class",
            label: "クラス",
            x: 400,
            y: 40,
            width: 240,
            attributes: ["クラスID", "クラス名", "担任"],
            primaryKey: ["クラスID"],
          },
        ]}
        relationships={[]}
        caption="下線が引かれている列 (学籍番号 / クラスID) が主キー = 1 行を一意に特定する列。"
      />

      <h2>エンティティにするか、属性にするかの判断基準</h2>
      <p>
        現場で迷うのは、<strong>「これは属性か、それとも独立のエンティティか」</strong> の判断。
        以下の 3 点のうちどれかに Yes なら、独立エンティティとして切り出したほうがよい:
      </p>
      <ul>
        <li>
          <strong>複数値を持ちうるか</strong> —
          「生徒の履修科目」は複数持てる → 独立エンティティ「履修」に切り出す
        </li>
        <li>
          <strong>独立にライフサイクルを持つか</strong> —
          「担任」は生徒と別に管理されている (異動・退職・引き継ぎがある) → 別エンティティ「教員」に切り出す
        </li>
        <li>
          <strong>複数の他のエンティティから参照されるか</strong> —
          「商品」を注文明細からも、カート項目からも、レビューからも参照する → 生徒とは別ドメインだが、独立エンティティ「商品」を用意して、複数のエンティティから FK で参照する構造にする
        </li>
      </ul>
      <p>
        逆に、「生徒の血液型」のような <strong>1 対 1 で単一値・独立管理も参照もされない</strong> データは属性で十分。
        余計な箱を作らないほうが図はシンプルになる。
      </p>

      <h2>変なER図 との対応: 違和感 #5「顧客」の属性欄破綻</h2>

      <div className="not-prose my-6">
        <WeirdERDiagram highlightAnomalies={new Set([5])} />
      </div>

      <p>
        <Link href="/data-modeling/er-diagram">変なER図</Link> の「顧客」エンティティには、
        <code>注文履歴JSON</code>、<code>カート内商品ID配列</code>、<code>レビュー全て</code>、<code>血液型</code> …
        と粒度もライフサイクルも違うものが並んでいる。
      </p>
      <ul>
        <li>
          <strong>注文履歴</strong> は複数値を持ち、注文ごとに独立して管理される → 別エンティティ「注文」「注文明細」に切り出すべき
        </li>
        <li>
          <strong>レビュー全て</strong> は複数属性の塊 (評価・本文・投稿日時…) → 別エンティティ「レビュー」に切り出すべき
        </li>
        <li>
          <strong>カート内商品ID配列</strong> は複数値そのもの → 別エンティティ「カート項目」との関連に切り出すべき
        </li>
      </ul>
      <p>
        これらを 1 つのエンティティに詰め込むと、更新のたびに JSON の一部だけ書き換えて残りを壊すなど、
        <Link href="/data-modeling/normalization/1nf">第1正規形 (1NF)</Link> の違反となる問題も同時に起きる。
        ER 図の粒度と正規化は表裏一体の話だ。
      </p>

      <h2>強エンティティと弱エンティティの導入</h2>
      <p>
        エンティティは <strong>強エンティティ</strong> と{" "}
        <strong>弱エンティティ</strong> の 2 種類がある:
      </p>
      <ul>
        <li>
          <strong>強エンティティ</strong>: 自前の主キーだけで一意に識別できる。生徒 (学籍番号)、クラス (クラスID) など
        </li>
        <li>
          <strong>弱エンティティ</strong>: 親エンティティのキーを借りて初めて一意になる。注文明細 (注文ID + 明細番号) など。
          詳細は <Link href="/data-modeling/er-diagram/weak-entity">弱エンティティ ページ</Link>
        </li>
      </ul>
      <p>
        判定基準は <strong>「親を消したら子は意味を持つか」</strong>。
        注文を消したら明細に意味はない → 弱。生徒を消してもクラスは意味を持つ → 強。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
