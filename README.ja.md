# モーファス

自然の動植物・鉱物・風景などをもとにした611種類のデザインシステムを、日本語と英語で探して使えるカタログです。[Ameyanagi/morphos](https://github.com/Ameyanagi/morphos) を基にした日本語フォークです。

公開版: https://morphos.so1ro.com/

English documentation: [README.md](README.md)

## 主な機能

- 日本語／英語の切り替え。日本語では日本語名を主表示し、英名も補助表示
- 検索、大分類・細分類、色、並び順による絞り込み
- 選択中のシステムを `?system=<slug>` で共有。LLMへURLを渡して同じページを開ける
- X、Facebook、LinkedIn、Bluesky、Reddit、WhatsApp、Telegramへの共有
- ブラウザ内のお気に入り保存
- ランダム表示
- CSS、theme.json、prompts.json、個別プロンプト、色のコピー
- PowerPoint／Word生成
- ふわふわ・モザイク・通常の3表示モード
- sitemap、robots、canonical、OGP、同意後だけ読み込むGA4の準備

詳しい使い方は [利用ガイド](docs/user-guide.md) を参照してください。

## 表示モード

| モード   | 表示                                                 | 元画像のダウンロード |
| -------- | ---------------------------------------------------- | -------------------- |
| ふわふわ | ローカルの抽象化したらくがき画像。ボード等はモザイク | 非表示               |
| モザイク | 元画像を強くぼかし、格子を重ねる                     | 非表示               |
| 通常     | 原作の通常画像                                       | 表示                 |

初期値は「ふわふわ」です。選択はlocalStorageへ保存されます。詳細な安全境界は [利用ガイド](docs/user-guide.md#表示モード) に記載しています。

## 開発

正本のパッケージマネージャーはBun 1.3.5です。Node.js 22系とnpmでも同じスクリプトを実行できますが、CIと依存関係の再現にはBunを使います。

```powershell
bun install --frozen-lockfile
bunx playwright install chromium
npm run dev
```

品質ゲート:

```powershell
npm run lint
npm run typecheck
npm test
npm run build:cloudflare
npm run test:e2e
```

全ゲートは `npm run ci` で実行できます。E2Eは先に `.output/public` を作る必要があるため、単独実行時は `npm run build:cloudflare` を先に実行してください。

- [テスト方針とE2Eシナリオ](docs/testing.md)
- [アーキテクチャ](docs/architecture.md)
- [Cloudflareリリース手順](docs/releasing.md)
- [SEO・分析・公開ガバナンス](docs/site-governance.md)

## 公開

正本はCloudflare Pagesの `morphos-ja` プロジェクトです。

```powershell
npm run ci
npm run deploy
```

デプロイ後はcustom domain、robots、sitemap、canonical、OGP、意図しないnoindexがないことを確認します。詳しい確認とロールバックは [リリース手順](docs/releasing.md) を参照してください。

Search Console、Bing Webmaster Tools、GA4、Cloudflare Web Analyticsは管理画面の証拠が揃うまで「完了」と扱いません。現状は [サイトガバナンス](docs/site-governance.md) が正本です。

## データと外部依存

日本語名、検索用カタログ、コピー用テーマ／プロンプト、611枚のふわふわ画像はこのアプリに同梱します。通常モードのモチーフ画像とデザインボードは原作配信元 `https://morphos.ameyanagi.com/` を参照します。境界と障害時の影響は [アーキテクチャ](docs/architecture.md) にまとめています。

## ライセンス

原作と同じく Apache-2.0 または MIT のデュアルライセンスです。詳細は `LICENSE-APACHE` と `LICENSE-MIT` を参照してください。
