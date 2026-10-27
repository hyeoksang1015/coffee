"use client";

import { ShoppingBag } from "lucide-react";
import type { Bean } from "@/data/beans";
import { useCart } from "./CartProvider";

/** 서버 컴포넌트 화면에서 쓰는 '즉시 구매' 버튼: 기본 용량·홀빈·1회 구매로 담고 장바구니를 연다. */
export default function BuyNow({ bean, className }: { bean: Bean; className: string }) {
  const { add } = useCart();
  return (
    <button type="button" onClick={() => add({ slug: bean.slug, grams: bean.sizes[0].grams, grind: "whole", plan: "once", qty: 1 }, { open: true })} className={className}>
      즉시 구매 <ShoppingBag className="size-4" aria-hidden="true" />
    </button>
  );
}
