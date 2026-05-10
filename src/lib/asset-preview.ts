const previewableAssetPattern = /\.(png|jpe?g|webp)$/i

export type PreviewKind = "motif" | "board" | "hero" | "texture" | "example"

type PreviewSource = {
  type: "image/avif" | "image/webp"
  srcSet: string
  sizes?: string
}

export type PreviewSources = {
  src: string
  width: number
  height: number
  sources: Array<PreviewSource>
}

type KindSpec = { width: number; height: number; smallWidth?: number }

const KIND_SPECS: Record<PreviewKind, KindSpec> = {
  motif: { width: 640, height: 640, smallWidth: 360 },
  board: { width: 1280, height: 720, smallWidth: 720 },
  hero: { width: 960, height: 540 },
  texture: { width: 512, height: 512 },
  example: { width: 960, height: 540 },
}

function inferKind(filename: string): PreviewKind {
  if (filename === "motif.png" || filename === "animal.png") return "motif"
  if (filename.startsWith("motif")) return "motif"
  if (filename.includes("design-system")) return "board"
  if (filename.startsWith("hero")) return "hero"
  if (filename.startsWith("texture")) return "texture"
  return "example"
}

function splitAssetPath(
  assetPath: string
): { dir: string; stem: string } | null {
  if (
    !assetPath.startsWith("/systems/") ||
    !previewableAssetPattern.test(assetPath)
  ) {
    return null
  }
  const parts = assetPath.split("/")
  const filename = parts.pop()
  if (!filename) return null
  const stem = filename.replace(/\.[^.]+$/, "")
  parts.push("previews")
  return { dir: parts.join("/"), stem }
}

export function previewSources(
  assetPath: string,
  opts?: { kind?: PreviewKind; sizes?: string }
): PreviewSources {
  const split = splitAssetPath(assetPath)
  if (!split) {
    return { src: assetPath, width: 0, height: 0, sources: [] }
  }

  const filename = assetPath.split("/").pop() ?? ""
  const kind = opts?.kind ?? inferKind(filename)
  const spec = KIND_SPECS[kind]
  const { dir, stem } = split

  const buildSrcSet = (ext: "webp" | "avif") => {
    const primary = `${dir}/${stem}.${ext}`
    if (spec.smallWidth && spec.smallWidth < spec.width) {
      return `${dir}/${stem}-${spec.smallWidth}.${ext} ${spec.smallWidth}w, ${primary} ${spec.width}w`
    }
    return primary
  }

  const sources: Array<PreviewSource> = [
    { type: "image/avif", srcSet: buildSrcSet("avif"), sizes: opts?.sizes },
    { type: "image/webp", srcSet: buildSrcSet("webp"), sizes: opts?.sizes },
  ]

  return {
    src: `${dir}/${stem}.webp`,
    width: spec.width,
    height: spec.height,
    sources,
  }
}
