"use client";

import { useState, type FormEvent } from "react";
import { EMAIL } from "@/lib/forms";

export default function Newsletter() {
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setState(EMAIL.test(email) ? "done" : "error");
  }

  return (
    <div className="flex flex-col gap-space-xs">
      <span className="text-label-caps uppercase tracking-wider text-on-surface-variant">Lab Newsletter</span>
      <p className="text-body-sm text-on-surface-variant">새로운 마이크로랏 입고 및 커핑 일정을 구독하세요.</p>
      {state === "done" ? (
        <p role="status" className="mt-space-xs rounded-lg bg-canvas-card p-3 text-body-sm text-navy-ink">
          구독 신청을 확인했습니다. (데모 사이트라 실제 메일은 발송되지 않습니다.)
        </p>
      ) : (
        <form noValidate onSubmit={submit} className="mt-space-xs flex items-center gap-space-xs">
          <label htmlFor="newsletter-email" className="sr-only">
            이메일 주소
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="이메일 주소 입력"
            aria-invalid={state === "error" || undefined}
            aria-describedby={state === "error" ? "newsletter-error" : undefined}
            onChange={() => state === "error" && setState("idle")}
            className="h-11 w-full rounded-lg border border-line-neutral bg-surface px-space-sm text-base text-on-surface outline-none focus:border-cobalt-electric sm:text-body-sm"
          />
          <button type="submit" className="h-11 whitespace-nowrap rounded-lg bg-navy-ink px-space-md text-label-caps uppercase text-on-primary transition-colors hover:bg-primary-container">
            구독
          </button>
        </form>
      )}
      {state === "error" && (
        <p id="newsletter-error" className="text-body-sm text-error">
          이메일 주소 형식을 확인해 주세요.
        </p>
      )}
    </div>
  );
}
