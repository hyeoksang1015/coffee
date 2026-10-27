"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { beans, FEATURED, getBean, type Bean } from "@/data/beans";
import { won } from "@/data/site";
import { useCart } from "../CartProvider";
import { Badge } from "../ui";

const TABS = [
  { id: "all", label: "전체" },
  { id: "single", label: "싱글 오리진" },
  { id: "blend", label: "시그니처 블렌드" },
] as const;

/** 홈 '이달의 아틀리에 큐레이션'. 탭마다 추천 순서에서 맞는 원두 3개를 보여 준다. */
export default function Curation() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const { add } = useCart();
  const shown = FEATURED.map((s) => getBean(s)!)
    .filter((b) => tab === "all" || b.category === tab)
    .slice(0, 3);

  return (
    <section className="wrap py-space-xl" aria-labelledby="curation-title">
      <div className="mb-space-lg flex flex-col justify-between gap-space-sm md:flex-row md:items-end">
        <div>
          <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Signature &amp; Seasonal Harvest</span>
          <h2 id="curation-title" className="mt-1 text-headline-lg-mobile text-navy-ink md:text-headline-lg">
            이달의 아틀리에 큐레이션
          </h2>
        </div>
        <div role="tablist" aria-label="원두 종류" className="flex items-center gap-1.5 self-start rounded-lg bg-surface-container p-1 md:self-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-9 rounded-lg px-4 text-label-caps uppercase tracking-wider transition-colors ${tab === t.id ? "bg-navy-ink text-on-primary" : "text-secondary hover:text-navy-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((b) => (
          <Card key={b.slug} bean={b} onAdd={() => add({ slug: b.slug, grams: b.sizes[0].grams, grind: "whole", plan: "once", qty: 1 }, { name: b.name })} />
        ))}
      </div>
      <div className="mt-space-lg text-center">
        <Link href="/beans/" className="inline-flex min-h-11 items-center gap-2 text-headline-sm text-cobalt-electric transition-colors hover:text-primary">
          전체 싱글오리진 &amp; 블렌드 {beans.length}종 보러가기 <ArrowRight className="size-[18px]" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function Card({ bean, onAdd }: { bean: Bean; onAdd: () => void }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-canvas-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-64 w-full overflow-hidden bg-canvas-subtle">
        <Image src={bean.image} alt={bean.imageAlt} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        <Badge tone={bean.badges[0].tone} className="absolute top-3 left-3">
          {bean.badges[0].text}
        </Badge>
        <Badge tone="navy" className="absolute top-3 right-3">
          {bean.badges[1].text}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-space-sm p-space-md">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-secondary">
            <span className="text-label-caps uppercase">{bean.origin}</span>
            <span className={`text-spec-num ${bean.roast === "light" ? "text-cobalt-electric" : "text-accent-amber"}`}>{bean.roastLabel}</span>
          </div>
          <h3 className="text-headline-sm text-navy-ink transition-colors group-hover:text-cobalt-electric">
            <Link href={`/beans/${bean.slug}/`}>{bean.name}</Link>
          </h3>
          <div className="mt-space-xs flex flex-wrap gap-1.5">
            {bean.detail.flavors.slice(0, 3).map((f) => (
              <span key={f} className="rounded-lg bg-surface-container px-2 py-0.5 text-label-caps text-navy-ink">
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-space-xs">
          <span className="text-headline-sm text-navy-ink tabular-nums">
            {won(bean.sizes[0].price)} <span className="text-body-sm font-normal text-secondary">/ {bean.sizes[0].label}</span>
          </span>
          <button type="button" onClick={onAdd} aria-label={`${bean.name} 장바구니 담기`} className="flex size-11 items-center justify-center rounded-lg bg-surface-container text-navy-ink transition-colors hover:bg-cobalt-electric hover:text-on-primary">
            <ShoppingCart className="size-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
