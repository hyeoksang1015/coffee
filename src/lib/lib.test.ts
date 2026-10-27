import { describe, expect, it } from "vitest";
import { beans, getBean } from "@/data/beans";
import { addItem, lineKey, parseCart, removeItem, setQty, totals, unitPrice, type CartItem } from "./cart";
import { isPhone, nextThursdays, validateWholesale, type Wholesale } from "./forms";
import { recommend } from "./quiz";
import { applyFilters, countBy, DEFAULT_FILTERS } from "./shop";

const aricha = getBean("aricha")!;

describe("카탈로그", () => {
  it("slug 가 겹치지 않고, 용량은 가벼운 순·가격도 오르는 순이다", () => {
    expect(new Set(beans.map((b) => b.slug)).size).toBe(beans.length);
    for (const b of beans) {
      expect(b.sizes.map((s) => s.grams)).toEqual([...b.sizes.map((s) => s.grams)].sort((x, y) => x - y));
      expect(b.sizes[0].price).toBeLessThan(b.sizes[2].price);
    }
  });
});

describe("장바구니", () => {
  it("정기구독은 15% 할인 후 100원 단위로 반올림한다", () => {
    expect(unitPrice(aricha, 200, "once")).toBe(19000);
    expect(unitPrice(aricha, 200, "2w")).toBe(16200); // 16,150 → 16,200
    expect(unitPrice(aricha, 1000, "4w")).toBe(64600);
  });

  it("같은 옵션은 수량만 더하고, 다른 옵션은 따로 담는다", () => {
    const one: CartItem = { slug: "aricha", grams: 200, grind: "whole", plan: "once", qty: 1 };
    let items = addItem([], one);
    items = addItem(items, { ...one, qty: 2 });
    items = addItem(items, { ...one, grind: "filter" });
    expect(items.map((i) => i.qty)).toEqual([3, 1]);
    items = setQty(items, lineKey(one), 99);
    expect(items[0].qty).toBe(20);
    expect(removeItem(items, lineKey(one))).toHaveLength(1);
  });

  it("3만 원 미만이면 배송비 3,000원, 이상이면 무료", () => {
    const item: CartItem = { slug: "aricha", grams: 200, grind: "whole", plan: "once", qty: 1 };
    expect(totals([item])).toEqual({ subtotal: 19000, shipping: 3000, total: 22000, count: 1 });
    expect(totals([{ ...item, qty: 2 }]).shipping).toBe(0);
    expect(totals([]).total).toBe(0);
  });

  it("저장소에서 읽은 잘못된 값은 버린다", () => {
    const raw = [
      { slug: "aricha", grams: 200, grind: "whole", plan: "once", qty: 2 },
      { slug: "nope", grams: 200, grind: "whole", plan: "once", qty: 1 },
      { slug: "aricha", grams: 999, grind: "whole", plan: "once", qty: 1 },
      { slug: "aricha", grams: 200, grind: "x", plan: "once", qty: 1 },
      { slug: "aricha", grams: 200, grind: "whole", plan: "once", qty: 0 },
      null,
    ];
    expect(parseCart(raw)).toEqual([raw[0]]);
    expect(parseCart("x")).toEqual([]);
  });
});

describe("원두 목록 필터", () => {
  it("카테고리·배전도·산미·바디를 함께 거른다", () => {
    expect(applyFilters(beans, { ...DEFAULT_FILTERS, category: "blend" }).every((b) => b.category === "blend")).toBe(true);
    const r = applyFilters(beans, { ...DEFAULT_FILTERS, roast: "light", acidity: 5 });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((b) => b.roast === "light" && b.acidity === 5)).toBe(true);
    expect(countBy(beans, "all")).toBe(beans.length);
  });

  it("가격순 정렬", () => {
    const asc = applyFilters(beans, { ...DEFAULT_FILTERS, sort: "price-asc" }).map((b) => b.sizes[0].price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(applyFilters(beans, DEFAULT_FILTERS).map((b) => b.slug)).toEqual(beans.map((b) => b.slug));
  });
});

describe("B2B 신청서", () => {
  const ok: Wholesale = { store: "카페 모먼트", manager: "홍길동", phone: "010-1234-5678", location: "서울 성동구", status: "현재 매장 운영 중", volume: "10_30kg", profiles: [], message: "" };
  it("필수 항목만 채우면 통과", () => expect(validateWholesale(ok)).toEqual({}));
  it("빈 칸·잘못된 연락처·목록 밖 값은 오류", () => {
    const e = validateWholesale({ ...ok, store: " ", phone: "abc", volume: "x", profiles: ["<b>"] });
    expect(Object.keys(e).sort()).toEqual(["phone", "profiles", "store", "volume"]);
  });
  it.each(["010-1234-5678", "02-123-4567", "01012345678"])("%s 는 전화번호", (v) => expect(isPhone(v)).toBe(true));
  it.each(["123", "abc", "010-1234-5678-1"])("%s 는 전화번호가 아님", (v) => expect(isPhone(v)).toBe(false));
});

describe("커핑 예약 날짜", () => {
  it("다음 목요일부터 매주", () => {
    expect(nextThursdays(new Date(2026, 9, 27), 3)).toEqual(["2026-10-29", "2026-11-05", "2026-11-12"]); // 화요일
    expect(nextThursdays(new Date(2026, 9, 29), 1)).toEqual(["2026-11-05"]); // 목요일 당일은 다음 주
  });
});

describe("취향 퀴즈", () => {
  it("화사한 핸드드립 → 밝은 싱글 오리진, 라떼 → 묵직한 블렌드", () => {
    const bright = recommend({ tool: "drip", acid: "bright", milk: "black" });
    expect(bright.acidity).toBeGreaterThanOrEqual(4);
    const latte = recommend({ tool: "espresso", acid: "low", milk: "latte" });
    expect(latte.body).toBe(5);
    expect(latte.category).not.toBe("decaf");
  });
});
