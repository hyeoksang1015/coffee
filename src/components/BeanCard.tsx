"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Bean } from "@/data/beans";
import { won } from "@/data/site";
import { useCart } from "./CartProvider";
import { Badge, Dots } from "./ui";

/** 원두 목록 카드. 용량을 고르면 가격이 바뀌고, 담기·바로구매는 홀빈·1회 구매로 담는다. */
export default function BeanCard({ bean, priority = false }: { bean: Bean; priority?: boolean }) {
  const { add } = useCart();
  const [grams, setGrams] = useState(bean.sizes[0].grams);
  const size = bean.sizes.find((s) => s.grams === grams)!;
  const item = { slug: bean.slug, grams, grind: "whole" as const, plan: "once" as const, qty: 1 };
  const href = `/beans/${bean.slug}/`;

  return (
    <article data-slug={bean.slug} className="group flex flex-col overflow-hidden rounded-xl bg-canvas-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="relative block aspect-square w-full overflow-hidden bg-surface-container-low" tabIndex={-1} aria-hidden="true">
        <Image src={bean.image} alt="" fill priority={priority} sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {bean.badges.map((b) => (
            <Badge key={b.text} tone={b.tone}>
              {b.text}
            </Badge>
          ))}
        </span>
        <Badge tone={bean.roastTone === "white" ? "navy" : bean.roastTone} className="absolute right-3 bottom-3">
          {bean.roastLabel}
        </Badge>
      </Link>
      <div className="flex flex-1 flex-col justify-between gap-space-md p-space-md">
        <div className="space-y-space-xs">
          <div className="flex items-center justify-between gap-2 text-body-sm text-secondary">
            <span>{bean.origin}</span>
            <span className="text-right text-spec-num text-on-surface-variant">{bean.meta}</span>
          </div>
          <h3 className="text-headline-sm text-navy-ink transition-colors group-hover:text-cobalt-electric">
            <Link href={href}>{bean.name}</Link>
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bean.notes.map((n) => (
              <span key={n} className="rounded-sm bg-surface-container px-2 py-0.5 text-body-sm text-secondary">
                #{n}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-container-low px-3 py-2">
            <Dots label="Acidity" value={bean.acidity} />
            <Dots label="Sweet" value={bean.sweet} />
            <Dots label="Body" value={bean.body} />
          </div>
        </div>
        <div className="space-y-space-sm">
          <div role="radiogroup" aria-label={`${bean.name} 용량`} className="grid grid-cols-3 gap-1 rounded-lg bg-surface-container p-1 text-center text-spec-num">
            {bean.sizes.map((s) => (
              <button
                key={s.grams}
                type="button"
                role="radio"
                aria-checked={s.grams === grams}
                onClick={() => setGrams(s.grams)}
                className={`min-h-9 rounded-lg ${s.grams === grams ? "bg-canvas-card font-semibold text-navy-ink shadow-sm" : "text-secondary hover:text-navy-ink"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-label-caps uppercase text-secondary">Retail Price</span>
              <span className="text-headline-sm text-navy-ink tabular-nums" data-testid="price">
                {won(size.price)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => add(item, { name: bean.name })} aria-label={`${bean.name} ${size.label} 장바구니 담기`} className="flex size-11 items-center justify-center rounded-lg bg-surface-container text-navy-ink transition-colors hover:bg-surface-variant">
                <ShoppingCart className="size-5" />
              </button>
              <button type="button" onClick={() => add(item, { open: true })} className="h-11 rounded-lg bg-cobalt-electric px-4 text-body-sm font-semibold text-on-primary transition-colors hover:bg-primary">
                바로구매
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
