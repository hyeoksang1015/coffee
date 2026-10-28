// 주문 규칙. 브라우저(주문서·관리자 화면)와 서버 함수(functions/api)가 함께 쓴다.
import { getBean } from "@/data/beans";
import { isPhone } from "./forms";
import { parseCart, totals, type CartItem } from "./cart";

export const STATUS = {
  pending: { label: "결제 대기", tone: "bg-surface-container text-secondary" },
  paid: { label: "결제 완료", tone: "bg-secondary-container text-navy-ink" },
  preparing: { label: "상품 준비중", tone: "bg-accent-amber/15 text-accent-amber" },
  shipping: { label: "배송중", tone: "bg-cobalt-electric/10 text-cobalt-electric" },
  delivered: { label: "배송 완료", tone: "bg-emerald-700/10 text-emerald-700" },
  cancelled: { label: "취소·환불", tone: "bg-error/10 text-error" },
} as const;
export type Status = keyof typeof STATUS;

/** 고객 화면의 진행 단계 */
export const STEPS: Status[] = ["paid", "preparing", "shipping", "delivered"];

export const CARRIERS = ["CJ대한통운", "롯데택배", "한진택배", "우체국택배", "로젠택배"] as const;

export type Shipping = { name: string; phone: string; address: string; memo: string };
export type Order = {
  id: string;
  uid: string;
  email: string;
  items: CartItem[];
  orderName: string;
  amount: number;
  shipping: Shipping;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
  payment?: { method: string; approvedAt: string; receiptUrl: string; paymentKey: string };
  tracking?: { carrier: string; number: string };
  cancel?: { reason: string; at: string };
};

/** 토스 orderId 규칙(영문·숫자·-·_ 6~64자)에 맞춘 주문번호. 예: LW-20261028-K3F9Q2 */
export function newOrderId(now = new Date(), rand = () => Math.random()) {
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const code = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rand() * 32)]).join("");
  return `LW-${ymd}-${code}`;
}

export function orderName(items: CartItem[]) {
  const first = getBean(items[0]?.slug)?.name ?? "원두";
  return items.length > 1 ? `${first} 외 ${items.length - 1}건` : first;
}

export function validateShipping(s: Shipping) {
  const e: Partial<Record<keyof Shipping, string>> = {};
  if (!s.name.trim()) e.name = "받는 분 성함을 입력해 주세요.";
  else if (s.name.trim().length > 30) e.name = "30자 이내로 입력해 주세요.";
  if (!isPhone(s.phone)) e.phone = "연락처를 010-0000-0000 형식으로 입력해 주세요.";
  if (s.address.trim().length < 5) e.address = "배송받을 주소를 입력해 주세요.";
  else if (s.address.trim().length > 200) e.address = "200자 이내로 입력해 주세요.";
  if (s.memo.length > 100) e.memo = "100자 이내로 입력해 주세요.";
  return e;
}

/** 저장된 주문 상품으로 결제 금액을 다시 계산한다. 카탈로그에 없는 상품이 섞여 있으면 null. */
export function expectedAmount(raw: unknown) {
  const items = parseCart(raw);
  if (!Array.isArray(raw) || items.length === 0 || items.length !== raw.length) return null;
  if (items.some((i, n) => i.qty !== (raw[n] as CartItem).qty)) return null;
  return totals(items).total;
}
