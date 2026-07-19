import { buildTopicMetadata } from "@/lib/metadata";
import Link from "next/link";
import { TopicLayout } from "@/components/layout/TopicLayout";
import { TopicJsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/components/layout/FAQ";
import { findTopic } from "@/content/topics";

const slug = "reading";
const topic = findTopic("data-modeling", slug)!;

export const metadata = buildTopicMetadata(topic);

const faq = [
  {
    q: "レビュー時、どの項目から見ればよいですか？",
    a: "上から順で問題ない。エンティティ粒度 (1〜2) が壊れていたら以降の議論は成り立たないので、まずここを固める。次に関連 (3〜4) の意味論、その後カーディナリティ / 参加制約 (5〜6) の数量、最後に弱エンティティ・識別関係 / 記法統一 (7〜9) の順で見る。",
  },
  {
    q: "ER 図が既にあるプロジェクトで、このチェックリストは使えますか？",
    a: "そのまま使える。むしろ既存 ER 図のレビューにこそ効く。「あの図なんとなく変」と思ったことがある場合、9 つのうちどれに引っかかっているかで議論のフォーカスを絞れる。",
  },
  {
    q: "自分で ER 図を書くときにも同じチェックリストを使えますか？",
    a: "使える。書き終わったら自分の図に対して 9 項目でセルフレビューする習慣をつけると、レビュー指摘で戻ってくる回数が減る。特に 6 (関連の役割名) と 9 (記法統一) は自分では気付きにくいので機械的にチェックする価値がある。",
  },
];

export default function Page() {
  return (
    <TopicLayout section="data-modeling" slug={slug}>
      <TopicJsonLd section="data-modeling" slug={slug} faq={faq} />

      <h2>なぜ「読む訓練」が必要か</h2>
      <p>
        ER 図を「書く」記法は教科書で習うが、「読む」訓練は意外と扱われない。
        でも、実務で ER 図を渡されるシチュエーションは、書くより読むほうが圧倒的に多い。
        新プロジェクトへの参加、既存システムの調査、レビュー、リバースエンジニアリング。
      </p>
      <p>
        しかも読む対象の ER 図は、教科書のような美しいものは滅多に無い。
        <strong>変なER図と大差ないもの</strong> をレビューして
        「これは何がおかしいか」を言語化する場面のほうがずっと多い。
      </p>
      <p>
        本ページでは <Link href="/data-modeling/er-diagram">変なER図</Link> の 9 つの違和感を汎化した、
        実業務でも使えるチェックリストを提供する。
      </p>

      <h2>9 段階のチェックリスト</h2>

      <h3>1. エンティティの粒度は適切か</h3>
      <p>
        属性欄に <strong>複数値・JSON・繰り返しカラム</strong> が入っていないか。
        「担当者ID一覧」「履歴JSON」「電話1・電話2・電話3」を見つけたら、別エンティティに切り出す候補。
      </p>
      <p>
        → 詳細: <Link href="/data-modeling/er-diagram/entity">エンティティとは</Link>、
        <Link href="/data-modeling/normalization/1nf">第1正規形 (1NF)</Link>
      </p>

      <h3>2. 主キーは適切か</h3>
      <p>
        全エンティティに主キーが 1 つ以上宣言されているか (=下線が引かれているか)。
        代理キー (連番の ID) と自然キー (業務上のキー) の使い分けは統一されているか。
      </p>

      <h3>3. 関連に役割名が付いているか</h3>
      <p>
        同じエンティティ間に複数の関連がある場合、特に役割名が必須。
        「線が引いてあるけど意味不明」な線はないか。
      </p>
      <p>
        → 詳細: <Link href="/data-modeling/er-diagram/relationship">関連 (リレーションシップ)</Link>
      </p>

      <h3>4. 自己参照 (再帰関連) の方向と役割名が明示されているか</h3>
      <p>
        「社員 → 上司」「カテゴリ → 親カテゴリ」のような自己参照は、
        方向と役割名を必ず明示する。参加制約 (トップ層は親なし = 任意参加) も忘れない。
      </p>

      <h3>5. カーディナリティが業務ルールと一致しているか</h3>
      <p>
        「1:1」「1:N」「N:M」の選択が実世界の業務と噛み合っているか。
        「EC サイトなのに 顧客-注文 が 1:1」のような矛盾を検出する。
      </p>
      <p>
        → 詳細: <Link href="/data-modeling/er-diagram/cardinality">カーディナリティ</Link>
      </p>

      <h3>6. 参加制約 (必須/任意) が明示され矛盾がないか</h3>
      <p>
        線の端に「必ず 1」「0 も許容」の記号がついているか。
        「必須なのに 0 個許容」のような矛盾はないか。
      </p>
      <p>
        → 詳細: <Link href="/data-modeling/er-diagram/optionality">参加制約</Link>
      </p>

      <h3>7. 多対多は連関実体に分解されているか</h3>
      <p>
        両端に鳥足×鳥足の直接 N:M がないか。連関実体 (中間テーブル) が正しく挟まっているか。
        履歴・状態遷移・重複制御が必要な場面で連関実体を省略していないか。
      </p>
      <p>
        → 詳細: <Link href="/data-modeling/er-diagram/many-to-many">多対多と連関実体</Link>
      </p>

      <h3>8. 弱エンティティが親エンティティと識別関係で繋がっているか</h3>
      <p>
        二重四角 (=弱エンティティ) が親エンティティなしに独立していないか。
        子エンティティの主キーが親の主キーを含んでいるか。
      </p>
      <p>
        → 詳細: <Link href="/data-modeling/er-diagram/weak-entity">弱エンティティ</Link>、
        <Link href="/data-modeling/er-diagram/identifying">識別関係と非識別関係</Link>
      </p>

      <h3>9. 図全体で記法が統一されているか</h3>
      <p>
        1 枚の ER 図の中で IE / IDEF1X / Chen が混在していないか。
        混在する場合は必ず注釈で「この部分は IDEF1X 記法」と明示されているか。
      </p>
      <p>
        → 詳細: <Link href="/data-modeling/er-diagram/notation">記法比較</Link>
      </p>

      <h2>コピペ用のレビューテンプレート</h2>
      <p>
        Slack やプルリクエストの ER 図レビューで使えるチェックリスト。
        そのままコピペして各項目をつぶしていくと、指摘漏れが減る。
      </p>
      <div className="not-prose my-6 rounded border border-[var(--border-strong)] bg-[var(--card)] p-5">
        <pre className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-mono">{`### ER 図レビュー チェックリスト
- [ ] エンティティの粒度は適切か (属性に複数値・JSON が入っていないか)
- [ ] 主キーは適切か (全エンティティに 1 つ以上宣言、代理/自然キーの使い分けは統一されているか)
- [ ] 関連に役割名が付いているか (特に同エンティティ間に複数の関連があるとき)
- [ ] 自己参照 (再帰関連) の方向と役割名が明示されているか
- [ ] カーディナリティが実世界の業務ルールと一致しているか
- [ ] 参加制約 (必須/任意) が明示され矛盾がないか
- [ ] 多対多は連関実体に分解されているか
- [ ] 弱エンティティは親エンティティと識別関係で繋がっているか
- [ ] 図全体で記法が統一されているか
`}</pre>
      </div>

      <h2>「変なER図」で総合演習</h2>
      <p>
        このチェックリストを持って、もう一度{" "}
        <Link href="/data-modeling/er-diagram">変なER図</Link> に戻ってみる。
        9 つの違和感が、9 段階のチェックそれぞれに対応していることが体感できるはず。
      </p>

      <FAQ items={faq} />
    </TopicLayout>
  );
}
