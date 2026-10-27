import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, FileText, SlidersHorizontal, Truck } from "lucide-react";
import Shop, { ShopFromParams } from "@/components/shop/Shop";
import { beans } from "@/data/beans";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Atelier Beans Collection",
  description: "산지의 떼루아와 추출 목적에 맞춘 싱글 오리진·시그니처 블렌드·디카페인 원두. 배전도와 산미·바디로 골라 보세요.",
};

export default function BeansPage() {
  return (
    <>
      <section className="w-full bg-navy-ink text-on-primary">
        <div className="wrap flex items-center justify-between gap-space-md py-2.5">
          <div className="flex min-w-0 items-center gap-space-sm">
            <span className="shrink-0 rounded-sm bg-cobalt-electric px-2 py-0.5 text-label-caps uppercase tracking-wider">Fresh Batch</span>
            <span className="truncate text-spec-num tracking-wide text-on-primary/90">ROAST SCHEDULE • 매주 화 • 목 정기 로스팅 — 24시간 내 질소 충진 당일 출고</span>
          </div>
          <div className="hidden shrink-0 items-center gap-space-md text-on-primary/80 md:flex">
            <span className="flex items-center gap-1 text-body-sm">
              <span className="size-2 animate-pulse rounded-full bg-emerald-400" /> 오늘 낮 14:00 이전 주문 시 당일 발송 가능
            </span>
            <span className="text-on-primary/40">|</span>
            <span className="text-spec-num text-on-primary/90">무료배송 {site.freeShipping.toLocaleString("ko-KR")}원 이상</span>
          </div>
        </div>
      </section>

      <header className="wrap pt-space-xl pb-space-lg">
        <div className="flex flex-col justify-between gap-space-lg pb-space-md lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-space-xs">
            <div className="flex flex-wrap items-center gap-space-sm text-label-caps uppercase tracking-widest text-cobalt-electric">
              <span>Specialty Curation</span>
              <span>/</span>
              <span>Direct Trade &amp; Auction Lots</span>
            </div>
            <h1 className="text-headline-lg-mobile tracking-tight text-navy-ink md:text-headline-lg">Atelier Beans Collection</h1>
            <p className="text-body-lg text-secondary">매일 아침의 리듬을 정교하게 깨우는 아티장 스페셜티 셀렉션. 산지의 떼루아와 추출 목적에 최적화된 마이크로 로스팅 프로파일을 제안합니다.</p>
          </div>
          <dl className="flex items-center gap-space-lg self-start lg:self-end">
            <div className="flex flex-col">
              <dt className="text-label-caps uppercase tracking-wider text-secondary">Current Harvest</dt>
              <dd className="text-spec-num text-navy-ink">
                총 <span className="text-cobalt-electric">{beans.length}</span>개 원두
              </dd>
            </div>
            <div className="h-8 w-px bg-surface-variant" />
            <div className="flex flex-col">
              <dt className="text-label-caps uppercase tracking-wider text-secondary">Degassing Lab</dt>
              <dd className="text-spec-num text-navy-ink">권장 안정화 5–7일</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* 정적 HTML 에는 전체 목록을 넣고, 브라우저에서 ?category= 를 읽어 다시 그린다. */}
      <Suspense fallback={<Shop />}>
        <ShopFromParams />
      </Suspense>

      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-xl bg-navy-ink p-8 text-on-primary shadow-xl lg:p-12">
            <div className="pointer-events-none absolute -right-20 -bottom-20 size-96 rounded-full bg-cobalt-electric/20 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-cobalt-electric px-2.5 py-1 text-label-caps uppercase tracking-wider">B2B Wholesale Partner</span>
                  <span className="text-body-sm text-on-primary/60">비즈니스 사업자 전용 프로그램</span>
                </div>
                <h2 className="text-headline-lg-mobile tracking-tight md:text-headline-lg">카페 대표님을 위한 웰컴 샘플러 키트 무료 지원</h2>
                <p className="max-w-2xl text-body-lg leading-relaxed text-on-primary/85">매장의 에스프레소 머신과 그라인더 사양에 최적화된 맞춤 분쇄 • 추출 가이드북과 함께 시그니처 블렌드 및 싱글 오리진을 무료로 발송해 드립니다.</p>
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-body-sm text-on-primary/75">
                  {[
                    { Icon: BadgeCheck, text: "사업자등록증 인증 즉시 무료 발송" },
                    { Icon: SlidersHorizontal, text: "머신 스펙 맞춤 TDS 다이얼인 컨설팅" },
                    { Icon: Truck, text: "주 2회 정기 직납 및 납품 단가 우대" },
                  ].map(({ Icon, text }) => (
                    <li key={text} className="flex items-center gap-1.5">
                      <Icon className="size-[18px] text-primary-fixed-dim" aria-hidden="true" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center gap-3 lg:col-span-4">
                <Link href="/wholesale/#inquiry" className="flex h-12 items-center justify-center gap-2 rounded-lg bg-cobalt-electric px-6 text-body-md font-semibold shadow-md transition-colors hover:bg-primary">
                  B2B 샘플 키트 신청하기 <ArrowRight className="size-[18px]" aria-hidden="true" />
                </Link>
                <Link href="/wholesale/#inquiry" className="flex h-12 items-center justify-center gap-2 rounded-lg bg-white/10 px-6 text-body-md font-medium transition-colors hover:bg-white/15">
                  <FileText className="size-[18px]" aria-hidden="true" /> 월별 도매 단가표 문의
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
