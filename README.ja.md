# モーファス

[Ameyanagi/morphos](https://github.com/Ameyanagi/morphos) を基にした日本語フォークです。
自然をモチーフにした611種類のデザインシステムを検索・閲覧できます。

公開版: https://morphos.so1ro.com/

## 日本語版の追加機能

- 主要画面、メタデータ、ナビゲーションの日本語化
- 選択中のシステムを `?system=<slug>` で表す共有URL
- 共有URLのワンクリックコピー
- localStorageを使ったお気に入り保存
- Cloudflare Pages向けの軽量ビルドとデプロイ設定

## アセットについて

このフォークでは巨大な画像一式を複製せず、原作の公開アセット
`https://morphos.ameyanagi.com/` を参照します。コードとUIはこのリポジトリ、
画像・テーマJSON・生成プロンプトなどのカタログアセットは原作配信元から読み込みます。

## 開発

```bash
npm install
npm run dev
```

テストとビルド:

```bash
npm test
npm run typecheck
npm run build:cloudflare
```

Cloudflare Pagesへのデプロイ:

```bash
