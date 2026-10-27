"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Flame, Leaf, Minus, Plus, ShoppingBag, Star, Store, Wind } from "lucide-react";
import type { Bean } from "@/data/beans";
import { site, won } from "@/data/site";
import { GRINDS, MAX_QTY, unitPrice, type Grind, type Plan } from "@/lib/cart";
import { useCart } from "../CartProvider";

const opt = (on: boolean) => `rounded-lg p-3 text-left transition-all ${on ? "bg-surface-container-highest shadow-sm ring-1 ring-navy-ink" : "bg-surface-container-low opacity-85 hover:opacity-100"}`;

export default function PurchasePanel({ bean, rating }: { bean: Bean; rating?: { score: string; count: number } }) {
  const { add } = useCart();
  const [grams, setGrams] = useState(bean.sizes[0].grams);
  const [grind, setGrind] = useState<Grind>("whole");
  const [sub, setSub] = useState(false);
  const [cycle, setCycle] = useState<"2w" | "4w">("2w");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const plan: Plan = sub ? cycle : "once";
  const unit = unitPrice(bean, grams, plan);
  const item = { slug: bean.slug, grams, grind, plan, qty };

  const addToCart = () => {
    add(item, { name: bean.name });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="flex w-full flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl">
      <div>
        <div className="mb-space-xs flex items-center justify-between gap-2">
          <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Rhythm {bean.category === "single" ? "Single Origin" : bean.category === "blend" ? "Signature Blend" : "Decaf"}</span>
          {rating && (
            <span className="flex items-center gap-1 text-spec-num text-secondary">
              <Star className="size-4 fill-accent-amber text-accent-amber" aria-hidden="true" /> {rating.score} ({rating.count} Reviews)
            </span>
          )}
        </div>
        <h1 className="text-headline-lg-mobile text-navy-ink md:text-headline-lg">{bean.name}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">{bean.subtitle}</p>
        <div className="mt-space-md flex flex-wrap items-baseline justify-between gap-2 pt-space-xs">
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg text-navy-ink tabular-nums" data-testid="unit-price">
              {won(unit)}
            </span>
            <span className="text-body-sm text-on-surface-variant">/ {bean.sizes.find((s) => s.grams === grams)!.label}</span>
          </div>
          <span className="rounded bg-surface-container-low px-2 py-1 text-label-caps text-primary">{site.freeShipping.toLocaleString("ko-KR")}원 이상 무료배송</span>
        </div>
      </div>

      <fieldset className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <legend className="text-label-caps uppercase tracking-wider text-navy-ink">용량 선택 (Weight)</legend>
          <span className="text-spec-num text-on-surface-variant">질소 플러시 포장</span>
        </div>
        <div className="grid grid-cols-3 gap-space-xs">
          {bean.sizes.map((s) => (
            <button key={s.grams} type="button" aria-pressed={grams === s.grams} onClick={() => setGrams(s.grams)} className={opt(grams === s.grams)}>
              <span className="block text-spec-num text-navy-ink">{s.grams === 1000 ? "1kg Cafe" : s.label}</span>
              <span className="mt-0.5 block text-body-sm text-on-surface-variant tabular-nums">{won(s.price)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <legend className="text-label-caps uppercase tracking-wider text-navy-ink">분쇄도 선택 (Grind Profile)</legend>
          <span className="text-body-sm text-secondary">EK43S Lab Calibrated</span>
        </div>
        <div className="grid grid-cols-3 gap-space-xs">
          {GRINDS.map((g) => (
            <button key={g.id} type="button" aria-pressed={grind === g.id} onClick={() => setGrind(g.id)} className={opt(grind === g.id)}>
              <span className="block text-spec-num text-navy-ink">{g.label}</span>
              <span className="mt-0.5 block text-body-sm text-on-surface-variant">{g.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-space-xs">
        <legend className="mb-space-xs text-label-caps uppercase tracking-wider text-navy-ink">구매 방식 (Delivery Model)</legend>
        <div className="grid grid-cols-2 gap-space-xs">
          {[
            { on: !sub, set: () => setSub(false), title: "일반 1회 구매", note: "당일 로스팅 즉시 출고", noteClass: "text-on-surface-variant" },
            { on: sub, set: () => setSub(true), title: "정기구독 (15% DC)", note: "2주 / 4주 선택 발송", noteClass: "font-medium text-primary" },
          ].map((o) => (
            <button key={o.title} type="button" aria-pressed={o.on} onClick={o.set} className={`flex flex-col justify-between ${opt(o.on)}`}>
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-spec-num text-navy-ink">{o.title}</span>
                <span className={`size-3 rounded-full border border-cobalt-electric ${o.on ? "bg-cobalt-electric" : ""}`} />
              </span>
              <span className={`mt-1 text-body-sm ${o.noteClass}`}>{o.note}</span>
            </button>
          ))}
        </div>
        {sub && (
          <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary-container/30 p-3">
            <span className="text-body-sm font-medium text-on-surface">배송 주기:</span>
            <div className="flex gap-2">
              {(["2w", "4w"] as const).map((c) => (
                <button key={c} type="button" aria-pressed={cycle === c} onClick={() => setCycle(c)} className={`min-h-9 rounded px-3 text-body-sm text-navy-ink ${cycle === c ? "bg-surface font-semibold shadow-sm" : "bg-surface-container-low"}`}>
                  {c === "2w" ? "2주 주기" : "4주 주기"}
                </button>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <div className="flex items-start gap-space-md rounded-lg bg-surface-container p-space-md">
        <Store className="mt-0.5 size-[22px] shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-spec-num text-navy-ink">카페 및 사업자 도매 (B2B)</span>
            <span className="rounded bg-primary px-1.5 py-0.5 text-label-caps text-on-primary">최대 40% DC</span>
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">월 5kg 이상 납품, 사업자 인증 즉시 도매 단가 및 테이스팅 샘플 신청 가능합니다.</p>
          <Link href="/wholesale/" className="mt-1 inline-flex min-h-11 items-center gap-1 text-label-caps uppercase tracking-wider text-primary hover:underline">
            사업자 인증 및 도매 라인업 보기 →
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-space-md">
        <div className="flex flex-col">
          <span id="qty-label" className="text-label-caps uppercase text-secondary">
            수량 (Quantity)
          </span>
          <div role="group" aria-labelledby="qty-label" className="mt-1 flex items-center gap-space-sm">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="수량 줄이기" className="flex size-11 items-center justify-center rounded bg-surface-container-lowest text-navy-ink transition-colors hover:bg-surface-container-high disabled:opacity-40">
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-headline-sm text-navy-ink tabular-nums" data-testid="qty" aria-live="polite">
              {qty}
            </span>
            <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label="수량 늘리기" className="flex size-11 items-center justify-center rounded bg-surface-container-lowest text-navy-ink transition-colors hover:bg-surface-container-high disabled:opacity-40">
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-label-caps uppercase text-secondary">총 결제 예정 금액</span>
          <span className="text-headline-lg-mobile text-primary tabular-nums sm:text-headline-lg" data-testid="total-price">
            {won(unit * qty)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-space-xs sm:flex-row">
        <button type="button" onClick={addToCart} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-lg bg-surface-container-high px-space-md py-3.5 text-headline-sm text-navy-ink transition-colors hover:bg-surface-variant sm:w-1/2">
          {added ? <Check className="size-5 text-primary" aria-hidden="true" /> : <ShoppingBag className="size-5" aria-hidden="true" />}
          {added ? "담김 완료" : "장바구니 담기"}
        </button>
        <button type="button" onClick={() => add(item, { open: true })} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-lg bg-cobalt-electric px-space-md py-3.5 text-headline-sm text-on-primary shadow-md transition-colors hover:bg-primary sm:w-1/2">
          바로 구매하기 <ArrowRight className="size-[18px]" aria-hidden="true" />
        </button>
      </div>

      <ul className="grid grid-cols-3 gap-space-xs text-center">
        {[
          { Icon: Flame, title: "당일 로스팅 출고", note: "오후 1시 이전 주문" },
          { Icon: Wind, title: "질소 충진 밸브 포장", note: "산화 방지 극대화" },
          { Icon: Leaf, title: "FSC 친환경 패키지", note: "생분해성 파우치" },
        ].map(({ Icon, title, note }) => (
          <li key={title} className="flex flex-col items-center gap-1 rounded bg-surface-container-low p-2">
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <span className="text-label-caps text-navy-ink">{title}</span>
            <span className="text-[11px] text-on-surface-variant">{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
