// 장바구니 계산. 화면과 저장소(localStorage)에서 함께 쓰는 순수 함수만 둔다.
import { getBean, type Bean } from "@/data/beans";
import { site } from "@/data/site";

export const GRINDS = [
  { id: "whole", label: "홀빈 (Whole)", note: "원두 그대로 (권장)" },
  { id: "filter", label: "필터/드립", note: "V60 / 칼리타" },
  { id: "espresso", label: "에스프레소", note: "파인 그라인드" },
] as const;
export type Grind = (typeof GRINDS)[number]["id"];

/** once: 1회 구매, 2w·4w: 정기구독 배송 주기 */
export type Plan = "once" | "2w" | "4w";
export const PLAN_LABEL: Record<Plan, string> = { once: "1회 구매", "2w": "정기구독 · 2주", "4w": "정기구독 · 4주" };
export const SUBSCRIPTION_DISCOUNT = 0.15;
export const MAX_QTY = 20;

export type CartItem = { slug: string; grams: number; grind: Grind; plan: Plan; qty: number };

/** 한 봉 가격. 정기구독은 15% 할인 후 100원 단위로 반올림한다. */
export function unitPrice(bean: Bean, grams: number, plan: Plan) {
  const base = bean.sizes.find((s) => s.grams === grams)?.price ?? bean.sizes[0].price;
  return plan === "once" ? base : Math.round((base * (1 - SUBSCRIPTION_DISCOUNT)) / 100) * 100;
}

export const lineKey = (i: Omit<CartItem, "qty">) => `${i.slug}|${i.grams}|${i.grind}|${i.plan}`;

export function linePrice(i: CartItem) {
  const bean = getBean(i.slug);
  return bean ? unitPrice(bean, i.grams, i.plan) * i.qty : 0;
}

export function totals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + linePrice(i), 0);
  const shipping = subtotal === 0 || subtotal >= site.freeShipping ? 0 : site.shippingFee;
  return { subtotal, shipping, total: subtotal + shipping, count: items.reduce((n, i) => n + i.qty, 0) };
}

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n)));

/** 같은 원두·용량·분쇄도·구매 방식이면 수량만 더한다. */
export function addItem(items: CartItem[], add: CartItem): CartItem[] {
  const key = lineKey(add);
  const found = items.find((i) => lineKey(i) === key);
  if (!found) return [...items, { ...add, qty: clampQty(add.qty) }];
  return items.map((i) => (i === found ? { ...i, qty: clampQty(i.qty + add.qty) } : i));
}

export const setQty = (items: CartItem[], key: string, qty: number) => items.map((i) => (lineKey(i) === key ? { ...i, qty: clampQty(qty) } : i));
export const removeItem = (items: CartItem[], key: string) => items.filter((i) => lineKey(i) !== key);

/** 브라우저 저장소에서 읽은 값은 믿지 않는다. 카탈로그에 있는 조합만 남긴다. */
export function parseCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((v) => {
    const bean = getBean(v?.slug);
    const ok =
      bean &&
      bean.sizes.some((s) => s.grams === v.grams) &&
      GRINDS.some((g) => g.id === v.grind) &&
      v.plan in PLAN_LABEL &&
      Number.isInteger(v.qty) &&
      v.qty >= 1;
    return ok ? [{ slug: v.slug, grams: v.grams, grind: v.grind, plan: v.plan, qty: clampQty(v.qty) }] : [];
  });
}
