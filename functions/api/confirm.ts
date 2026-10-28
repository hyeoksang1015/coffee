// POST /api/confirm — 토스 결제창에서 돌아온 결제를 승인한다.
// 금액은 브라우저가 보낸 값을 믿지 않고, 저장된 주문 상품으로 다시 계산해 맞을 때만 승인한다.
import { expectedAmount } from "../../src/lib/orders";
import { getDoc, json, ORDER_ID, patchDoc, serverToken, toss, handle } from "../../src/lib/server";

export const onRequestPost = handle(async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as { paymentKey?: unknown; orderId?: unknown; amount?: unknown } | null;
  const { paymentKey, orderId, amount } = body ?? {};
  if (typeof paymentKey !== "string" || !paymentKey || paymentKey.length > 200 || typeof orderId !== "string" || !ORDER_ID.test(orderId) || !Number.isInteger(amount)) {
    return json({ message: "결제 정보가 올바르지 않습니다." }, 400);
  }

  const token = await serverToken(env);
  const path = `lwOrders/${orderId}`;
  const order = await getDoc(env, token, path);
  if (!order) return json({ message: "주문을 찾을 수 없습니다." }, 404);
  const payment = order.payment as { paymentKey?: string } | undefined;
  // 결제 완료 화면을 새로고침한 경우
  if (order.status === "paid" && payment?.paymentKey === paymentKey) return json({ ok: true, orderId });
  if (order.status !== "pending") return json({ message: "이미 처리된 주문입니다." }, 409);

  const expected = expectedAmount(order.items);
  if (expected === null || expected !== order.amount || amount !== order.amount) return json({ message: "결제 금액이 주문 금액과 다릅니다." }, 400);

  const res = await toss(env, "/v1/payments/confirm", { paymentKey, orderId, amount });
  if (!res.ok) return json({ message: res.data.message ?? "결제 승인에 실패했습니다.", code: res.data.code }, res.status);

  const d = res.data as { method?: string; approvedAt?: string; receipt?: { url?: string } };
  try {
    await patchDoc(env, token, path, {
      status: "paid",
      payment: { paymentKey, method: d.method ?? "", approvedAt: d.approvedAt ?? "", receiptUrl: d.receipt?.url ?? "" },
      updatedAt: new Date(),
    });
  } catch {
    // 돈은 빠져나갔는데 주문이 결제 대기로 남지 않도록 승인을 바로 취소한다.
    await toss(env, `/v1/payments/${encodeURIComponent(paymentKey)}/cancel`, { cancelReason: "주문 저장 실패로 자동 취소" });
    return json({ message: "주문 저장에 실패해 결제를 자동 취소했습니다. 다시 시도해 주세요." }, 500);
  }
  return json({ ok: true, orderId });
});
