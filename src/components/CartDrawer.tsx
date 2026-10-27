"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { getBean } from "@/data/beans";
import { site, won } from "@/data/site";
import { GRINDS, lineKey, linePrice, MAX_QTY, PLAN_LABEL, totals } from "@/lib/cart";
import { useCart } from "./CartProvider";

/** 오른쪽에서 열리는 장바구니. <dialog> 라 포커스 가두기와 Esc 닫기는 브라우저가 맡는다. */
export default function CartDrawer() {
  const { items, update, remove, clear, open, setOpen, toast } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const [ordered, setOrdered] = useState(false);
  const t = totals(items);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => {
    setOpen(false);
    setOrdered(false);
  };

  return (
    <>
      <dialog
        ref={ref}
        aria-labelledby="cart-title"
        onClose={close}
        onClick={(e) => e.target === ref.current && close()}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md bg-canvas-card p-0 text-on-surface shadow-[0_8px_24px_-4px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.03)]"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line-neutral px-5 py-4">
            <h2 id="cart-title" className="flex items-center gap-2 text-headline-sm text-navy-ink">
              <ShoppingBag className="size-5" aria-hidden="true" /> 장바구니 <span className="text-spec-num text-cobalt-electric tabular-nums">{t.count}</span>
            </h2>
            <button type="button" onClick={close} aria-label="장바구니 닫기" className="flex size-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container">
              <X className="size-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
              <p className="text-body-md text-secondary">장바구니가 비어 있습니다.</p>
              <Link href="/beans/" onClick={close} className="inline-flex min-h-11 items-center rounded-lg bg-cobalt-electric px-5 text-body-md font-semibold text-on-primary hover:bg-primary">
                원두 컬렉션 보러가기
              </Link>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-line-neutral overflow-y-auto px-5">
                {items.map((i) => {
                  const bean = getBean(i.slug)!;
                  const key = lineKey(i);
                  const size = bean.sizes.find((s) => s.grams === i.grams)!;
                  return (
                    <li key={key} className="flex gap-3 py-4">
                      <Image src={bean.image} alt="" width={72} height={72} className="size-18 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/beans/${bean.slug}/`} onClick={close} className="text-body-md font-semibold text-navy-ink hover:text-cobalt-electric">
                            {bean.name}
                          </Link>
                          <button type="button" onClick={() => remove(key)} aria-label={`${bean.name} 빼기`} className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-secondary hover:text-error">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <p className="text-body-sm text-secondary">
                          {size.label} · {GRINDS.find((g) => g.id === i.grind)!.label} · {PLAN_LABEL[i.plan]}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg bg-surface-container-low">
                            <button type="button" onClick={() => update(key, i.qty - 1)} disabled={i.qty <= 1} aria-label="수량 줄이기" className="flex size-11 items-center justify-center text-navy-ink disabled:opacity-30">
                              <Minus className="size-4" />
                            </button>
                            <span className="w-6 text-center text-spec-num tabular-nums" aria-label={`수량 ${i.qty}`}>
                              {i.qty}
                            </span>
                            <button type="button" onClick={() => update(key, i.qty + 1)} disabled={i.qty >= MAX_QTY} aria-label="수량 늘리기" className="flex size-11 items-center justify-center text-navy-ink disabled:opacity-30">
                              <Plus className="size-4" />
                            </button>
                          </div>
                          <span className="text-headline-sm text-navy-ink tabular-nums">{won(linePrice(i))}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="space-y-3 border-t border-line-neutral bg-warm-canvas px-5 py-5">
                <dl className="space-y-1.5 text-body-md">
                  <div className="flex justify-between">
                    <dt className="text-secondary">상품 금액</dt>
                    <dd className="tabular-nums">{won(t.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-secondary">배송비</dt>
                    <dd className="tabular-nums">{t.shipping ? won(t.shipping) : "무료"}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line-neutral pt-2 text-headline-sm text-navy-ink">
                    <dt>결제 예정 금액</dt>
                    <dd className="text-cobalt-electric tabular-nums" data-testid="cart-total">
                      {won(t.total)}
                    </dd>
                  </div>
                </dl>
                {t.shipping > 0 && <p className="text-body-sm text-secondary">{won(site.freeShipping - t.subtotal)} 더 담으면 무료배송입니다.</p>}
                <div aria-live="polite">
                  {ordered && (
                    <p role="status" className="flex gap-2 rounded-lg bg-secondary-container/50 p-3 text-body-sm text-navy-ink">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cobalt-electric" aria-hidden="true" />
                      포트폴리오용 데모 사이트라 실제 결제와 배송은 진행되지 않습니다. 담은 원두는 그대로 남아 있습니다.
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => setOrdered(true)} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-cobalt-electric text-body-lg font-semibold text-on-primary hover:bg-primary">
                  {won(t.total)} 주문하기
                </button>
                <button type="button" onClick={clear} className="min-h-11 w-full text-body-sm text-secondary underline-offset-2 hover:underline">
                  장바구니 비우기
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-end sm:inset-x-auto sm:right-6">
        {toast && (
          <div role="status" className="pointer-events-auto flex items-center gap-3 rounded-lg bg-navy-ink px-5 py-3 text-body-sm font-medium text-on-primary shadow-xl">
            <CheckCircle2 className="size-5 shrink-0 text-primary-fixed-dim" aria-hidden="true" />
            <span>{toast}</span>
            <button type="button" onClick={() => setOpen(true)} className="min-h-11 shrink-0 font-semibold text-primary-fixed underline underline-offset-2">
              보기
            </button>
          </div>
        )}
      </div>
    </>
  );
}
