const previewableAssetPattern = /\.(png|jpe?g|webp)$/i

export function previewAssetPath(assetPath: string): string {
  if (!assetPath.startsWith("/systems/") || !previewableAssetPattern.test(assetPath)) {
    return assetPath
  }

  const parts = assetPath.split("/")
  const filename = parts.pop()
  if (!filename) return assetPath

  const stem = filename.replace(/\.[^.]+$/, "")
  parts.push("previews", `${stem}.webp`)
  return parts.join("/")
}
