// 원두 목록의 필터와 정렬.
import type { Bean, Category, Level, RoastGroup } from "@/data/beans";

export type Filters = { category: Category | "all"; roast: RoastGroup | "all"; acidity: Level | null; body: Level | null; sort: Sort };
export const SORTS = [
  { id: "recommend", label: "추천순 (Curator Pick)" },
  { id: "harvest", label: "신규 수확순 (Latest Crop)" },
  { id: "popular", label: "인기순 (Best Seller)" },
  { id: "price-asc", label: "낮은 가격순" },
  { id: "price-desc", label: "높은 가격순" },
] as const;
export type Sort = (typeof SORTS)[number]["id"];

export const DEFAULT_FILTERS: Filters = { category: "all", roast: "all", acidity: null, body: null, sort: "recommend" };

const price = (b: Bean) => b.sizes[0].price;

export function applyFilters(list: Bean[], f: Filters): Bean[] {
  const out = list.filter(
    (b) =>
      (f.category === "all" || b.category === f.category) &&
      (f.roast === "all" || b.roast === f.roast) &&
      (f.acidity === null || b.acidity === f.acidity) &&
      (f.body === null || b.body === f.body),
  );
  const by: Record<Sort, ((a: Bean, b: Bean) => number) | null> = {
    recommend: null,
    harvest: (a, b) => b.harvest.localeCompare(a.harvest),
    popular: (a, b) => a.rank - b.rank,
    "price-asc": (a, b) => price(a) - price(b),
    "price-desc": (a, b) => price(b) - price(a),
  };
  const cmp = by[f.sort];
  return cmp ? [...out].sort(cmp) : out;
}

export const countBy = (list: Bean[], category: Category | "all") => (category === "all" ? list.length : list.filter((b) => b.category === category).length);
