"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { won } from "@/data/site";
import { useCart } from "../CartProvider";
import { btnPrimary, btnSoft } from "../ui";

const BASE = process.env.BASE_PATH ?? "";

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="mx-auto flex max-w-lg flex-col items-center gap-space-sm rounded-xl bg-canvas-card p-space-lg text-center shadow-sm">
      {icon}
      <h1 className="text-headline-md text-navy-ink">{title}</h1>
      {children}
    </div>
  );
}

/** 토스 결제창이 successUrl 로 돌려보내면 서버(/api/confirm)에 승인을 요청한다. */
export function CheckoutSuccess() {
  const q = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<{ ok?: boolean; message?: string }>({});
  const sent = useRef(false);
  const orderId = q.get("orderId") ?? "";
  const amount = Number(q.get("amount"));

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch(`${BASE}/api/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ paymentKey: q.get("paymentKey"), orderId, amount }) })
      .then(async (r) => {
        const d = (await r.json().catch(() => ({}))) as { message?: string };
        if (!r.ok) return setState({ ok: false, message: d.message ?? `결제 승인에 실패했습니다. (${r.status})` });
        clear();
        setState({ ok: true });
      })
      .catch(() => setState({ ok: false, message: "네트워크 문제로 결제 승인을 확인하지 못했습니다. 내 주문에서 상태를 확인해 주세요." }));
  }, [q, orderId, amount, clear]);

  if (state.ok === undefined)
    return (
      <Panel icon={<LoaderCircle className="size-10 animate-spin text-cobalt-electric" aria-hidden="true" />} title="결제를 승인하고 있습니다…">
        <p className="text-body-md text-secondary">창을 닫지 말고 잠시만 기다려 주세요.</p>
      </Panel>
    );
  if (!state.ok)
    return (
      <Panel icon={<CircleAlert className="size-10 text-error" aria-hidden="true" />} title="결제를 완료하지 못했습니다">
        <p className="text-body-md text-secondary">{state.message}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/checkout/" className={btnPrimary}>
            다시 결제하기
          </Link>
          <Link href="/account/" className={btnSoft}>
            내 주문 보기
          </Link>
        </div>
      </Panel>
    );
  return (
    <Panel icon={<CheckCircle2 className="size-10 text-cobalt-electric" aria-hidden="true" />} title="주문이 완료되었습니다">
      <p className="text-body-md text-secondary">
        주문번호 <strong className="text-navy-ink">{orderId}</strong> · {won(amount)}
      </p>
      <p className="text-body-sm text-secondary">로스팅 후 출고되면 내 주문에서 송장번호와 배송 현황을 볼 수 있습니다.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/account/" className={btnPrimary}>
          주문 · 배송 현황 보기
        </Link>
        <Link href="/beans/" className={btnSoft}>
          쇼핑 계속하기
        </Link>
      </div>
    </Panel>
  );
}

/** 결제창에서 실패하거나 취소하면 failUrl 로 돌아온다. 주문은 결제 대기로 남는다. */
export function CheckoutFail() {
  const q = useSearchParams();
  const cancelled = q.get("code") === "PAY_PROCESS_CANCELED";
  return (
    <Panel icon={<CircleAlert className="size-10 text-error" aria-hidden="true" />} title={cancelled ? "결제를 취소했습니다" : "결제에 실패했습니다"}>
      <p className="text-body-md text-secondary">{cancelled ? "장바구니는 그대로 남아 있습니다." : (q.get("message") ?? "알 수 없는 오류입니다.")}</p>
      <Link href="/checkout/" className={btnPrimary}>
        다시 결제하기
      </Link>
    </Panel>
  );
}
