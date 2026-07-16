import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"

import appCss from "../styles.css?url"
import { AnalyticsConsentControl } from "@/components/analytics-consent"
import { GentleImagesProvider } from "@/lib/gentle-images-context"
import { LanguageProvider } from "@/lib/i18n-context"
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config"

const siteTitle = "Morphous 日本語版 - 自然から生まれたデザインシステム"
const siteDescription =
  "自然をモチーフにしたデザインシステム、生成アセット、再利用できるプロンプト、shadcn対応CSSテーマのカタログです。"
const socialImage = absoluteSiteUrl("/og-image.png")
const verificationMeta = [
  ...(siteConfig.googleSiteVerification
    ? [
        {
          name: "google-site-verification",
          content: siteConfig.googleSiteVerification,
        },
      ]
    : []),
  ...(siteConfig.bingSiteVerification
    ? [{ name: "msvalidate.01", content: siteConfig.bingSiteVerification }]
    : []),
]
const websiteStructuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Morphous 日本語版",
  url: absoluteSiteUrl("/"),
  description: siteDescription,
  inLanguage: ["ja", "en"],
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: siteTitle,
      },
      {
        name: "description",
        content: siteDescription,
      },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large",
      },
      {
        name: "application-name",
        content: "Morphous",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Morphous",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "theme-color",
        content: "#101713",
      },
      {
        name: "msapplication-TileColor",
        content: "#101713",
      },
      {
        name: "msapplication-config",
        content: "/browserconfig.xml",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Morphous 日本語版",
      },
      {
        property: "og:locale",
        content: "ja_JP",
      },
      {
        property: "og:locale:alternate",
        content: "en_US",
      },
      {
        property: "og:title",
        content: siteTitle,
      },
      {
        property: "og:description",
        content: siteDescription,
      },
      {
        property: "og:url",
        content: absoluteSiteUrl("/"),
      },
      {
        property: "og:image",
        content: socialImage,
      },
      {
        property: "og:image:secure_url",
        content: socialImage,
      },
      {
        property: "og:image:type",
        content: "image/png",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content: "自然をモチーフにしたMorphousデザインシステムのカタログ",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: siteTitle,
      },
      {
        name: "twitter:description",
        content: siteDescription,
      },
      {
        name: "twitter:image",
        content: socialImage,
      },
      {
        name: "twitter:image:alt",
        content: "Morphous 日本語版 - 自然から生まれたデザインシステム",
      },
      ...verificationMeta,
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "any",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "mask-icon",
        href: "/safari-pinned-tab.svg",
        color: "#72c99b",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: websiteStructuredData,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>お探しのページは見つかりませんでした。</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        <LanguageProvider>
          <GentleImagesProvider>
            {children}
            <AnalyticsConsentControl />
            <Scripts />
          </GentleImagesProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
