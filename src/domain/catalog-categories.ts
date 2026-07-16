export type CategoryGroupId =
  | "group:botanical"
  | "group:animals"
  | "group:small-life"
  | "group:ocean"
  | "group:earth-sky"

export type CategoryGroup = {
  id: CategoryGroupId
  categories: ReadonlyArray<string>
}

export const CATEGORY_GROUPS = [
  {
    id: "group:botanical",
    categories: ["plant", "flower", "fruit", "fungi"],
  },
  {
    id: "group:animals",
    categories: ["animal", "mammal", "bird", "fish", "amphibian", "reptile"],
  },
  {
    id: "group:small-life",
    categories: ["insect", "crustacean", "mollusk", "microorganism"],
  },
  { id: "group:ocean", categories: ["marine"] },
  {
    id: "group:earth-sky",
    categories: ["landscape", "mineral", "weather", "celestial"],
  },
] as const satisfies ReadonlyArray<CategoryGroup>

export function isCategoryGroupId(value: string): value is CategoryGroupId {
  return CATEGORY_GROUPS.some((group) => group.id === value)
}

export function categoryMatches(
  filter: string,
  motifCategory: string
): boolean {
  if (filter === "all") return true
  const group = CATEGORY_GROUPS.find((candidate) => candidate.id === filter)
  return group
    ? (group.categories as ReadonlyArray<string>).includes(motifCategory)
    : motifCategory === filter
}
