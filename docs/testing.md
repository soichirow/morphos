# テスト方針とE2Eシナリオ

## 目的

テストの目的は「通すこと」ではなく、利用者が依存する振る舞いを変更したときに適切に壊し、異常を早く知らせることです。内部関数の呼び出し回数ではなく、公開された関数、URL、DOM、クリップボード、localStorage、生成ファイル、HTTPレスポンスを観測します。

## TDD

機能追加と不具合修正は、小さな縦切りで進めます。

1. 1つの利用者行動を表すテストを書く
2. 現状で失敗するREDを確認する
3. 最小の実装でGREENにする
4. 重複や型の曖昧さを整理する
5. 対象テスト、関連テスト、全ゲートの順に実行する

既存挙動へ特性テストを追加する場合はREDにならないことがあります。その場合も、壊したい契約を具体的にassertし、可能なら一時的なmutationで検知力を確認します。

## テスト層

| 層                  | 主な対象                                                            | 外部依存                                |
| ------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| Vitest domain/lib   | URL正規化、検索、分類、ランダム、共有URL、storage解析、画像表示判断 | 原則なし                                |
| component           | 表示モード、DOMとアクセシビリティ                                   | jsdom。内部モジュールを過剰にmockしない |
| integration         | PowerPoint/Word等の実ファイル生成                                   | 実ライブラリ                            |
| Playwright critical | URL、localStorage、clipboard、画面操作、静的配信、SEO               | 実Chromium + Wrangler。原則mockなし     |
| Playwright upstream | 原作画像・JSONの実取得                                              | `morphos.ameyanagi.com`                 |

upstream smokeの失敗は、自サイトの退行と外部配信元障害を区別して調査します。外部障害を隠すために成功レスポンスをmockしません。

## セットアップ

正本はBun 1.3.5です。

```powershell
bun install --frozen-lockfile
bunx playwright install chromium
npm run build:cloudflare
```

## 実行

```powershell
# 単体・コンポーネント・統合
npm test

# 自サイト内の重要E2E（外部スモークを除く）
npm run test:e2e:critical

# 原作配信元の実通信スモーク
npm run test:e2e:upstream

# 全E2E
npm run test:e2e

# 単一シナリオ
npx playwright test -g "ランダム表示で"

# リリースゲート全体
npm run ci
```

Playwrightは `.output/public` をWrangler Pagesで `127.0.0.1:4173` に配信します。ソース変更後は `npm run build:cloudflare` を再実行しないと、古い成果物をテストしてしまいます。

## 重要E2Eの契約

- 日本語サイト名と英語名の切り替え
- ファーストビューの3表示モード、localStorage保存、スマホ幅
- 検索、共有URL、お気に入り、コピー、言語の連動
- ランダム表示が別システムを選び `system` queryへ同期
- 日本語名主表示、英名補助表示、日本語検索
- Xほか主要SNSの共有先と共有URL
- `/systems/<slug>` と `/gallery` の正規化
- 高解像度ライトボックスとEscape操作
- PowerPoint／Wordの実生成開始
- sitemap、robots、canonical、OGP、privacy、同意前にGA4がないこと
- ふわふわ／モザイク／通常の画像契約
- ふわふわ／モザイク中に元画像ダウンロード導線がないこと
- 大分類・細分類の日英表示とURL状態
- カテゴリ付きURLで指定システムが維持されること
- 原作の代表画像・JSONを実取得できること（`@upstream`）

## 失敗時

`test-results` にscreenshot、trace、error contextが残ります。

```powershell
npx playwright show-trace "test-results/<scenario>/trace.zip"
```

まず最小の `-g` 実行で再現し、URL、localStorage、console/pageerror、network、DOMの順に境界を切り分けます。リトライで緑にする運用はせず、CIではflaky testも失敗として扱います。

## モック方針

- 自分たちのdomain/libをmockしない
- ブラウザAPIはPlaywrightの実機能を使う
- 時刻・乱数・外部ネットワークなど境界だけ、必要な場合に限定する
- mockを入れた重要境界には、別途contract/integration/E2Eの非mock確認を置く
- 本番不具合は、可能なら実際の入力・URL・イベント順を回帰テストへ落とす
