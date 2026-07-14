export function pickRandomSystemSlug(
  slugs: ReadonlyArray<string>,
  currentSlug: string,
  random: () => number = Math.random
): string | undefined {
  const unique = [...new Set(slugs)]
  if (unique.length === 0) return undefined

  const alternatives = unique.filter((slug) => slug !== currentSlug)
  const pool = alternatives.length > 0 ? alternatives : unique
  const normalizedRandom = Math.min(Math.max(random(), 0), 0.999999)

  return pool[Math.floor(normalizedRandom * pool.length)]
}
