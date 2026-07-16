import type {PreviewKind} from "@/lib/asset-preview";
import {  previewSources } from "@/lib/asset-preview"

type Props = {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  fetchPriority?: "high" | "low" | "auto"
  decoding?: "sync" | "async" | "auto"
  kind?: PreviewKind
  sizes?: string
}

export function PreviewImage({
  src,
  alt,
  className,
  loading,
  fetchPriority,
  decoding = "async",
  kind,
  sizes,
}: Props) {
  const preview = previewSources(src, {
    ...(kind ? { kind } : {}),
    ...(sizes ? { sizes } : {}),
  })
  return (
    <picture>
      {preview.sources.map((source) => (
        <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={source.sizes} />
      ))}
      <img
        src={preview.src}
        alt={alt}
        width={preview.width || undefined}
        height={preview.height || undefined}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
      />
    </picture>
  )
}
