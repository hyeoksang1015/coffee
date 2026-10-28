"use client";

import Image from "next/image";
import type { DocumentSnapshot } from "firebase/firestore";
import { Check } from "lucide-react";
import { getBean } from "@/data/beans";
import { won } from "@/data/site";
import { GRINDS, linePrice, PLAN_LABEL } from "@/lib/cart";
import { STATUS, STEPS, type Order, type Status } from "@/lib/orders";

export function toOrder(d: DocumentSnapshot): Order {
  const v = d.data() as Omit<Order, "id" | "createdAt" | "updatedAt"> & { createdAt?: { toDate(): Date }; updatedAt?: { toDate(): Date } };
  return { ...v, id: d.id, createdAt: v.createdAt?.toDate(), updatedAt: v.updatedAt?.toDate() };
}

export const when = (d?: Date) => (d ? d.toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-");

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-label-caps ${STATUS[status].tone}`}>{STATUS[status].label}</span>;
}

/** 결제 완료 → 준비 → 배송 → 도착 진행 막대 */
export function Steps({ status }: { status: Status }) {
  const at = STEPS.indexOf(status);
  if (at < 0) return null;
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label={`진행 상태: ${STATUS[status].label}`}>
      {STEPS.map((s, n) => (
        <li key={s} aria-current={n === at ? "step" : undefined} className="flex flex-col gap-1.5">
          <span className={`h-1.5 rounded-full ${n <= at ? "bg-cobalt-electric" : "bg-surface-variant"}`} />
          <span className={`flex items-center gap-1 text-[11px] sm:text-body-sm ${n <= at ? "font-semibold text-navy-ink" : "text-secondary"}`}>
            {n < at && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
            {STATUS[s].label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Items({ order }: { order: Order }) {
  return (
    <ul className="divide-y divide-line-neutral">
      {order.items.map((i) => {
        const bean = getBean(i.slug);
        return (
          <li key={`${i.slug}|${i.grams}|${i.grind}|${i.plan}`} className="flex items-center gap-3 py-2">
            {bean && <Image src={bean.image} alt="" width={48} height={48} className="size-12 shrink-0 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md font-semibold text-navy-ink">{bean?.name ?? i.slug}</p>
              <p className="text-body-sm text-secondary">
                {bean?.sizes.find((s) => s.grams === i.grams)?.label} · {GRINDS.find((g) => g.id === i.grind)?.label} · {PLAN_LABEL[i.plan]} · {i.qty}개
              </p>
            </div>
            <span className="text-body-md tabular-nums text-navy-ink">{won(linePrice(i))}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** 고객의 주문 내역 카드 */
export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="space-y-space-sm rounded-xl bg-canvas-card p-space-md shadow-sm" data-order={order.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-spec-num text-secondary">{order.id}</p>
          <h3 className="text-headline-sm text-navy-ink">{order.orderName}</h3>
          <p className="text-body-sm text-secondary">{when(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={order.status} />
          <span className="text-headline-sm tabular-nums text-navy-ink">{won(order.amount)}</span>
        </div>
      </div>
      <Steps status={order.status} />
      {order.tracking && (
        <p className="rounded-lg bg-warm-canvas p-space-sm text-body-sm text-navy-ink">
          {order.tracking.carrier} 송장번호 <strong className="tabular-nums">{order.tracking.number}</strong>
        </p>
      )}
      {order.status === "pending" && <p className="text-body-sm text-secondary">결제가 끝나지 않은 주문입니다. 결제창을 닫았다면 장바구니에서 다시 주문해 주세요.</p>}
      {order.cancel && <p className="text-body-sm text-error">취소 사유: {order.cancel.reason}</p>}
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer items-center text-body-sm font-semibold text-cobalt-electric">주문 상품 · 배송지 보기</summary>
        <Items order={order} />
        <p className="mt-2 text-body-sm text-secondary">
          {order.shipping.name} · {order.shipping.phone} · {order.shipping.address}
          {order.shipping.memo && ` · ${order.shipping.memo}`}
        </p>
        {order.payment?.receiptUrl && (
          <a href={order.payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center text-body-sm text-cobalt-electric underline underline-offset-2">
            결제 영수증 보기 ({order.payment.method})
          </a>
        )}
      </details>
    </article>
  );
}
