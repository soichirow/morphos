# リリース手順

## 正本

- Cloudflare Pages project: `morphos-ja`
- custom domain: `https://morphos.so1ro.com`
- build output: `.output/public`
- deploy command: `npm run deploy`
- Git branch: `codex/morphos-ja-launch` で検証し、レビュー後にmainへ統合

GitHub Pagesは公開正本ではありません。Cloudflare Direct Uploadと二重配信しません。

## 1. 変更範囲を確認

```powershell
git status --short
git diff --check
git diff
```

生成物、秘密情報、管理画面トークン、`.env` をコミットしません。通常cloneでもCloudflare成果物を一定にするため、`.output/public/systems` がないことを確認します。

## 2. 品質ゲート

```powershell
npm run lint
npm run typecheck
npm test
npm run generate:catalog:check
npm run validate:catalog
npm run build:cloudflare
npm run test:e2e
```

まとめて実行する場合:

```powershell
npm run ci
```

外部配信元だけを再確認する場合は `npm run test:e2e:upstream` を使います。

## 3. コミットとpush

```powershell
git add <確認したファイル>
git commit -m "<変更内容>"
git push origin codex/morphos-ja-launch
```

レビュー対象と無関係なユーザー変更を混ぜません。

## 4. Cloudflareへデプロイ

Wranglerで対象アカウントへログイン済みであることを確認し、秘密情報を出力しないで実行します。

```powershell
npm run deploy
```

Wranglerが返したdeployment URL、Git commit SHA、実行日時をリリース記録へ残します。custom domainの反映はdeployment URLとは別に確認します。

## 5. 本番検証

```powershell
$origin = "https://morphos.so1ro.com"
Invoke-WebRequest "$origin/"
Invoke-WebRequest "$origin/gallery/"
Invoke-WebRequest "$origin/privacy/"
Invoke-WebRequest "$origin/robots.txt"
Invoke-WebRequest "$origin/sitemap.xml"
Invoke-WebRequest "$origin/og-image.png"
```

代表ページで次を確認します。

- HTTP 200
- title、description、canonical、og:url、og:imageがcustom domain
- meta robotsと`X-Robots-Tag`に意図しないnoindexがない
- robotsが絶対URLのsitemapを指す
- sitemapがcanonicalかつindexableな3ページだけ
- ふわふわが初期表示で、元画像ダウンロード導線がない
- 共有URL、お気に入り、コピー、日英切り替え、ランダム表示
- console/pageerrorがない

Cloudflareのcacheを考慮し、必要なら検証URLに無害なcache-busting queryを付けます。

## 6. 分析・検索の確認

GSC、Bing、GA4、Cloudflare Web Analyticsは [site-governance.md](site-governance.md) の管理画面ゲートに従います。コードが入っているだけでは完了にしません。対象commit、deployment、確認者、確認日、画面証跡の保存先を運用記録へ残します。

## ロールバック

1. Cloudflare PagesのDeploymentsで直前の正常deploymentを確認する
2. 管理画面のrollback/再デプロイ機能で正常deploymentをproductionへ戻す
3. custom domainを再検証する
4. 原因commitをrevertする。共有履歴を`reset --hard`で書き換えない
5. 修正後に品質ゲートと本番検証を最初から行う

ロールバック後もGSC/GA4等の完了状態を推測で更新しません。
