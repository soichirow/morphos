import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright"

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const backgroundPath = join(projectRoot, "assets", "og-background.png")
const outputPath = join(projectRoot, "public", "og-image.png")
const background = await readFile(backgroundPath)
const backgroundData = `data:image/png;base64,${background.toString("base64")}`

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; margin: 0; }
      body {
        overflow: hidden;
        color: #f4f7f4;
        background: #101713 url("${backgroundData}") center / cover no-repeat;
        font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", "Noto Sans JP", system-ui, sans-serif;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, rgba(5, 14, 10, .92) 0%, rgba(5, 14, 10, .74) 49%, rgba(5, 14, 10, .14) 76%),
          linear-gradient(0deg, rgba(5, 14, 10, .72) 0%, transparent 35%);
      }
      main {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 54px 64px 46px;
        display: flex;
        flex-direction: column;
      }
      .edition {
        align-self: flex-start;
        padding: 10px 17px 9px;
        border: 1px solid rgba(172, 231, 199, .48);
        border-radius: 999px;
        background: rgba(19, 53, 38, .62);
        color: #c9f4dc;
        font: 700 17px/1.1 system-ui, sans-serif;
        letter-spacing: .08em;
      }
      .content {
        margin-top: 66px;
        max-width: 760px;
      }
      .brand {
        margin: 0;
        font-size: 68px;
        line-height: 1.06;
        font-weight: 800;
        letter-spacing: -.035em;
        text-shadow: 0 3px 22px rgba(0, 0, 0, .4);
      }
      .brand span { color: #8ee0b4; }
      .ja {
        margin: 25px 0 0;
        font-size: 34px;
        line-height: 1.35;
        font-weight: 700;
        letter-spacing: .015em;
      }
      .en {
        margin: 10px 0 0;
        color: #c5d4cb;
        font: 500 23px/1.35 system-ui, sans-serif;
        letter-spacing: .025em;
      }
      footer {
        margin-top: auto;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
      }
      .url {
        font: 700 21px/1 system-ui, sans-serif;
        letter-spacing: .04em;
        color: #e9f8ef;
      }
      .original {
        max-width: 390px;
        text-align: right;
        color: rgba(235, 244, 238, .76);
        font: 500 15px/1.5 system-ui, sans-serif;
        letter-spacing: .02em;
      }
      .mark {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 9px;
        border-radius: 50%;
        background: #72c99b;
        box-shadow: 0 0 18px rgba(114, 201, 155, .8);
      }
    </style>
  </head>
  <body>
    <div class="overlay"></div>
    <main>
      <div class="edition">AMEYANAGI'S MORPHOUS — JAPANESE EDITION</div>
      <section class="content">
        <h1 class="brand">Morphous <span>日本語版</span></h1>
        <p class="ja">自然から生まれた<br />デザインシステム</p>
        <p class="en">Nature-driven design systems</p>
      </section>
      <footer>
        <div class="url"><span class="mark"></span>morphos-ja.pages.dev</div>
        <div class="original">Original: morphos.ameyanagi.com<br />日本語・English 切り替え対応</div>
      </footer>
    </main>
  </body>
</html>`)
  await page.screenshot({ path: outputPath, type: "png" })
  console.log(`Rendered ${outputPath} (1200x630)`)
} finally {
  await browser.close()
}
