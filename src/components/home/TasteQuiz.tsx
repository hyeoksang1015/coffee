"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Coffee, HelpCircle, RotateCcw } from "lucide-react";
import { won } from "@/data/site";
import { QUIZ, recommend, type Answers } from "@/lib/quiz";
import { useCart } from "../CartProvider";

/** 홈 '나만의 커피 리듬 찾기': 세 문항에 답하면 카드 안에서 원두를 추천한다. */
export default function TasteQuiz() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const { add } = useCart();
  const done = step >= QUIZ.length;
  const pick = done ? recommend(answers as Answers) : null;

  const answer = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setStep((s) => s + 1);
  };

  return (
    <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-space-lg shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="mb-space-md flex size-12 items-center justify-center rounded-xl bg-cobalt-electric/10 text-cobalt-electric">
          <Coffee className="size-6" aria-hidden="true" />
        </div>
        <span className="text-label-caps uppercase text-secondary">For Coffee Lovers</span>
        <h3 className="mt-1 mb-2 text-headline-md text-navy-ink">나만의 커피 리듬 찾기</h3>
        <p className="text-body-md leading-relaxed text-secondary">평소 즐겨 마시는 추출 도구와 선호하는 산미·바디 밸런스를 고르면 어울리는 원두를 1분 만에 추천해 드립니다.</p>
      </div>
      <div className="mt-space-lg pt-space-md" aria-live="polite">
        {step === -1 && (
          <>
            <div className="mb-space-sm flex items-center justify-between rounded-lg bg-canvas-card p-space-sm shadow-sm">
              <span className="text-body-sm font-medium text-navy-ink">추출 도구 · 산미 · 우유 여부</span>
              <span className="text-spec-num text-cobalt-electric">3 Questions</span>
            </div>
            <button type="button" onClick={() => setStep(0)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-navy-ink text-headline-sm text-on-primary transition-colors hover:bg-cobalt-electric">
              1분 테이스팅 프로파일 퀴즈 시작 <HelpCircle className="size-[18px]" aria-hidden="true" />
            </button>
          </>
        )}
        {step >= 0 && !done && (
          <fieldset key={step} className="rounded-lg bg-canvas-card p-space-md shadow-sm">
            <legend className="sr-only">{QUIZ[step].q}</legend>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-headline-sm text-navy-ink" aria-hidden="true">
                {QUIZ[step].q}
              </span>
              <span className="text-spec-num text-cobalt-electric tabular-nums">
                {step + 1} / {QUIZ.length}
              </span>
            </div>
            <div className="grid gap-2">
              {QUIZ[step].options.map((o) => (
                <button key={o.id} type="button" onClick={() => answer(QUIZ[step].id, o.id)} className="min-h-11 rounded-lg border border-line-neutral px-4 text-left text-body-md text-navy-ink transition-colors hover:border-cobalt-electric hover:bg-warm-canvas">
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {pick && (
          <div className="rounded-lg bg-canvas-card p-space-md shadow-sm" data-testid="quiz-result">
            <span className="text-label-caps uppercase text-cobalt-electric">Your Rhythm</span>
            <div className="mt-2 flex gap-3">
              <Image src={pick.image} alt="" width={80} height={80} className="size-20 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="text-headline-sm text-navy-ink">{pick.name}</p>
                <p className="text-body-sm text-secondary">{pick.notes.map((n) => `#${n}`).join(" ")}</p>
                <p className="mt-1 text-spec-num text-navy-ink tabular-nums">
                  {won(pick.sizes[0].price)} / {pick.sizes[0].label}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href={`/beans/${pick.slug}/`} className="flex min-h-11 items-center justify-center gap-1 rounded-lg bg-navy-ink text-body-sm font-semibold text-on-primary hover:bg-cobalt-electric">
                자세히 보기 <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <button type="button" onClick={() => add({ slug: pick.slug, grams: pick.sizes[0].grams, grind: answers.tool === "drip" ? "filter" : answers.tool === "espresso" ? "espresso" : "whole", plan: "once", qty: 1 }, { name: pick.name })} className="min-h-11 rounded-lg bg-surface-container text-body-sm font-semibold text-navy-ink hover:bg-surface-variant">
                장바구니 담기
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setStep(0);
              }}
              className="mt-2 inline-flex min-h-11 items-center gap-1 text-body-sm text-secondary hover:text-navy-ink"
            >
              <RotateCcw className="size-4" aria-hidden="true" /> 다시 하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
