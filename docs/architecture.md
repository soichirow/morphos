# アーキテクチャ

## 全体像

```text
URL query / localStorage
        |
TanStack Router + React UI
        |
Catalog domain (検索・分類・選択・共有)
        |
+-------------------+----------------------+--------------------+
| bundled catalog   | local gentle assets  | upstream originals |
| names/themes/text | 611 WebP drawings    | motifs and boards  |
+-------------------+----------------------+--------------------+
        |
Cloudflare Pages static output (.output/public)
```

## ドメイン

- `MorphousSystem`: 1つのデザインシステム。slug、日英名、分類、palette、assets、promptsを持つ
- `GallerySearch`: URLで共有できる `system`、`q`、`category`、`sort`
- `MotifDisplayMode`: `fluffy`、`mosaic`、`normal` の閉じたunion型
- `CatalogCriteria`: 検索・分類・色・並び順の条件

URL値は `normalizeGallerySearch` で対応する型へ正規化し、未知のsort等をドメインへ持ち込みません。ランダム選択は `pickRandomSystemSlug` が「候補が複数なら現在選択を返さない」を保証します。

## データ境界

| 種類                       | 配置                   | 実行時の取得先          | 失敗時の影響                                |
| -------------------------- | ---------------------- | ----------------------- | ------------------------------------------- |
| 日英名・検索用カタログ     | `src/data`             | JSバンドル              | アプリ全体に必要                            |
| コピー用テーマ・プロンプト | `MorphousSystem`       | JSバンドル              | CSS/JSON/プロンプトコピーに必要             |
| ふわふわ画像               | `public/gentle-motifs` | 同一origin              | ふわふわ表示に必要                          |
| 通常モチーフ・ボード       | catalog内の絶対URL     | `morphos.ameyanagi.com` | 通常/モザイク画像、一部スモークテストに影響 |
| sitemap・robots            | build script           | 同一origin              | 検索発見性に影響                            |

原作から継承した `public/systems` の追跡ファイルがGit履歴に残っていますが、このフォークの現行Cloudflareビルドはsparse checkoutで同ディレクトリを展開せず、カタログ内の絶対URLを使います。通常cloneとsparse checkoutの成果物差を避けることは今後のビルド改善課題であり、リリース時には `.output/public/systems` が存在しないことを確認します。

## 状態の所有者

- URL query: 共有可能な選択・検索状態
- localStorage: 言語、お気に入り、表示モード、パレット調整、分析同意
- React state/reducer: ライトボックス、テーマ明暗、モバイル結果表示など一時状態
- 管理画面: GSC、Bing、GA4、Cloudflare Web Analytics。リポジトリ設定だけで完了とはしない

## 画像の安全境界

ふわふわモードはモチーフをローカルらくがきへ置換します。ボード等はモザイク表示にし、クリック拡大とダウンロードを無効化します。モザイクモードも同様にダウンロードを無効化します。アセット欄とデザインボードは通常モードだけが元画像の拡大・ダウンロードを許可します。大きなヒーローモチーフには、ふわふわ／モザイク中でも「元画像を見る」を明示選択した後だけ通常画像へ切り替える別の解除契約があります。

モザイクは秘匿化ではありません。ブラウザは元画像を取得してCSSでぼかすため、ネットワークや開発者ツールから元URLを知ることはできます。目的は不意の視覚刺激を減らすことです。

## 配信

Vite/TanStack Startが静的出力を `.output/public` に作り、`scripts/prepare-cloudflare.mjs` が404、sitemap、robots等を整えます。正本はCloudflare Pages `morphos-ja`、canonical originは `https://morphos.so1ro.com` です。
