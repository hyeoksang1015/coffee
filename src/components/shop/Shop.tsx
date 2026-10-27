"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Droplet, Flame, Leaf, RotateCcw } from "lucide-react";
import { beans, CATEGORY_LABEL, type Category, type Level } from "@/data/beans";
import { applyFilters, countBy, DEFAULT_FILTERS, SORTS, type Filters, type Sort } from "@/lib/shop";
import BeanCard from "../BeanCard";

const CATEGORIES: (Category | "all")[] = ["all", "single", "blend", "decaf"];
const ROASTS = [
  { id: "all", label: "전체" },
  { id: "light", label: "라이트" },
  { id: "medium", label: "미디엄 / 다크" },
] as const;
const LEVELS: Level[] = [1, 2, 3, 4, 5];

/** 주소의 ?category= 를 첫 필터로 쓴다(푸터 '시즌 싱글오리진 빈샵' 링크). */
export function ShopFromParams() {
  const c = useSearchParams().get("category") as Category | null;
  const category = c && c in CATEGORY_LABEL ? c : "all";
  return <Shop key={category} initial={{ ...DEFAULT_FILTERS, category }} />;
}

export default function Shop({ initial = DEFAULT_FILTERS }: { initial?: Filters }) {
  const [f, setF] = useState(initial);
  const list = applyFilters(beans, f);
  const set = (patch: Partial<Filters>) => setF((x) => ({ ...x, ...patch }));

  const pill = (on: boolean) => `min-h-11 rounded-lg px-4 text-body-sm font-medium transition-colors ${on ? "bg-navy-ink text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"}`;

  const levelPicker = (key: "acidity" | "body", label: string, Icon: typeof Leaf) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-label-caps text-secondary">
        <span id={`${key}-label`} className="flex items-center gap-1 uppercase tracking-wider">
          <Icon className="size-3.5 text-cobalt-electric" aria-hidden="true" /> {label}
        </span>
        <span className="text-spec-num text-navy-ink">{f[key] ? `LEVEL ${f[key]}` : "ALL"}</span>
      </div>
      <div role="radiogroup" aria-labelledby={`${key}-label`} className="flex items-center gap-1 rounded-lg bg-canvas-card p-1 shadow-sm">
        {LEVELS.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={f[key] === n}
            aria-label={`${label} ${n}`}
            onClick={() => set({ [key]: f[key] === n ? null : n })}
            className={`min-h-9 flex-1 rounded text-body-sm tabular-nums ${f[key] === n ? "bg-cobalt-electric font-semibold text-on-primary" : "text-secondary hover:bg-surface-container"}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="wrap -mt-space-md pb-space-lg">
        <div className="flex items-center justify-between gap-space-md">
          <div role="group" aria-label="원두 종류" className="flex flex-wrap items-center gap-space-xs">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" aria-pressed={f.category === c} onClick={() => set({ category: c })} className={pill(f.category === c)}>
                {c === "all" ? "전체 원두" : CATEGORY_LABEL[c]} <span className="text-spec-num opacity-75 tabular-nums">({countBy(beans, c)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section aria-label="원두 필터" className="w-full bg-surface-container-low py-space-md shadow-sm">
        <div className="wrap grid grid-cols-1 items-end gap-space-md lg:grid-cols-12">
          <div className="flex flex-col gap-1.5 lg:col-span-4">
            <span id="roast-label" className="flex items-center gap-1 text-label-caps uppercase tracking-wider text-secondary">
              <Flame className="size-3.5 text-cobalt-electric" aria-hidden="true" /> 배전도 (Roast Profile)
            </span>
            <div role="radiogroup" aria-labelledby="roast-label" className="grid grid-cols-3 rounded-lg bg-canvas-card p-1 text-center text-body-sm shadow-sm">
              {ROASTS.map((r) => (
                <button key={r.id} type="button" role="radio" aria-checked={f.roast === r.id} onClick={() => set({ roast: r.id })} className={`min-h-9 rounded-md transition-colors ${f.roast === r.id ? "bg-cobalt-electric font-medium text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:col-span-5">
            {levelPicker("acidity", "산미 (Acidity)", Leaf)}
            {levelPicker("body", "바디감 (Body)", Droplet)}
          </div>
          <div className="flex items-end gap-space-xs lg:col-span-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="sort-select" className="text-label-caps uppercase tracking-wider text-secondary">
                정렬 기준
              </label>
              <div className="relative">
                <select id="sort-select" value={f.sort} onChange={(e) => set({ sort: e.target.value as Sort })} className="h-11 w-full cursor-pointer appearance-none rounded-lg bg-canvas-card px-3 text-base text-navy-ink shadow-sm focus:outline-none sm:text-body-sm">
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-3 right-3 size-5 text-secondary" aria-hidden="true" />
              </div>
            </div>
            <button type="button" onClick={() => setF(DEFAULT_FILTERS)} aria-label="필터 초기화" title="필터 초기화" className="flex size-11 items-center justify-center rounded-lg bg-canvas-card text-secondary shadow-sm transition-colors hover:bg-surface-variant hover:text-navy-ink">
              <RotateCcw className="size-5" />
            </button>
          </div>
        </div>
      </section>

      <section aria-label="원두 목록" className="w-full py-space-xl">
        <div className="wrap">
          <p className="mb-space-md text-spec-num text-navy-ink" aria-live="polite">
            총 <span className="text-cobalt-electric tabular-nums" data-testid="result-count">{list.length}</span>개 원두
          </p>
          {list.length ? (
            <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
              {list.map((b, i) => (
                <BeanCard key={b.slug} bean={b} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-surface-container-low p-space-xl text-center">
              <p className="text-body-lg text-navy-ink">조건에 맞는 원두가 없습니다.</p>
              <button type="button" onClick={() => setF(DEFAULT_FILTERS)} className="mt-space-md inline-flex min-h-11 items-center gap-2 rounded-lg bg-navy-ink px-5 text-body-md font-semibold text-on-primary">
                <RotateCcw className="size-4" aria-hidden="true" /> 필터 초기화
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
