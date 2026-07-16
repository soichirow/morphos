# Morphous 日本語版 サイトガバナンス

最終更新: 2026-07-15
対象: `https://morphos-ja.pages.dev/`
管理者: soichirow / Cloudflare・Google・Microsoft各アカウントの管理者
是正期限: 2026-08-14（既存公開サイトのため30日以内）

## 公開URLの正本

- canonical origin: `VITE_SITE_URL`
- 現在の既定値: `https://morphos-ja.pages.dev`
- canonical pages:
  - `/`
  - `/gallery/`
  - `/privacy/`
- `?system=<slug>` は共有・アプリ状態復元用。独立したHTML本文を持たないため、canonicalは `/gallery/` としsitemapには載せない。
- 個別システムを検索対象にする場合は、固有title・description・canonical・本文をSSR/静的HTMLで提供する `/systems/<slug>/` を先に実装する。

カスタムドメインへ移行する場合は、同一リリースで以下をすべて更新する。

1. Cloudflare Pagesのcustom domain
2. `VITE_SITE_URL`
3. `robots.txt` と `sitemap.xml`（ビルドで自動生成）
4. canonical / Open Graph URL
5. GSC・Bing・GA4・Cloudflare Web Analyticsの対象hostname
6. 旧originから新originへの恒久redirect

## リリースゲート

| 項目                     | リポジトリ側                            | 管理画面側                | 現在の状態                |
| ------------------------ | --------------------------------------- | ------------------------- | ------------------------- |
| sitemap                  | canonical絶対URLだけを自動生成          | GSC/Bingへ送信            | 実装済み / 送信未確認     |
| robots.txt               | sitemap絶対URLを同一originから生成      | 本番200確認               | 実装済み / 本番未確認     |
| canonical                | `/`, `/gallery/`, `/privacy/` に絶対URL | URL検査                   | 実装済み / 本番未確認     |
| meta robots              | `index,follow`                          | HTML・HTTP header確認     | 実装済み / 本番未確認     |
| Google Search Console    | DNSまたは環境変数metaに対応             | 所有権確認・sitemap送信   | 要管理者確認              |
| Bing Webmaster Tools     | meta環境変数に対応                      | GSC importを優先          | 要管理者確認              |
| GA4                      | 同意後のみ読み込み、広告系は常時denied  | stream作成・page_view実測 | 要管理者確認              |
| Cloudflare Web Analytics | 自動挿入を阻害しないheader              | Pages MetricsでEnable     | 要管理者確認              |
| プライバシー             | `/privacy/` と同意変更UI                | 法令・運用方針確認        | 実装済み / 管理者確認待ち |

「完了」は管理画面の画面または管理者の明示確認と、本番ネットワーク検証が揃った時だけ使用する。

## 環境変数

Cloudflare Pagesの Production environment に設定する。Gitへ検証トークンや資格情報を書かない。

```text
VITE_SITE_URL=https://morphos-ja.pages.dev
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=
VITE_BING_SITE_VERIFICATION=
```

- GSCは可能ならDNSでDomain propertyを確認し、Google verification metaは空にする。
- Bingは確認済みGSC propertyからimportし、Bing verification metaは空にする。
- 上記IDは公開設定値だが、アカウント資格情報・API token・DNS tokenは環境変数にもGitにも置かない。

## Google Search Console

担当: Cloudflare DNSとGoogleアカウントへアクセスできる管理者
期限: 2026-08-14

1. Search ConsoleでDomain propertyを追加する。
2. Cloudflare DNSへ、Googleが提示したTXTを管理画面から設定する。
3. 所有権確認後、`https://morphos-ja.pages.dev/sitemap.xml` を送信する。
4. `/`, `/gallery/`, `/privacy/` をURL検査し、live testで次を確認する。
   - crawl allowed
   - indexing allowed
   - user-declared canonicalが期待URL
   - 意図しない`noindex`がない
5. 管理者はproperty名、確認日、sitemap成功画面をIssueまたは運用記録へ残す。TXT値自体は残さない。

## Bing Webmaster Tools

担当: Microsoft/Bingアカウント管理者
期限: GSC確認から7日以内、遅くとも2026-08-14

1. Bing Webmaster Toolsで「Import from Google Search Console」を選ぶ。
2. 対象propertyとsitemapをimportする。
3. URL Inspectionで代表3ページを検査する。
4. importできない場合だけDNSまたは `VITE_BING_SITE_VERIFICATION` を使う。

## Google Analytics 4

担当: Google Analytics管理者
期限: 2026-08-14

1. 既存のMorphous用property / Web data streamがないか確認し、二重作成しない。
2. Web streamのhostnameをcanonical originへ合わせる。
3. Measurement IDをCloudflare Pagesの `VITE_GA4_MEASUREMENT_ID` に設定して再デプロイする。
4. 同意前に以下を確認する。
   - `googletagmanager.com` へのリクエストがない
   - `_ga` 等の分析Cookieがない
5. 「分析を許可」後にDebugViewまたはRealtimeで `page_view` を確認する。
6. `/` → `/gallery/` → `/privacy/` のSPA遷移がそれぞれ1回だけ計測されることを確認する。
7. 「許可しない」へ変更後、新規page_viewが送信されないことを確認する。

本実装では `analytics_storage` だけを同意後にgrantedとし、`ad_storage`、`ad_user_data`、`ad_personalization` は常にdeniedにする。

## Cloudflare Web Analytics

担当: Cloudflareアカウント管理者
期限: 2026-08-14

1. Workers & Pages → `morphos-ja` → Metricsを開く。
2. Web AnalyticsのEnableを選ぶ。
3. 次のデプロイで自動挿入されることを確認する。
4. コードへ手動beaconを追加しない（二重page view防止）。
5. 本番Networkで `static.cloudflareinsights.com` とbeacon送信を確認する。
6. DashboardでPVとCore Web Vitalsが表示されることを確認する。

Cloudflareの自動挿入を妨げるため、`Cache-Control: public, no-transform` は設定しない。

## 本番検証コマンド

```powershell
$origin = "https://morphos-ja.pages.dev"
Invoke-WebRequest "$origin/robots.txt"
Invoke-WebRequest "$origin/sitemap.xml"
Invoke-WebRequest "$origin/"
Invoke-WebRequest "$origin/gallery/"
Invoke-WebRequest "$origin/privacy/"
```

ブラウザでは、HTML sourceとElementsの両方でtitle、description、canonical、meta robotsを確認する。HTTP responseに意図しない `X-Robots-Tag: noindex` がないことも確認する。

## 定期確認

- 毎月: GSC/Bingのcrawl・indexエラー、GA4 page_view、Cloudflare Core Web Vitals
- リリース後24時間以内: 404、canonical drift、重複タグ、同意前Cookie
- ドメイン・route変更時: この文書のリリースゲートを最初から再実施
