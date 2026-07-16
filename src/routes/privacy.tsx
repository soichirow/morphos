import { Link, createFileRoute } from "@tanstack/react-router"

import { openAnalyticsSettings } from "@/components/analytics-consent"
import { pageMetadata } from "@/lib/i18n"
import { useLanguage } from "@/lib/i18n-context"
import { absoluteSiteUrl } from "@/lib/site-config"

const metadata = pageMetadata("ja", "/privacy/")

export const Route = createFileRoute("/privacy")({
  component: PrivacyRoute,
  head: () => ({
    meta: [
      { title: metadata.title },
      { name: "description", content: metadata.description },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: metadata.title },
      { property: "og:description", content: metadata.description },
      { property: "og:url", content: absoluteSiteUrl("/privacy/") },
    ],
    links: [{ rel: "canonical", href: absoluteSiteUrl("/privacy/") }],
  }),
})

const content = {
  ja: {
    heading: "プライバシー方針",
    updated: "最終更新: 2026年7月15日",
    intro:
      "このページでは、Morphous 日本語版がブラウザに保存する情報とアクセス解析の扱いを説明します。",
    localTitle: "ブラウザ内に保存する情報",
    localBody:
      "表示言語、お気に入り、パレット調整、アクセス解析への同意設定をlocalStorageに保存します。これらは原則としてお使いのブラウザ内に留まります。",
    cfTitle: "Cloudflare Web Analytics",
    cfBody:
      "ページ閲覧数とCore Web Vitalsの把握に、Cloudflare Web Analyticsを利用する場合があります。Cloudflareの仕組みはCookieを使用せず、個人を追跡する目的では利用しません。",
    gaTitle: "Google Analytics 4",
    gaBody:
      "Google Analytics 4は、サイト上で明示的に分析を許可した場合だけ読み込まれます。広告用ストレージ、広告ユーザーデータ、広告パーソナライズは常に無効です。同意はいつでも変更できます。",
    assetsTitle: "外部アセット",
    assetsBody:
      "画像やテーマJSONなど一部のカタログアセットは、原作サイト morphos.ameyanagi.com から取得します。その際、配信元には通常のWebアクセス情報が送られます。",
    contactTitle: "お問い合わせ",
    contactBody:
      "本方針については、GitHubリポジトリのIssueからお問い合わせください。",
    settings: "アクセス解析の設定を変更",
    back: "トップへ戻る",
  },
  en: {
    heading: "Privacy policy",
    updated: "Last updated: July 15, 2026",
    intro:
      "This page explains what Morphous stores in your browser and how analytics are handled.",
    localTitle: "Data stored in your browser",
    localBody:
      "Language, favorites, palette adjustments, and analytics consent are stored in localStorage and normally remain in your browser.",
    cfTitle: "Cloudflare Web Analytics",
    cfBody:
      "We may use Cloudflare Web Analytics for page views and Core Web Vitals. It does not use cookies and is not used to identify individual visitors.",
    gaTitle: "Google Analytics 4",
    gaBody:
      "Google Analytics 4 loads only after you explicitly allow analytics. Advertising storage, ad user data, and ad personalization remain disabled. You can change your choice at any time.",
    assetsTitle: "External assets",
    assetsBody:
      "Some catalog images and theme JSON files are loaded from the original morphos.ameyanagi.com site. Standard web request information is sent to that host.",
    contactTitle: "Contact",
    contactBody:
      "For questions about this policy, please open an issue in the GitHub repository.",
    settings: "Change analytics preferences",
    back: "Back to home",
  },
} as const

function PrivacyRoute() {
  const { language } = useLanguage()
  const text = content[language]
  return (
    <main className="mx-auto min-h-svh max-w-3xl px-4 py-12 text-foreground sm:px-6 sm:py-16">
      <Link to="/" className="text-sm font-medium text-primary hover:underline">
        ← {text.back}
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
        {text.heading}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{text.updated}</p>
      <p className="mt-6 leading-7 text-muted-foreground">{text.intro}</p>
      <div className="mt-10 space-y-8">
        {[
          [text.localTitle, text.localBody],
          [text.cfTitle, text.cfBody],
          [text.gaTitle, text.gaBody],
          [text.assetsTitle, text.assetsBody],
          [text.contactTitle, text.contactBody],
        ].map(([sectionTitle, body]) => (
          <section key={sectionTitle}>
            <h2 className="text-xl font-semibold">{sectionTitle}</h2>
            <p className="mt-2 leading-7 text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>
      <button
        type="button"
        onClick={openAnalyticsSettings}
        className="mt-10 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
      >
        {text.settings}
      </button>
    </main>
  )
}
