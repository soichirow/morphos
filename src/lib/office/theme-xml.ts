import type { MorphousSystem } from "@/domain/morphous-system"
import type { ThemeMode } from "@/lib/morphous-theme"
import { paletteForOffice } from "@/lib/morphous-theme"

export type ThemeFonts = {
  /** Latin (English) typeface name as installed in Office. */
  latin: string
  /** East-Asian / Japanese typeface name. */
  ea: string
}

/**
 * Build an OOXML <a:theme> document used by both PPTX (ppt/theme/theme1.xml)
 * and DOCX (word/theme/theme1.xml).
 *
 * The clrScheme drives the "Theme Colors" picker in PowerPoint/Word.
 * The fontScheme sets Major (headings) and Minor (body) fonts at the
 * theme level — including <a:font script="Jpan"> so Japanese text picks up
 * the chosen JP face.
 */
export function buildOfficeTheme(
  system: MorphousSystem,
  mode: ThemeMode,
  fonts: ThemeFonts
): string {
  const p = paletteForOffice(system, mode)
  // OOXML scheme convention:
  //   lt1/lt2 = light backgrounds, dk1/dk2 = dark text/backgrounds.
  //   We map our 8-role palette to all 12 scheme slots so the Theme
  //   Colors picker is filled with the system's actual hexes.
  const lt1 = p.background
  const dk1 = p.foreground
  const lt2 = p.surface
  const dk2 = p.depth
  const accent1 = p.primary
  const accent2 = p.accent
  const accent3 = p.secondary
  const accent4 = p.signal
  const accent5 = mix(p.primary, p.surface, 0.5)
  const accent6 = mix(p.accent, p.depth, 0.4)
  const hlink = p.primary
  const folHlink = p.accent

  const latin = escapeAttr(fonts.latin)
  const ea = escapeAttr(fonts.ea)

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Morphous ${escapeAttr(system.name)}">
  <a:themeElements>
    <a:clrScheme name="Morphous ${escapeAttr(system.name)}">
      <a:dk1><a:srgbClr val="${dk1}"/></a:dk1>
      <a:lt1><a:srgbClr val="${lt1}"/></a:lt1>
      <a:dk2><a:srgbClr val="${dk2}"/></a:dk2>
      <a:lt2><a:srgbClr val="${lt2}"/></a:lt2>
      <a:accent1><a:srgbClr val="${accent1}"/></a:accent1>
      <a:accent2><a:srgbClr val="${accent2}"/></a:accent2>
      <a:accent3><a:srgbClr val="${accent3}"/></a:accent3>
      <a:accent4><a:srgbClr val="${accent4}"/></a:accent4>
      <a:accent5><a:srgbClr val="${accent5}"/></a:accent5>
      <a:accent6><a:srgbClr val="${accent6}"/></a:accent6>
      <a:hlink><a:srgbClr val="${hlink}"/></a:hlink>
      <a:folHlink><a:srgbClr val="${folHlink}"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Morphous">
      <a:majorFont>
        <a:latin typeface="${latin}"/>
        <a:ea typeface="${ea}"/>
        <a:cs typeface=""/>
        <a:font script="Jpan" typeface="${ea}"/>
        <a:font script="Hang" typeface="${ea}"/>
        <a:font script="Hans" typeface="${ea}"/>
        <a:font script="Hant" typeface="${ea}"/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="${latin}"/>
        <a:ea typeface="${ea}"/>
        <a:cs typeface=""/>
        <a:font script="Jpan" typeface="${ea}"/>
        <a:font script="Hang" typeface="${ea}"/>
        <a:font script="Hans" typeface="${ea}"/>
        <a:font script="Hant" typeface="${ea}"/>
      </a:minorFont>
    </a:fontScheme>
    ${defaultFmtScheme()}
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`
}

function defaultFmtScheme(): string {
  // Minimal fmtScheme — required for a valid theme. Standard Office defaults.
  return `<a:fmtScheme name="Morphous">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln>
        <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln>
        <a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>`
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function mix(a: string, b: string, t: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  const r = Math.round(pa[0] * (1 - t) + pb[0] * t)
  const g = Math.round(pa[1] * (1 - t) + pb[1] * t)
  const bl = Math.round(pa[2] * (1 - t) + pb[2] * t)
  return ((r << 16) | (g << 8) | bl).toString(16).toUpperCase().padStart(6, "0")
}

function parseHex(h: string): [number, number, number] {
  const n = parseInt(h.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Replace (or add) `path` inside an OOXML zip with `xml`. */
export async function injectThemeIntoZip(
  blob: Blob,
  path: string,
  xml: string
): Promise<Blob> {
  const JSZip = (await import("jszip")).default
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  zip.file(path, xml)
  return zip.generateAsync({
    type: "blob",
    mimeType: blob.type || "application/octet-stream",
    compression: "DEFLATE",
  })
}

/**
 * Inject a theme into a DOCX. Unlike PPTX (which ships with theme1.xml
 * pre-wired), the `docx` library does NOT include a theme part — so Word
 * ignores any theme1.xml we drop in unless we also (a) declare its content
 * type in [Content_Types].xml and (b) add a relationship from document.xml.
 */
export async function injectDocxTheme(blob: Blob, xml: string): Promise<Blob> {
  const JSZip = (await import("jszip")).default
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())

  zip.file("word/theme/theme1.xml", xml)

  // 1. Content Types — add theme override if missing.
  const ctName = "[Content_Types].xml"
  let ct = (await zip.file(ctName)?.async("string")) ?? ""
  const themeContentType =
    "application/vnd.openxmlformats-officedocument.theme+xml"
  if (!ct.includes("/word/theme/theme1.xml")) {
    const override = `<Override ContentType="${themeContentType}" PartName="/word/theme/theme1.xml"/>`
    ct = ct.replace("</Types>", `${override}</Types>`)
    zip.file(ctName, ct)
  }

  // 2. Document relationships — add theme relationship if missing.
  const relsName = "word/_rels/document.xml.rels"
  let rels = (await zip.file(relsName)?.async("string")) ?? ""
  const themeRelType =
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme"
  if (!rels.includes(themeRelType)) {
    const idMatch = rels.match(/Id="rId(\d+)"/g) ?? []
    const maxId = idMatch.reduce((m, s) => {
      const n = Number(s.match(/(\d+)/)?.[1] ?? "0")
      return n > m ? n : m
    }, 0)
    const newId = `rId${maxId + 1}`
    const rel = `<Relationship Id="${newId}" Type="${themeRelType}" Target="theme/theme1.xml"/>`
    rels = rels.replace("</Relationships>", `${rel}</Relationships>`)
    zip.file(relsName, rels)
  }

  return zip.generateAsync({
    type: "blob",
    mimeType: blob.type || "application/octet-stream",
    compression: "DEFLATE",
  })
}
