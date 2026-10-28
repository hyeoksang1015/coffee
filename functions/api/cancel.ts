// POST /api/cancel — 관리자가 결제를 취소(전액 환불)한다. Authorization: Bearer <관리자 Firebase 토큰>
import { callerUid, getDoc, json, ORDER_ID, patchDoc, serverToken, toss, handle } from "../../src/lib/server";

export const onRequestPost = handle(async ({ request, env }) => {
  const uid = await callerUid(env, request);
  if (!uid || !env.ADMIN_UIDS.split(",").includes(uid)) return json({ message: "관리자만 환불할 수 있습니다." }, 403);

  const body = (await request.json().catch(() => null)) as { orderId?: unknown; reason?: unknown } | null;
  const { orderId, reason } = body ?? {};
  if (typeof orderId !== "string" || !ORDER_ID.test(orderId) || typeof reason !== "string" || !reason.trim() || reason.length > 200) {
    return json({ message: "주문번호와 취소 사유를 확인해 주세요." }, 400);
  }

  const token = await serverToken(env);
  const path = `lwOrders/${orderId}`;
  const order = await getDoc(env, token, path);
  const paymentKey = (order?.payment as { paymentKey?: string } | undefined)?.paymentKey;
  if (!order || !paymentKey) return json({ message: "결제된 주문이 아닙니다." }, 404);
  if (!["paid", "preparing", "shipping", "delivered"].includes(order.status as string)) return json({ message: "이미 취소된 주문입니다." }, 409);

  const res = await toss(env, `/v1/payments/${encodeURIComponent(paymentKey)}/cancel`, { cancelReason: reason.trim() });
  // 토스 쪽은 이미 취소됐는데 주문만 남은 경우도 취소로 맞춘다.
  if (!res.ok && res.data.code !== "ALREADY_CANCELED_PAYMENT") return json({ message: res.data.message ?? "환불에 실패했습니다.", code: res.data.code }, res.status);

  await patchDoc(env, token, path, { status: "cancelled", cancel: { reason: reason.trim(), at: new Date().toISOString() }, updatedAt: new Date() });
  return json({ ok: true });
});
