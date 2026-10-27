"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, Clock } from "lucide-react";
import { PROFILES, STATUSES, validateWholesale, VOLUMES, type Errors, type Wholesale } from "@/lib/forms";
import { field } from "../ui";

/** 홈 샘플러 빠른 신청에서 넘어온 ?store=&phone= 을 미리 채운다. */
export function WholesaleFormFromParams() {
  const q = useSearchParams();
  const store = (q.get("store") ?? "").slice(0, 50);
  const phone = (q.get("phone") ?? "").slice(0, 20);
  return <WholesaleForm key={store + phone} store={store} phone={phone} />;
}

export default function WholesaleForm({ store = "", phone = "" }: { store?: string; phone?: string }) {
  const [errors, setErrors] = useState<Errors<Wholesale>>({});
  const [sent, setSent] = useState<Wholesale | null>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "");
    const w: Wholesale = { store: v("store"), manager: v("manager"), phone: v("phone"), location: v("location"), status: v("status"), volume: v("volume"), profiles: f.getAll("profiles").map(String), message: v("message") };
    const found = validateWholesale(w);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    setSent(w);
  }

  const clear = (k: keyof Wholesale) => () => errors[k] && setErrors((x) => ({ ...x, [k]: undefined }));
  const a11y = (k: keyof Wholesale) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `w-${k}-error` : undefined });
  const err = (k: keyof Wholesale) =>
    errors[k] && (
      <p id={`w-${k}-error`} className="mt-1 text-body-sm text-error">
        {errors[k]}
      </p>
    );
  const label = (k: keyof Wholesale, text: string, required = true) => (
    <label htmlFor={`w-${k}`} className="mb-1 block text-label-caps uppercase text-navy-ink">
      {text} {required && <span className="text-error">*</span>}
    </label>
  );

  if (sent) {
    return (
      <div role="status" className="space-y-space-md rounded-xl bg-navy-ink p-space-lg text-on-primary">
        <CheckCircle2 className="size-10 text-primary-fixed-dim" aria-hidden="true" />
        <h3 className="text-headline-md">{sent.store} 신청 내용을 확인했습니다.</h3>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-body-md">
          <dt className="text-on-primary/60">담당자</dt>
          <dd>
            {sent.manager} · {sent.phone}
          </dd>
          <dt className="text-on-primary/60">월 사용량</dt>
          <dd>{VOLUMES.find((x) => x.id === sent.volume)!.label}</dd>
          <dt className="text-on-primary/60">선호 프로파일</dt>
          <dd>{sent.profiles.join(", ") || "선택 안 함"}</dd>
        </dl>
        <p className="text-body-sm text-on-primary/70">포트폴리오용 데모 사이트라 실제로 접수·발송되지는 않습니다.</p>
        <button type="button" onClick={() => setSent(null)} className="min-h-11 rounded-lg bg-white/10 px-4 text-body-md font-semibold hover:bg-white/15">
          다시 작성하기
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-space-md">
      <div>
        {label("store", "매장 상호명")}
        <input id="w-store" name="store" defaultValue={store} maxLength={50} autoComplete="organization" placeholder="예: 카페 모먼트 성수점" onChange={clear("store")} className={`${field} h-11`} {...a11y("store")} />
        {err("store")}
      </div>
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <div>
          {label("manager", "담당자 성함")}
          <input id="w-manager" name="manager" maxLength={50} autoComplete="name" placeholder="홍길동 대표 / 매니저" onChange={clear("manager")} className={`${field} h-11`} {...a11y("manager")} />
          {err("manager")}
        </div>
        <div>
          {label("phone", "연락처")}
          <input id="w-phone" name="phone" type="tel" defaultValue={phone} maxLength={20} autoComplete="tel" placeholder="010-0000-0000" onChange={clear("phone")} className={`${field} h-11`} {...a11y("phone")} />
          {err("phone")}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <div>
          {label("location", "매장 위치 (시/구/동)")}
          <input id="w-location" name="location" maxLength={50} autoComplete="address-level2" placeholder="예: 서울시 성동구 성수동2가" onChange={clear("location")} className={`${field} h-11`} {...a11y("location")} />
          {err("location")}
        </div>
        <div>
          {label("status", "운영 현황")}
          <div className="relative">
            <select id="w-status" name="status" className={`${field} h-11 appearance-none`} {...a11y("status")}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-3 size-5 text-secondary" aria-hidden="true" />
          </div>
          {err("status")}
        </div>
      </div>
      <fieldset {...a11y("volume")}>
        <legend className="mb-2 text-label-caps uppercase text-navy-ink">
          예상 월 원두 사용량 <span className="text-error">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-space-xs md:grid-cols-4">
          {VOLUMES.map((v) => (
            <label key={v.id} className="flex min-h-14 cursor-pointer flex-col items-center justify-center rounded bg-warm-canvas p-space-sm text-center transition-colors hover:bg-surface-container has-[:checked]:bg-navy-ink has-[:checked]:text-on-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalt-electric">
              <input type="radio" name="volume" value={v.id} defaultChecked={v.id === "10_30kg"} onChange={clear("volume")} className="sr-only" />
              <span className="text-spec-num">{v.label}</span>
              <span className="text-[10px] opacity-70">{v.note}</span>
            </label>
          ))}
        </div>
        {err("volume")}
      </fieldset>
      <fieldset {...a11y("profiles")}>
        <legend className="mb-2 text-label-caps uppercase text-navy-ink">선호 향미 프로파일 (중복 선택 가능)</legend>
        <div className="grid grid-cols-1 gap-space-xs md:grid-cols-3">
          {PROFILES.map((p) => (
            <label key={p} className="flex min-h-11 cursor-pointer items-center gap-space-xs rounded bg-warm-canvas p-space-sm transition-colors hover:bg-surface-container">
              <input type="checkbox" name="profiles" value={p} className="size-4 accent-cobalt-electric" />
              <span className="text-body-sm text-navy-ink">{p}</span>
            </label>
          ))}
        </div>
        {err("profiles")}
      </fieldset>
      <div>
        {label("message", "사용 중인 에스프레소 머신 / 그라인더 & 추가 문의", false)}
        <textarea id="w-message" name="message" rows={3} maxLength={1000} placeholder="예: 라마르조코 리네아 PB 2그룹 + 말코닉 E65S 사용 중입니다. 라떼 베이스에서 묵직한 바디감을 원합니다." onChange={clear("message")} className={`${field} resize-none py-3`} {...a11y("message")} />
        {err("message")}
      </div>
      <button type="submit" className="flex min-h-13 w-full items-center justify-center gap-space-sm rounded-lg bg-cobalt-electric py-space-md text-headline-sm text-on-primary shadow-sm transition-colors hover:bg-primary">
        무료 샘플 &amp; 납품 단가표 신청하기 <ArrowRight className="size-5" aria-hidden="true" />
      </button>
      <p className="flex items-center justify-center gap-1.5 pt-space-xs text-center text-body-sm text-on-surface-variant">
        <Clock className="size-4 shrink-0 text-cobalt-electric" aria-hidden="true" />
        <span>
          신청 완료 시 <strong>4시간 이내</strong> 담당 수석 큐레이터가 확인 및 상담 전화를 드립니다.
        </span>
      </p>
    </form>
  );
}
