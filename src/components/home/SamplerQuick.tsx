"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Send, Store } from "lucide-react";
import { isPhone } from "@/lib/forms";

/** 홈의 샘플러 빠른 신청. 상호명·연락처를 받아 B2B 신청서로 넘기고, 나머지는 거기서 채운다. */
export default function SamplerQuick() {
  const router = useRouter();
  const [error, setError] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const store = String(f.get("store") ?? "").trim();
    const phone = String(f.get("phone") ?? "").trim();
    if (!store) return setError("매장 상호명을 입력해 주세요.");
    if (!isPhone(phone)) return setError("연락처를 010-0000-0000 형식으로 입력해 주세요.");
    router.push(`/wholesale/?${new URLSearchParams({ store, phone })}#inquiry`);
  }

  return (
    <div className="flex flex-col justify-between rounded-xl bg-canvas-card p-space-lg shadow-md transition-shadow hover:shadow-xl">
      <div>
        <div className="mb-space-md flex size-12 items-center justify-center rounded-xl bg-primary text-on-primary">
          <Store className="size-6" aria-hidden="true" />
        </div>
        <span className="text-label-caps uppercase text-cobalt-electric">Wholesale • B2B Partnership</span>
        <h3 className="mt-1 mb-2 text-headline-md text-navy-ink">파트너 카페 웰컴 샘플러 키트</h3>
        <p className="text-body-md leading-relaxed text-secondary">매장 오픈을 앞두고 있거나 원두 교체를 고민 중이신 대표님께 리듬 커피의 대표 블렌드와 추출 프로파일 카드를 무상으로 보내 드립니다.</p>
      </div>
      <form noValidate onSubmit={submit} className="mt-space-lg flex flex-col gap-space-xs pt-space-md">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="quick-store">
            매장 상호명
          </label>
          <input id="quick-store" name="store" maxLength={50} autoComplete="organization" placeholder="매장 상호명 (예: 카페 리듬)" onChange={() => setError("")} className="h-11 min-w-0 flex-1 rounded-lg bg-surface-container-low px-space-sm text-base text-navy-ink outline-none focus:bg-surface focus:ring-1 focus:ring-cobalt-electric sm:text-body-sm" />
          <label className="sr-only" htmlFor="quick-phone">
            연락처
          </label>
          <input id="quick-phone" name="phone" type="tel" maxLength={20} autoComplete="tel" placeholder="연락처 (010-0000-0000)" onChange={() => setError("")} className="h-11 rounded-lg bg-surface-container-low px-space-sm text-base text-navy-ink outline-none focus:bg-surface focus:ring-1 focus:ring-cobalt-electric sm:w-44 sm:text-body-sm" />
        </div>
        {error && (
          <p role="alert" className="text-body-sm text-error">
            {error}
          </p>
        )}
        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-cobalt-electric text-headline-sm text-on-primary transition-colors hover:bg-primary">
          사업자 무료 샘플러 키트 신청 <Send className="size-[18px]" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
