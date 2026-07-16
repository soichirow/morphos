import { expect, test } from "@playwright/test"

const systemSlug = "morphous-artichoke"
const systemSourceName = "Artichoke"
const systemDisplayName = "アーティチョーク"
const motifDisplayName = "アーティチョークのつぼみ"

test.beforeEach(async ({ page }) => {
  await page.goto(`/gallery/?system=${systemSlug}`, {
    waitUntil: "domcontentloaded",
  })
  await expect(
    page.getByRole("heading", { name: systemDisplayName, exact: true })
  ).toBeVisible()
})

test("ファーストビューで3つの画像表示モードを選んで保存できる", async ({
  page,
}) => {
  const modeGroup = page.getByRole("group", { name: "表示モード" })
  const search = page.getByPlaceholder("モチーフ・カテゴリ・プロンプトを検索")
  await expect(modeGroup).toBeVisible()
  await expect(page.getByRole("button", { name: "ふわふわモード" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await expect(page.getByRole("button", { name: "モザイクモード" })).toBeVisible()
  await expect(page.getByRole("button", { name: "通常モード" })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "刺激を抑えて表示" })
  ).toHaveCount(0)

  const modeBox = await modeGroup.boundingBox()
  const searchBox = await search.boundingBox()
  expect(modeBox).not.toBeNull()
  expect(searchBox).not.toBeNull()
  expect(modeBox!.y).toBeLessThan(searchBox!.y)
  expect(modeBox!.y + modeBox!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height
  )

  await page.getByRole("button", { name: "モザイクモード" }).click()
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("morphous:motif-display-mode")
      )
    )
    .toBe("mosaic")
  await expect(
    page.getByRole("img", {
      name: `${motifDisplayName}のモザイク表示`,
    }).last()
  ).toBeVisible()

  await page.reload({ waitUntil: "domcontentloaded" })
  await expect(page.getByRole("button", { name: "モザイクモード" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await page.getByRole("button", { name: "通常モード" }).click()
  await expect(page.locator(`img[alt="${motifDisplayName} motif"]`).last()).toBeVisible()
})

test("スマホのファーストビューでも3モードが横幅内に収まる", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })

  const modeGroup = page.getByRole("group", { name: "表示モード" })
  await expect(modeGroup).toBeVisible()
  const groupBox = await modeGroup.boundingBox()
  expect(groupBox).not.toBeNull()
  expect(groupBox!.x).toBeGreaterThanOrEqual(0)
  expect(groupBox!.x + groupBox!.width).toBeLessThanOrEqual(390)
  expect(groupBox!.y + groupBox!.height).toBeLessThanOrEqual(844)

  for (const name of [
    "ふわふわモード",
    "モザイクモード",
    "通常モード",
  ]) {
    const button = page.getByRole("button", { name })
    await expect(button).toBeVisible()
    const box = await button.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
  }
})

test("共有URL、検索、お気に入り、コピー、言語切替が実ブラウザで連動する", async ({
  page,
}) => {
  const search = page.getByPlaceholder("モチーフ・カテゴリ・プロンプトを検索")
  await search.fill("artichoke mediterranean")
  await expect(page).toHaveURL(/q=artichoke(?:\+|%20)mediterranean/)
  await expect(
    page.getByRole("heading", { name: systemDisplayName, exact: true })
  ).toBeVisible()

  const favorite = page.getByRole("button", { name: "お気に入りに追加" })
  await favorite.click()
  await expect(
    page.getByRole("button", { name: "お気に入りから外す" })
  ).toHaveAttribute("aria-pressed", "true")
  await page.reload({ waitUntil: "domcontentloaded" })
  await expect(
    page.getByRole("button", { name: "お気に入りから外す" })
  ).toHaveAttribute("aria-pressed", "true")

  await page.getByRole("button", { name: "theme.jsonをコピー" }).click()
  const copiedJson = await page.evaluate(() => navigator.clipboard.readText())
  expect(JSON.parse(copiedJson)).toMatchObject({
    schema: "morphous.theme.v1",
    identity: {
      name: systemSourceName,
      slug: systemSlug,
    },
  })

  await page.getByRole("button", { name: "SNSでシェア" }).click()
  await page.getByRole("button", { name: "URLをコピー" }).click()
  const shareUrl = new URL(
    await page.evaluate(() => navigator.clipboard.readText())
  )
  expect(["/gallery", "/gallery/"]).toContain(shareUrl.pathname)
  expect(shareUrl.searchParams.get("system")).toBe(systemSlug)
  expect(Array.from(shareUrl.searchParams.keys())).toEqual(["system"])

  await page.getByRole("button", { name: "English" }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(
    page.getByPlaceholder("Search motif, category, prompt")
  ).toBeVisible()
  await expect(page).toHaveTitle("Design system gallery | Morphous")
})

test("日本語名を主表示し、英名を補助表示として残す", async ({ page }) => {
  await page.goto("/gallery/?system=morphous-abalone", {
    waitUntil: "domcontentloaded",
  })

  const japaneseHeading = page.getByRole("heading", {
    name: "アワビ",
    exact: true,
  })
  await expect(japaneseHeading).toBeVisible()
  await expect(
    japaneseHeading.locator("xpath=following-sibling::p[1]")
  ).toHaveText("Morphous Abalone")

  await page.getByRole("button", { name: "SNSでシェア" }).click()
  const xShareHref = await page
    .getByRole("link", { name: "X", exact: true })
    .getAttribute("href")
  expect(xShareHref).not.toBeNull()
  const xShareUrl = new URL(xShareHref!)
  expect(xShareUrl.searchParams.get("text")).toContain(
    "アワビ（Morphous Abalone）"
  )

  await page.getByRole("button", { name: "English" }).click()
  await expect(
    page.getByRole("heading", { name: "Morphous Abalone", exact: true })
  ).toBeVisible()

  await page.getByRole("button", { name: "日本語" }).click()
  await expect(
    page.getByRole("heading", { name: "アワビ", exact: true })
  ).toBeVisible()

  const search = page.getByPlaceholder("モチーフ・カテゴリ・プロンプトを検索")
  await search.fill("キヌガサタケ")
  const japaneseResult = page.getByRole("button", {
    name: /^キヌガサタケ/,
  })
  await expect(japaneseResult).toBeVisible()
  await japaneseResult.click()
  await expect(
    page.getByRole("heading", { name: "キヌガサタケ", exact: true })
  ).toBeVisible()
  await expect(page).toHaveURL(/system=morphous-veiled-lady/)
})

test("選択中のデザインを国内外の主要SNSへ共有できる", async ({ page }) => {
  await page.getByRole("button", { name: "SNSでシェア" }).click()

  for (const name of [
    "X",
    "Facebook",
    "LinkedIn",
    "Bluesky",
    "Reddit",
    "WhatsApp",
    "Telegram",
  ]) {
    await expect(page.getByRole("link", { name, exact: true })).toBeVisible()
  }

  const xShareHref = await page
    .getByRole("link", { name: "X", exact: true })
    .getAttribute("href")
  expect(xShareHref).not.toBeNull()
  const xShare = new URL(xShareHref!)
  expect(xShare.origin + xShare.pathname).toBe(
    "https://twitter.com/intent/tweet"
  )
  const sharedPage = new URL(xShare.searchParams.get("url") ?? "")
  expect(sharedPage.searchParams.get("system")).toBe(systemSlug)
  expect(xShare.searchParams.get("text")).toContain(
    `${systemDisplayName}（${systemSourceName}）`
  )
})

test("システム固有パスは共有可能なクエリURLへ正規化される", async ({
  page,
}) => {
  const extensionless = await page.request.get(
    `/gallery?system=${systemSlug}`,
    {
      maxRedirects: 0,
    }
  )
  expect(extensionless.status()).toBe(308)
  expect(extensionless.headers().location).toBe(
    `/gallery/?system=${systemSlug}`
  )

  await page.goto(`/systems/${systemSlug}`, { waitUntil: "domcontentloaded" })
  await expect(page).toHaveURL(new RegExp(`/gallery/?\\?system=${systemSlug}`))
  await expect(
    page.getByRole("heading", { name: systemDisplayName, exact: true })
  ).toBeVisible()
})

test("高解像度モチーフを開き、キーボードで閉じられる", async ({ page }) => {
  const normalMode = page.getByRole("button", {
    name: "通常モード",
  })
  await normalMode.click()
  await expect(normalMode).toHaveAttribute("aria-pressed", "true")
  await page
    .getByRole("button", {
      name: `${motifDisplayName}の高解像度モチーフを表示`,
    })
    .click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toBeHidden()
})

test("代表的なupstreamアセットが実際に取得・解釈できる", async ({
  page,
  request,
}) => {
  const prefix = `https://morphos.ameyanagi.com/systems/${systemSlug}`
  for (const path of [
    "motif.png",
    "design-system-light.png",
    "design-system-dark.png",
  ]) {
    const response = await request.get(`${prefix}/${path}`)
    expect(response.ok()).toBe(true)
    expect(response.headers()["content-type"]).toMatch(/^image\//)
  }
  for (const path of ["theme.json", "prompts.json"]) {
    const response = await request.get(`${prefix}/${path}`)
    expect(response.ok()).toBe(true)
    const payload: unknown = await response.json()
    expect(payload).toBeTruthy()
  }
  const normalMode = page.getByRole("button", {
    name: "通常モード",
  })
  await normalMode.click()
  await expect(normalMode).toHaveAttribute("aria-pressed", "true")
  const motif = page.locator(`img[alt="${motifDisplayName} motif"]`).last()
  await expect(motif).toBeVisible()
  await expect
    .poll(() =>
      motif.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0
      )
    )
    .toBe(true)
})

test("画面操作から実際のPowerPoint生成を開始できる", async ({ page }) => {
  test.slow()
  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "PowerPointをダウンロード" }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe(`${systemSlug}.pptx`)
  const stream = await download.createReadStream()
  expect(stream.readable).toBe(true)

  const wordPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Wordをダウンロード" }).click()
  const word = await wordPromise
  expect(word.suggestedFilename()).toBe(`${systemSlug}.docx`)
  const wordStream = await word.createReadStream()
  expect(wordStream.readable).toBe(true)
})

test("sitemap、robots、canonical、privacyが本番相当配信で整合する", async ({
  page,
  request,
}) => {
  const robotsResponse = await request.get("/robots.txt")
  expect(robotsResponse.ok()).toBe(true)
  const robots = await robotsResponse.text()
  expect(robots).toContain("Sitemap: https://morphos-ja.pages.dev/sitemap.xml")

  const sitemapResponse = await request.get("/sitemap.xml")
  expect(sitemapResponse.ok()).toBe(true)
  const sitemap = await sitemapResponse.text()
  expect(sitemap.match(/<url>/g)).toHaveLength(3)
  expect(sitemap).toContain("<loc>https://morphos-ja.pages.dev/gallery/</loc>")
  expect(sitemap).toContain("<loc>https://morphos-ja.pages.dev/privacy/</loc>")
  expect(sitemap).not.toContain("?system=")

  const ogImageResponse = await request.get("/og-image.png")
  expect(ogImageResponse.ok()).toBe(true)
  expect(ogImageResponse.headers()["content-type"]).toMatch(/^image\/png/)
  expect((await ogImageResponse.body()).byteLength).toBeGreaterThan(10_000)

  await page.goto("/gallery/?system=morphous-artichoke", {
    waitUntil: "domcontentloaded",
  })
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://morphos-ja.pages.dev/gallery/"
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index,follow/
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://morphos-ja.pages.dev/og-image.png"
  )
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "デザインシステム一覧 | Morphous 日本語版"
  )
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image"
  )
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    "https://morphos-ja.pages.dev/og-image.png"
  )
  expect(
    await page.locator('script[src*="googletagmanager.com"]').count()
  ).toBe(0)
  expect(await page.context().cookies()).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: expect.stringMatching(/^_ga/) }),
    ])
  )

  await page.goto("/privacy/", { waitUntil: "domcontentloaded" })
  await expect(
    page.getByRole("heading", { name: "プライバシー方針" })
  ).toBeVisible()
  await expect(page).toHaveTitle("プライバシー方針 | Morphous 日本語版")
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://morphos-ja.pages.dev/privacy/"
  )
})

test("全モチーフの刺激を抑え、らくがき未対応はモザイクへフォールバックする", async ({
  page,
}) => {
  const pageErrors: Array<string> = []
  page.on("pageerror", (error) => pageErrors.push(error.message))

  await page.goto("/gallery/?system=morphous-emerald-cockroach", {
    waitUntil: "domcontentloaded",
  })

  await expect(
    page
      .getByRole("img", {
        name: "エメラルドゴキブリバチのらくがき表示",
      })
      .last()
  ).toBeVisible()
  await expect(
    page.locator('img[alt="エメラルドゴキブリバチ motif"]')
  ).toHaveCount(0)

  const fluffyMode = page.getByRole("button", {
    name: "ふわふわモード",
    exact: true,
  })
  await expect(fluffyMode).toHaveAttribute("aria-pressed", "true")
  const mosaicMode = page.getByRole("button", { name: "モザイクモード", exact: true })
  await mosaicMode.click()
  await expect(mosaicMode).toHaveAttribute("aria-pressed", "true")
  await expect(
    page
      .getByRole("img", {
        name: "エメラルドゴキブリバチのモザイク表示",
      })
      .last()
  ).toBeVisible()

  await fluffyMode.click()
  await expect(fluffyMode).toHaveAttribute("aria-pressed", "true")
  await page.goto("/gallery/?system=morphous-artichoke", {
    waitUntil: "domcontentloaded",
  })
  await expect(
    page
      .getByRole("img", {
        name: "アーティチョークのつぼみのモザイク表示",
      })
      .last()
  ).toBeVisible()
  await expect(
    page.locator('img[src="/gentle-motifs/morphous-artichoke.webp"]')
  ).toHaveCount(0)

  const normalMode = page.getByRole("button", {
    name: "通常モード",
  })
  await normalMode.click()
  await expect(normalMode).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.locator('img[alt="アーティチョークのつぼみ motif"]').last()
  ).toBeVisible()
  expect(pageErrors).toEqual([])
})

test("大分類から探せて、細分類の日英表示と選択中の詳細が同期する", async ({
  page,
}) => {
  const smallLife = page.getByRole("button", {
    name: "昆虫など",
    exact: true,
  })
  await smallLife.click()

  await expect
    .poll(() => new URL(page.url()).searchParams.get("category"))
    .toBe("group:small-life")
  await expect(smallLife).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.getByText("66件のシステム", { exact: true }).last()
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "アーティチョーク", exact: true })
  ).toHaveCount(0)

  await page.getByRole("button", { name: "English" }).click()
  await expect(
    page.getByRole("button", { name: "Small creatures", exact: true })
  ).toBeVisible()
  await page.getByLabel("Detailed category").selectOption("insect")
  await expect(page.getByLabel("Detailed category")).toHaveValue("insect")
  await expect(
    page.getByLabel("Detailed category").locator('option[value="insect"]')
  ).toHaveText("Insects")
})

test("カテゴリ付き共有URLは指定したシステムをカテゴリ先頭へ置き換えない", async ({
  page,
}) => {
  await page.goto(
    "/gallery/?system=morphous-emerald-cockroach&category=group%3Asmall-life",
    { waitUntil: "domcontentloaded" }
  )

  await expect(
    page.getByRole("heading", {
      name: "エメラルドゴキブリバチ",
      exact: true,
    })
  ).toBeVisible()
  await expect
    .poll(() => new URL(page.url()).searchParams.get("system"))
    .toBe("morphous-emerald-cockroach")
})
