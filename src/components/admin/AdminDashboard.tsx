"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { LogOut, PackageCheck, Search, Truck, Wallet } from "lucide-react";
import { won } from "@/data/site";
import { auth, db, errorMessage, isAdmin, useUser } from "@/lib/firebase";
import { VOLUMES } from "@/lib/forms";
import { CARRIERS, STATUS, type Order, type Status } from "@/lib/orders";
import AuthForm from "../account/AuthForm";
import { Items, StatusBadge, toOrder, when } from "../account/OrderView";
import { field } from "../ui";

const BASE = process.env.BASE_PATH ?? "";
const PAID: Status[] = ["paid", "preparing", "shipping", "delivered"];

type Inquiry = { id: string; store: string; manager: string; phone: string; location: string; status: string; volume: string; profiles: string[]; message: string; handled: boolean; createdAt?: Date };

export default function AdminDashboard() {
  const user = useUser();
  if (user === undefined) return <p className="py-space-xl text-center text-body-md text-secondary">로그인 상태를 확인하고 있습니다…</p>;
  if (!user) return <AuthForm title="관리자 로그인" note="관리자 계정으로 로그인하면 주문·배송·납품 문의를 관리할 수 있습니다." />;
  if (!isAdmin(user))
    return (
      <div className="mx-auto max-w-md space-y-space-sm rounded-xl bg-canvas-card p-space-lg text-center shadow-sm">
        <h1 className="text-headline-md text-navy-ink">관리자 권한이 없는 계정입니다</h1>
        <p className="text-body-md text-secondary">{user.email} 으로 로그인되어 있습니다.</p>
        <button type="button" onClick={() => signOut(auth())} className="min-h-11 rounded-lg bg-surface-container-high px-5 text-body-md font-semibold text-navy-ink">
          로그아웃하고 다른 계정으로 로그인
        </button>
      </div>
    );
  return <Dashboard user={user} />;
}

function Dashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orders" | "inquiries">("orders");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [q, setQ] = useState("");

  // 실시간 구독: 고객이 결제하면 새로고침 없이 목록에 나타난다.
  useEffect(() => {
    const fail = (e: Error) => setError(errorMessage(e));
    const off1 = onSnapshot(query(collection(db(), "lwOrders"), orderBy("createdAt", "desc"), limit(300)), (s) => setOrders(s.docs.map(toOrder)), fail);
    const off2 = onSnapshot(
      query(collection(db(), "lwInquiries"), orderBy("createdAt", "desc"), limit(200)),
      (s) => setInquiries(s.docs.map((d) => ({ ...(d.data() as Omit<Inquiry, "id" | "createdAt">), id: d.id, createdAt: d.data().createdAt?.toDate() }))),
      fail,
    );
    return () => {
      off1();
      off2();
    };
  }, []);

  const stats = useMemo(() => {
    const list = orders ?? [];
    const today = new Date().toDateString();
    const paid = list.filter((o) => PAID.includes(o.status));
    return {
      today: paid.filter((o) => o.createdAt?.toDateString() === today).length,
      revenue: paid.reduce((s, o) => s + o.amount, 0),
      toShip: list.filter((o) => o.status === "paid" || o.status === "preparing").length,
      shipping: list.filter((o) => o.status === "shipping").length,
    };
  }, [orders]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders ?? []).filter(
      (o) => (filter === "all" || o.status === filter) && (!term || [o.id, o.shipping.name, o.shipping.phone, o.email, o.orderName].some((v) => v?.toLowerCase().includes(term))),
    );
  }, [orders, filter, q]);

  const count = (s: Status) => (orders ?? []).filter((o) => o.status === s).length;
  const open = inquiries.filter((i) => !i.handled).length;

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-end justify-between gap-space-sm">
        <div>
          <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Admin Dashboard</span>
          <h1 className="text-headline-lg-mobile text-navy-ink md:text-headline-lg">주문 · 배송 관리</h1>
          <p className="text-body-sm text-secondary">{user.email}</p>
        </div>
        <button type="button" onClick={() => signOut(auth())} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-surface-container-high px-4 text-body-md font-semibold text-navy-ink hover:bg-surface-dim">
          <LogOut className="size-4" aria-hidden="true" /> 로그아웃
        </button>
      </div>

      {error && <p className="rounded-lg bg-error/10 p-space-md text-body-md text-error">{error}</p>}

      <dl className="grid grid-cols-2 gap-space-sm lg:grid-cols-4">
        {[
          { label: "오늘 결제된 주문", value: `${stats.today}건`, Icon: PackageCheck },
          { label: "누적 결제 금액", value: won(stats.revenue), Icon: Wallet },
          { label: "발송 대기", value: `${stats.toShip}건`, Icon: PackageCheck },
          { label: "배송중", value: `${stats.shipping}건`, Icon: Truck },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-xl bg-canvas-card p-space-md shadow-sm">
            <dt className="flex items-center gap-1.5 text-body-sm text-secondary">
              <Icon className="size-4" aria-hidden="true" /> {label}
            </dt>
            <dd className="mt-1 text-headline-md tabular-nums text-navy-ink" data-testid={`stat-${label}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div role="tablist" aria-label="관리 메뉴" className="flex gap-1 rounded-lg bg-surface-container p-1 sm:w-fit">
        {(
          [
            ["orders", `주문 관리 ${orders?.length ?? 0}`],
            ["inquiries", `B2B 문의 ${open ? `· 새 문의 ${open}` : inquiries.length}`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className="min-h-11 flex-1 rounded-lg px-4 text-body-md font-semibold text-secondary aria-selected:bg-canvas-card aria-selected:text-navy-ink aria-selected:shadow-sm sm:flex-none">
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <section className="space-y-space-md" aria-label="주문 목록">
          <div className="flex flex-col gap-space-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="상태로 거르기">
              {(["all", ...(Object.keys(STATUS) as Status[])] as const).map((s) => (
                <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className="min-h-11 rounded-lg bg-canvas-card px-3 text-body-sm text-secondary shadow-sm aria-pressed:bg-navy-ink aria-pressed:text-on-primary">
                  {s === "all" ? `전체 ${orders?.length ?? 0}` : `${STATUS[s].label} ${count(s)}`}
                </button>
              ))}
            </div>
            <label className="relative block lg:w-72">
              <span className="sr-only">주문 검색</span>
              <Search className="pointer-events-none absolute top-3 left-3 size-5 text-secondary" aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="주문번호 · 이름 · 연락처" className={`${field} h-11 pl-10`} />
            </label>
          </div>
          {!orders ? (
            <p className="text-body-md text-secondary">주문을 불러오고 있습니다…</p>
          ) : shown.length === 0 ? (
            <p className="rounded-xl bg-canvas-card p-space-lg text-center text-body-md text-secondary shadow-sm">조건에 맞는 주문이 없습니다.</p>
          ) : (
            <ul className="space-y-space-xs">
              {shown.map((o) => (
                <li key={o.id}>
                  <OrderRow order={o} user={user} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <Inquiries list={inquiries} />
      )}
    </div>
  );
}

function OrderRow({ order: o, user }: { order: Order; user: User }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run(job: () => Promise<unknown>) {
    setBusy(true);
    setMsg("");
    try {
      await job();
    } catch (e) {
      setMsg((e as Error).message && !(e as { code?: string }).code ? (e as Error).message : errorMessage(e));
    }
    setBusy(false);
  }

  const setStatus = (status: Status, extra: Record<string, unknown> = {}) => run(() => updateDoc(doc(db(), "lwOrders", o.id), { status, ...extra, updatedAt: serverTimestamp() }));

  function ship(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const carrier = String(f.get("carrier"));
    const number = String(f.get("number") ?? "").replace(/\D/g, "");
    if (number.length < 8 || number.length > 20) return setMsg("송장번호를 숫자 8~20자리로 입력해 주세요.");
    setStatus("shipping", { tracking: { carrier, number } });
  }

  function refund() {
    const reason = prompt(`${o.id} 주문을 전액 환불합니다. 취소 사유를 입력해 주세요.`, "고객 요청");
    if (!reason?.trim()) return;
    run(async () => {
      const r = await fetch(`${BASE}/api/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ orderId: o.id, reason }),
      });
      if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { message?: string }).message ?? `환불 실패 (${r.status})`);
    });
  }

  const act = "min-h-11 rounded-lg px-4 text-body-sm font-semibold disabled:opacity-50";
  return (
    <details className="group rounded-xl bg-canvas-card shadow-sm" data-order={o.id}>
      <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-space-sm gap-y-1 p-space-sm sm:grid-cols-[11rem_1fr_auto_auto] sm:p-space-md">
        <span className="text-spec-num text-secondary">
          {o.id}
          <br className="hidden sm:block" />
          <span className="sm:hidden"> · </span>
          {when(o.createdAt)}
        </span>
        <span className="col-start-1 min-w-0 sm:col-start-auto">
          <span className="block truncate text-body-md font-semibold text-navy-ink">{o.orderName}</span>
          <span className="block truncate text-body-sm text-secondary">
            {o.shipping.name} · {o.shipping.phone}
          </span>
        </span>
        <span className="row-start-1 col-start-2 text-right text-body-md font-semibold tabular-nums text-navy-ink sm:row-start-auto sm:col-start-auto">{won(o.amount)}</span>
        <span className="col-start-2 text-right sm:col-start-auto">
          <StatusBadge status={o.status} />
        </span>
      </summary>
      <div className="grid grid-cols-1 gap-space-md border-t border-line-neutral p-space-sm sm:p-space-md lg:grid-cols-2">
        <div>
          <h3 className="mb-1 text-label-caps uppercase text-secondary">주문 상품</h3>
          <Items order={o} />
        </div>
        <div className="space-y-space-sm text-body-sm">
          <dl className="grid grid-cols-[5rem_1fr] gap-y-1">
            <dt className="text-secondary">주문자</dt>
            <dd className="break-all">{o.email}</dd>
            <dt className="text-secondary">배송지</dt>
            <dd>
              {o.shipping.name} · {o.shipping.phone}
              <br />
              {o.shipping.address}
              {o.shipping.memo && <span className="block text-secondary">메모: {o.shipping.memo}</span>}
            </dd>
            {o.payment && (
              <>
                <dt className="text-secondary">결제</dt>
                <dd>
                  {o.payment.method} · {when(new Date(o.payment.approvedAt))}{" "}
                  {o.payment.receiptUrl && (
                    <a href={o.payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-cobalt-electric underline underline-offset-2">
                      영수증
                    </a>
                  )}
                </dd>
              </>
            )}
            {o.tracking && (
              <>
                <dt className="text-secondary">송장</dt>
                <dd>
                  {o.tracking.carrier} {o.tracking.number}
                </dd>
              </>
            )}
            {o.cancel && (
              <>
                <dt className="text-secondary">취소</dt>
                <dd className="text-error">
                  {o.cancel.reason} · {when(new Date(o.cancel.at))}
                </dd>
              </>
            )}
          </dl>

          <div className="flex flex-wrap gap-2">
            {o.status === "paid" && (
              <button type="button" disabled={busy} onClick={() => setStatus("preparing")} className={`${act} bg-navy-ink text-on-primary`}>
                상품 준비 시작
              </button>
            )}
            {o.status === "shipping" && (
              <button type="button" disabled={busy} onClick={() => setStatus("delivered")} className={`${act} bg-navy-ink text-on-primary`}>
                배송 완료 처리
              </button>
            )}
            {o.status === "pending" && (
              <button type="button" disabled={busy} onClick={() => setStatus("cancelled")} className={`${act} bg-surface-container-high text-navy-ink`}>
                미결제 주문 정리
              </button>
            )}
            {PAID.includes(o.status) && (
              <button type="button" disabled={busy} onClick={refund} className={`${act} bg-error/10 text-error`}>
                결제 취소 · 환불
              </button>
            )}
          </div>
          {(o.status === "paid" || o.status === "preparing") && (
            <form onSubmit={ship} className="flex flex-wrap gap-2" aria-label="송장 등록">
              <select name="carrier" aria-label="택배사" className={`${field} h-11 w-auto`}>
                {CARRIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input name="number" inputMode="numeric" aria-label="송장번호" placeholder="송장번호" maxLength={24} className={`${field} h-11 min-w-0 flex-1`} />
              <button type="submit" disabled={busy} className={`${act} bg-cobalt-electric text-on-primary`}>
                송장 등록 · 배송 시작
              </button>
            </form>
          )}
          <p role="alert" className="text-error empty:hidden">
            {msg}
          </p>
        </div>
      </div>
    </details>
  );
}

function Inquiries({ list }: { list: Inquiry[] }) {
  if (list.length === 0) return <p className="rounded-xl bg-canvas-card p-space-lg text-center text-body-md text-secondary shadow-sm">아직 납품 문의가 없습니다.</p>;
  return (
    <ul className="grid grid-cols-1 gap-space-sm lg:grid-cols-2" aria-label="B2B 납품 문의">
      {list.map((i) => (
        <li key={i.id} className={`space-y-2 rounded-xl bg-canvas-card p-space-md shadow-sm ${i.handled ? "opacity-60" : ""}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-headline-sm text-navy-ink">{i.store}</h3>
              <p className="text-body-sm text-secondary">
                {i.manager} · {i.phone} · {i.location}
              </p>
            </div>
            <span className={`shrink-0 rounded-lg px-2 py-1 text-label-caps ${i.handled ? "bg-surface-container text-secondary" : "bg-cobalt-electric/10 text-cobalt-electric"}`}>{i.handled ? "처리 완료" : "새 문의"}</span>
          </div>
          <p className="text-body-sm text-navy-ink">
            {i.status} · 월 {VOLUMES.find((v) => v.id === i.volume)?.label ?? i.volume}
            {i.profiles.length > 0 && ` · ${i.profiles.join(", ")}`}
          </p>
          {i.message && <p className="rounded-lg bg-warm-canvas p-space-sm text-body-sm text-navy-ink">{i.message}</p>}
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-secondary">{when(i.createdAt)}</span>
            <button type="button" onClick={() => updateDoc(doc(db(), "lwInquiries", i.id), { handled: !i.handled })} className="min-h-11 rounded-lg bg-surface-container-high px-4 text-body-sm font-semibold text-navy-ink">
              {i.handled ? "새 문의로 되돌리기" : "처리 완료로 표시"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
