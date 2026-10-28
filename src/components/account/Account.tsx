"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { LayoutDashboard, LogOut } from "lucide-react";
import { auth, db, errorMessage, isAdmin, useUser } from "@/lib/firebase";
import type { Order } from "@/lib/orders";
import { btnPrimary } from "../ui";
import AuthForm from "./AuthForm";
import { OrderCard, toOrder } from "./OrderView";

export default function Account() {
  const user = useUser();
  if (user === undefined) return <p className="py-space-xl text-center text-body-md text-secondary">로그인 상태를 확인하고 있습니다…</p>;
  if (!user) return <AuthForm title="로그인 · 회원가입" note="로그인하면 주문 내역과 배송 현황을 볼 수 있습니다." />;

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-end justify-between gap-space-sm">
        <div>
          <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">My Account</span>
          <h1 className="text-headline-lg-mobile text-navy-ink md:text-headline-lg">{user.displayName || "고객"}님의 주문</h1>
          <p className="text-body-sm text-secondary">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin(user) && (
            <Link href="/admin/" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-navy-ink px-4 text-body-md font-semibold text-on-primary hover:bg-primary">
              <LayoutDashboard className="size-4" aria-hidden="true" /> 관리자 대시보드
            </Link>
          )}
          <button type="button" onClick={() => signOut(auth())} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-surface-container-high px-4 text-body-md font-semibold text-navy-ink hover:bg-surface-dim">
            <LogOut className="size-4" aria-hidden="true" /> 로그아웃
          </button>
        </div>
      </div>
      <MyOrders uid={user.uid} />
    </div>
  );
}

function MyOrders({ uid }: { uid: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  // 복합 색인 없이 쓰려고 정렬은 받아 온 뒤 브라우저에서 한다.
  useEffect(
    () =>
      onSnapshot(
        query(collection(db(), "lwOrders"), where("uid", "==", uid)),
        (s) => setOrders(s.docs.map(toOrder).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))),
        (e) => setError(errorMessage(e)),
      ),
    [uid],
  );

  if (error) return <p className="rounded-lg bg-error/10 p-space-md text-body-md text-error">{error}</p>;
  if (!orders) return <p className="text-body-md text-secondary">주문 내역을 불러오고 있습니다…</p>;
  if (orders.length === 0)
    return (
      <div className="flex flex-col items-center gap-space-sm rounded-xl bg-canvas-card p-space-xl text-center shadow-sm">
        <p className="text-body-md text-secondary">아직 주문 내역이 없습니다.</p>
        <Link href="/beans/" className={btnPrimary}>
          원두 고르러 가기
        </Link>
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}
