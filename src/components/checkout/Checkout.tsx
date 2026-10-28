"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Lock } from "lucide-react";
import { getBean } from "@/data/beans";
import { site, won } from "@/data/site";
import { GRINDS, lineKey, linePrice, PLAN_LABEL, totals } from "@/lib/cart";
import { db, errorMessage, useUser } from "@/lib/firebase";
import { newOrderId, orderName, validateShipping, type Shipping } from "@/lib/orders";
import AuthForm from "../account/AuthForm";
import { useCart } from "../CartProvider";
import { btnPrimary, field } from "../ui";

// 문서용 공개 테스트 키. 실제 돈은 빠져나가지 않는다. 내 상점 키로 바꾸려면 .env.local 의 NEXT_PUBLIC_TOSS_CLIENT_KEY.
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";
const BASE = process.env.BASE_PATH ?? "";

export default function Checkout() {
  const user = useUser();
  const { items } = useCart();

  if (user === undefined) return <p className="py-space-xl text-center text-body-md text-secondary">로그인 상태를 확인하고 있습니다…</p>;
  if (!user) return <AuthForm title="주문하려면 로그인해 주세요" note="주문 내역과 배송 현황을 계정에 저장합니다. 처음이면 회원가입을 눌러 주세요." />;
  if (items.length === 0)
    return (
      <div className="flex flex-col items-center gap-space-sm py-space-xl text-center">
        <h1 className="text-headline-md text-navy-ink">장바구니가 비어 있습니다.</h1>
        <Link href="/beans/" className={btnPrimary}>
          원두 고르러 가기
        </Link>
      </div>
    );
  return <CheckoutForm user={user} />;
}

function CheckoutForm({ user }: { user: User }) {
  const { items } = useCart();
  const t = totals(items);
  const widgets = useRef<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Shipping, string>>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // 결제 UI 는 한 번만 그리고, 금액이 바뀌면 금액만 알려 준다.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const w = (await loadTossPayments(CLIENT_KEY)).widgets({ customerKey: user.uid });
        await w.setAmount({ currency: "KRW", value: t.total });
        if (!alive) return;
        await Promise.all([w.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }), w.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" })]);
        widgets.current = w;
        setReady(true);
      } catch (e) {
        if (alive) setError(`결제 화면을 불러오지 못했습니다. ${(e as Error).message ?? ""}`);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 금액 변경은 아래 effect 가 맡는다.
  }, [user.uid]);

  useEffect(() => {
    widgets.current?.setAmount({ currency: "KRW", value: t.total });
  }, [t.total]);

  async function pay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s: Shipping = { name: String(f.get("name") ?? "").trim(), phone: String(f.get("phone") ?? "").trim(), address: String(f.get("address") ?? "").trim(), memo: String(f.get("memo") ?? "").trim() };
    const found = validateShipping(s);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    if (!widgets.current) return;

    setBusy(true);
    setError("");
    const orderId = newOrderId();
    const name = orderName(items);
    try {
      // 결제 전에 결제 대기 주문을 저장한다. 서버는 이 주문의 상품으로 금액을 다시 계산해 승인한다.
      await setDoc(doc(db(), "lwOrders", orderId), { uid: user.uid, email: user.email, items, orderName: name, amount: t.total, shipping: s, status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await widgets.current.requestPayment({
        orderId,
        orderName: name,
        successUrl: `${location.origin}${BASE}/checkout/success/`,
        failUrl: `${location.origin}${BASE}/checkout/fail/`,
        customerEmail: user.email ?? undefined,
        customerName: s.name,
        customerMobilePhone: s.phone.replace(/\D/g, ""),
      });
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(code === "USER_CANCEL" ? "결제를 취소했습니다." : code?.startsWith("NEED_") || code === "NOT_SELECTED_PAYMENT_METHOD" ? (err as Error).message : errorMessage(err));
      setBusy(false);
    }
  }

  const input = (k: keyof Shipping, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, required = true) => (
    <div>
      <label htmlFor={`s-${k}`} className="mb-1 block text-label-caps uppercase text-navy-ink">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input id={`s-${k}`} name={k} aria-invalid={errors[k] ? true : undefined} aria-describedby={errors[k] ? `s-${k}-error` : undefined} className={`${field} h-11`} {...props} />
      {errors[k] && (
        <p id={`s-${k}-error`} className="mt-1 text-body-sm text-error">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form noValidate onSubmit={pay} className="grid grid-cols-1 gap-space-lg lg:grid-cols-[1fr_24rem]">
      <div className="space-y-space-lg">
        <div>
          <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Checkout</span>
          <h1 className="text-headline-lg-mobile text-navy-ink md:text-headline-lg">주문 · 결제</h1>
        </div>
        <section aria-labelledby="ship-title" className="space-y-space-md rounded-xl bg-canvas-card p-space-md shadow-sm md:p-space-lg">
          <h2 id="ship-title" className="text-headline-sm text-navy-ink">
            배송 정보
          </h2>
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
            {input("name", "받는 분", { autoComplete: "name", maxLength: 30, defaultValue: user.displayName ?? "" })}
            {input("phone", "연락처", { type: "tel", autoComplete: "tel", maxLength: 20, placeholder: "010-0000-0000" })}
          </div>
          {input("address", "주소", { autoComplete: "street-address", maxLength: 200, placeholder: "예: 서울시 마포구 독막로 00, 101동 1001호" })}
          {input("memo", "배송 메모", { maxLength: 100, placeholder: "예: 문 앞에 놓아 주세요" }, false)}
        </section>
        <section aria-labelledby="pay-title" className="rounded-xl bg-canvas-card p-space-sm shadow-sm md:p-space-md">
          <h2 id="pay-title" className="px-space-sm pt-space-sm text-headline-sm text-navy-ink">
            결제 수단
          </h2>
          {!ready && !error && <p className="px-space-sm py-space-md text-body-md text-secondary">결제 화면을 불러오고 있습니다…</p>}
          <div id="payment-method" />
          <div id="agreement" />
        </section>
      </div>

      <aside className="h-fit space-y-space-md rounded-xl bg-canvas-card p-space-md shadow-sm lg:sticky lg:top-24">
        <h2 className="text-headline-sm text-navy-ink">주문 상품 {t.count}개</h2>
        <ul className="divide-y divide-line-neutral">
          {items.map((i) => {
            const bean = getBean(i.slug)!;
            return (
              <li key={lineKey(i)} className="flex gap-3 py-2">
                <Image src={bean.image} alt="" width={48} height={48} className="size-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-md font-semibold text-navy-ink">{bean.name}</p>
                  <p className="text-body-sm text-secondary">
                    {bean.sizes.find((s) => s.grams === i.grams)?.label} · {GRINDS.find((g) => g.id === i.grind)?.label} · {PLAN_LABEL[i.plan]} · {i.qty}개
                  </p>
                </div>
                <span className="text-body-md tabular-nums">{won(linePrice(i))}</span>
              </li>
            );
          })}
        </ul>
        <dl className="space-y-1.5 border-t border-line-neutral pt-space-sm text-body-md">
          <div className="flex justify-between">
            <dt className="text-secondary">상품 금액</dt>
            <dd className="tabular-nums">{won(t.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-secondary">배송비</dt>
            <dd className="tabular-nums">{t.shipping ? won(t.shipping) : "무료"}</dd>
          </div>
          <div className="flex justify-between pt-1 text-headline-sm text-navy-ink">
            <dt>결제 금액</dt>
            <dd className="text-cobalt-electric tabular-nums" data-testid="checkout-total">
              {won(t.total)}
            </dd>
          </div>
        </dl>
        {t.shipping > 0 && <p className="text-body-sm text-secondary">{won(site.freeShipping - t.subtotal)} 더 담으면 무료배송입니다.</p>}
        <p role="alert" className="text-body-sm text-error empty:hidden">
          {error}
        </p>
        <button type="submit" disabled={!ready || busy} className={`${btnPrimary} min-h-12 w-full disabled:opacity-60`}>
          <Lock className="size-4" aria-hidden="true" /> {busy ? "결제창 여는 중…" : `${won(t.total)} 결제하기`}
        </button>
        <p className="text-body-sm text-secondary">토스페이먼츠 테스트 결제입니다. 카드 정보를 넣어도 실제로 돈이 빠져나가지 않습니다.</p>
      </aside>
    </form>
  );
}
