"use client";

import { useRef, useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, X } from "lucide-react";
import { isPhone, nextThursdays } from "@/lib/forms";
import { field } from "../ui";

const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${m}월 ${d}일 (목)${y !== new Date().getFullYear() ? ` ${y}` : ""}`;
};

/** 목요 퍼블릭 커핑 예약. 다가오는 목요일 4번 중 하나를 고른다(데모라 저장·전송하지 않는다). */
export default function CuppingBooking() {
  const ref = useRef<HTMLDialogElement>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ date: string; people: string } | null>(null);

  const open = () => {
    setDates(nextThursdays(new Date(), 4));
    setErrors({});
    setDone(null);
    ref.current?.showModal();
  };

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const found: Record<string, string> = {};
    if (!dates.includes(v("date"))) found.date = "날짜를 골라 주세요.";
    if (!v("name") || v("name").length > 30) found.name = "이름을 입력해 주세요.";
    if (!isPhone(v("phone"))) found.phone = "연락처를 010-0000-0000 형식으로 입력해 주세요.";
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    setDone({ date: v("date"), people: v("people") });
  }

  const err = (k: string) =>
    errors[k] && (
      <p id={`cup-${k}-error`} className="mt-1 text-body-sm text-error">
        {errors[k]}
      </p>
    );

  return (
    <>
      <button type="button" onClick={open} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cobalt-electric px-5 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary">
        목요 퍼블릭 커핑 예약 <CalendarDays className="size-[18px]" aria-hidden="true" />
      </button>
      <dialog ref={ref} aria-labelledby="cupping-title" onClick={(e) => e.target === ref.current && ref.current.close()} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-canvas-card p-0 text-on-surface shadow-xl">
        <div className="p-space-lg">
          <div className="mb-space-md flex items-start justify-between">
            <div>
              <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Public Cupping · 15:00</span>
              <h2 id="cupping-title" className="text-headline-md text-navy-ink">
                목요 퍼블릭 커핑 예약
              </h2>
            </div>
            <button type="button" onClick={() => ref.current?.close()} aria-label="닫기" className="-mr-2 flex size-11 items-center justify-center rounded-lg text-secondary hover:bg-surface-container">
              <X className="size-5" />
            </button>
          </div>
          {done ? (
            <div role="status" className="space-y-3 text-center">
              <CheckCircle2 className="mx-auto size-10 text-cobalt-electric" aria-hidden="true" />
              <p className="text-headline-sm text-navy-ink">
                {fmt(done.date)} 15:00 · {done.people}명
              </p>
              <p className="text-body-md text-secondary">예약 내용을 확인했습니다. 데모 사이트라 실제 예약은 접수되지 않습니다.</p>
              <button type="button" onClick={() => ref.current?.close()} className="min-h-11 w-full rounded-lg bg-navy-ink text-body-md font-semibold text-on-primary">
                닫기
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="space-y-space-md">
              <fieldset aria-describedby={errors.date ? "cup-date-error" : undefined}>
                <legend className="mb-2 text-label-caps uppercase text-navy-ink">날짜</legend>
                <div className="grid grid-cols-2 gap-2">
                  {dates.map((d) => (
                    <label key={d} className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-warm-canvas text-body-md text-navy-ink has-[:checked]:bg-navy-ink has-[:checked]:text-on-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalt-electric">
                      <input type="radio" name="date" value={d} className="sr-only" onChange={() => setErrors((x) => ({ ...x, date: "" }))} />
                      {fmt(d)}
                    </label>
                  ))}
                </div>
                {err("date")}
              </fieldset>
              <div className="grid grid-cols-[1fr_6rem] gap-2">
                <div>
                  <label htmlFor="cup-name" className="mb-1 block text-label-caps uppercase text-navy-ink">
                    이름
                  </label>
                  <input id="cup-name" name="name" maxLength={30} autoComplete="name" aria-invalid={!!errors.name || undefined} aria-describedby={errors.name ? "cup-name-error" : undefined} className={`${field} h-11`} />
                  {err("name")}
                </div>
                <div>
                  <label htmlFor="cup-people" className="mb-1 block text-label-caps uppercase text-navy-ink">
                    인원
                  </label>
                  <select id="cup-people" name="people" className={`${field} h-11`}>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}명
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="cup-phone" className="mb-1 block text-label-caps uppercase text-navy-ink">
                  연락처
                </label>
                <input id="cup-phone" name="phone" type="tel" maxLength={20} autoComplete="tel" placeholder="010-0000-0000" aria-invalid={!!errors.phone || undefined} aria-describedby={errors.phone ? "cup-phone-error" : undefined} className={`${field} h-11`} />
                {err("phone")}
              </div>
              <button type="submit" className="min-h-12 w-full rounded-lg bg-cobalt-electric text-body-lg font-semibold text-on-primary hover:bg-primary">
                예약하기
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
