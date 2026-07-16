import type { MorphousSystem } from "@/domain/morphous-system"
import { categoryMatches } from "@/domain/catalog-categories"
import { colorDistance } from "@/lib/color-distance"

export type SortKey = "name" | "motifName" | "color"
export type ColorRoleKey = "Primary" | "Accent" | "Background"

export type GallerySearch = {
  system?: string | undefined
  q?: string | undefined
  category?: string | undefined
  sort?: SortKey | undefined
}

export type LocalizedCatalogIdentity = {
  name: string
  motifName: string
}

export type CatalogCriteria = {
  query: string
  category: string
  sort: SortKey
  searchColor: string
  colorRole: ColorRoleKey
  localizedIdentities?: Readonly<Record<string, LocalizedCatalogIdentity>>
}

export const SORT_OPTIONS = [
  "name",
  "motifName",
  "color",
] as const satisfies ReadonlyArray<SortKey>

export const COLOR_ROLE_OPTIONS = [
  "Primary",
  "Accent",
  "Background",
] as const satisfies ReadonlyArray<ColorRoleKey>

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function isSortKey(value: string | undefined): value is SortKey {
  return SORT_OPTIONS.some((option) => option === value)
}

export function normalizeGallerySearch(
  search: Record<string, unknown>
): GallerySearch {
  const system = asNonEmptyString(search.system)
  const q = asNonEmptyString(search.q)
  const category = asNonEmptyString(search.category)
  const sortValue = asNonEmptyString(search.sort)
  const sort = isSortKey(sortValue) ? sortValue : undefined

  return Object.fromEntries(
    Object.entries({ system, q, category, sort }).filter(
      ([, value]) => value !== undefined
    )
  )
}

function searchText(
  system: MorphousSystem,
  localizedIdentity: LocalizedCatalogIdentity | undefined
): string {
  return [
    system.name,
    system.motifName,
    localizedIdentity?.name,
    localizedIdentity?.motifName,
    system.motifCategory,
    system.biome,
    system.motif,
    system.description,
    system.tags.join(" "),
    system.searchBlob,
  ]
    .join(" ")
    .toLowerCase()
}

function paletteHex(system: MorphousSystem, role: ColorRoleKey): string {
  return system.palette.find((color) => color.role === role)?.hex ?? "#000000"
}

export function filterAndSortSystems(
  catalog: ReadonlyArray<MorphousSystem>,
  criteria: CatalogCriteria
): Array<MorphousSystem> {
  const tokens = criteria.query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const filtered = catalog.filter(
    (system) =>
      tokens.every((token) =>
        searchText(
          system,
          criteria.localizedIdentities?.[system.slug]
        ).includes(token)
      ) && categoryMatches(criteria.category, system.motifCategory)
  )

  if (criteria.sort === "color") {
    if (!criteria.searchColor) return [...filtered]
    return [...filtered].sort(
      (left, right) =>
        colorDistance(
          criteria.searchColor,
          paletteHex(left, criteria.colorRole)
        ) -
        colorDistance(
          criteria.searchColor,
          paletteHex(right, criteria.colorRole)
        )
    )
  }

  const sortKey: Exclude<SortKey, "color"> = criteria.sort
  return [...filtered].sort((left, right) => {
    const leftLocalized = criteria.localizedIdentities?.[left.slug]?.[sortKey]
    const rightLocalized = criteria.localizedIdentities?.[right.slug]?.[sortKey]

    if (leftLocalized && rightLocalized) {
      return leftLocalized.localeCompare(rightLocalized, "ja")
    }

    return left[sortKey].localeCompare(right[sortKey])
  })
}

export function resolveSystem(
  catalog: ReadonlyArray<MorphousSystem>,
  requestedSlug: string | undefined
): MorphousSystem {
  const system =
    catalog.find((candidate) => candidate.slug === requestedSlug) ?? catalog[0]
  if (!system)
    throw new Error("Morphous catalog must contain at least one system")
  return system
}
