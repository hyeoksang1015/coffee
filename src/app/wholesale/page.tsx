import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { CheckCircle2, ChevronDown, Phone, SlidersHorizontal, Store, Truck } from "lucide-react";
import WholesaleForm, { WholesaleFormFromParams } from "@/components/wholesale/WholesaleForm";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "B2B Wholesale",
  description: "카페 원두 납품 상담과 무료 웰컴 샘플러 키트 신청. 로스팅 후 48시간 내 직배송, 매장 머신 맞춤 추출 세팅을 지원합니다.",
};

const stats = [
  { v: "48h", Icon: Truck, title: "로스팅 후 직배송 원칙", text: "디개싱 골든타임에 맞춘 주 2회 맞춤 로스팅 및 직배송 시스템" },
  { v: "1:1", Icon: SlidersHorizontal, title: "추출 레시피 튜닝 지원", text: "매장 머신 수압, 버(Burr), TDS 수질에 맞춤형 온사이트 영점 캘리브레이션" },
  { v: "240+", Icon: Store, title: "전국 제휴 파트너사", text: "성수, 한남, 서촌, 해운대 등 하이엔드 카페와 플래그십 호텔 연계 납품" },
];

const steps = [
  { no: "01", title: "무료 샘플 테이스팅", tag: "D+2 소요", text: "접수 후 48시간 이내 샘플러 수령. 동봉된 커핑 시트와 가이드를 기반으로 매장 머신에서 직접 테이스팅 진행." },
  { no: "02", title: "추출 프로파일 세팅", tag: "온사이트 지원", text: "전담 로스터가 매장 방문 또는 화상으로 머신 압력, 그라인더 메쉬, 투입량-추출 비율(Brew Ratio) 영점 튜닝 지원." },
  { no: "03", title: "정기 발주 & 신선 납품", tag: "주간 정기 배송", text: "B2B 전용 주문 포털을 통한 원클릭 발주. 로스팅 당일 출고 원칙 및 월 사용량 구간별 최대 28% 도매 할인 자동 적용." },
];

const partners = [
  { cafe: "아틀리에 한남", vol: "월 45kg 납품 중", text: "로스팅 일관성이 압도적입니다. 계절이나 날씨에 따라 변하던 추출 분쇄도 편차가 로우웨이브 프로파일 도입 후 현저히 줄었습니다. 손님들의 라떼 칭찬이 확연히 늘었습니다.", name: "김태현 대표 바리스타", where: "서울 용산구 한남동 • 스페셜티 쇼룸", photo: "/images/partner-1.webp" },
  { cafe: "플로우 커피랩", vol: "월 70kg 납품 중", text: "오픈 초기 머신 영점 세팅 때 직접 방문해 수질과 버 캘리브레이션을 끝내주신 점이 감동이었습니다. 바리스타 교체 시에도 온보딩 가이드북 덕에 맛의 편차가 없습니다.", name: "박지우 총괄 디렉터", where: "서울 마포구 서교동 • 베이커리 & 브루잉 바", photo: "/images/partner-2.webp" },
  { cafe: "모노리스 성수", vol: "월 120kg 납품 중", text: "주간 발주 주기가 유연하고 로스팅 후 48시간 내 도착하는 시스템이 완벽합니다. 디카페인과 시그니처 싱글오리진 라인업의 고객 반응이 뛰어나 재방문율이 35% 올랐습니다.", name: "이서준 오너", where: "서울 성동구 성수동 • 로스터리 카페", photo: "/images/partner-3.webp" },
];

const faqs = [
  { q: "최소 발주 수량(MOQ)과 첫 주문 기준은 어떻게 되나요?", a: "기본 최소 발주 수량(MOQ)은 회당 5kg(1kg 단위 교차 선택 가능)입니다. 주 1회 또는 격주 발주 등 매장의 원두 보관 사정에 따라 유연하게 설정하실 수 있으며, 신규 파트너사는 초기 3개월 동안 3kg부터 무상 배송을 지원합니다." },
  { q: "로스팅 요일과 정기 배송 일정은 어떻게 운영되나요?", a: "매주 월요일과 목요일에 메인 로스팅을 진행합니다. 전일 오후 2시까지 접수된 주문은 당일 로스팅 후 다음 날 오전에 출고되어, 영업일 기준 48시간 이내에 디개싱 적정 상태의 원두를 받아보실 수 있습니다." },
  { q: "머신 세팅 및 현장 바리스타 교육 지원 범위가 궁금합니다.", a: "수도권 매장은 정기 납품 계약 시 전담 QC 팀이 방문해 머신 수압 점검, 그라인더 영점 조절, 수질 TDS 측정과 맞춤 추출 프로파일을 1:1로 세팅해 드립니다. 비수도권은 원격 가이드 영상과 추출 데이터 시트를 제공하며 요청 시 출장 지원이 가능합니다." },
  { q: "기존 메뉴와 어울리는 커스텀 블렌드 개발도 가능한가요?", a: "월 60kg 이상 정기 납품 매장에는 전용 프라이빗 블렌드(Private Label) 개발을 무상으로 지원합니다. 센서리 랩에서 3회 이상의 커핑 세션으로 시그니처 컵 노트를 조율합니다." },
];

export default function WholesalePage() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-navy-ink py-space-xl text-on-primary">
        <svg className="pointer-events-none absolute inset-0 size-full opacity-10" aria-hidden="true">
          <defs>
            <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
        <div className="wrap relative">
          <div className="mb-space-md flex flex-wrap items-center gap-space-sm">
            <span className="inline-flex items-center rounded-lg bg-surface-container-lowest/10 px-space-sm py-1 text-label-caps uppercase tracking-wider text-primary-fixed backdrop-blur">
              <span className="mr-2 size-1.5 rounded-full bg-cobalt-electric" /> Specialty Roastery Partnership
            </span>
            <span className="text-spec-num text-on-secondary-container">VER. 2026 B2B SPEC</span>
          </div>
          <div className="max-w-4xl">
            <h1 className="mb-space-md text-display-mobile leading-[1.12] tracking-tight sm:text-display">
              매장의 커피 퀄리티와 시그니처,
              <br />
              {site.name} 파트너십으로 완성됩니다.
            </h1>
            <p className="max-w-3xl text-body-lg leading-relaxed text-surface-container">전국 240여 개 매장과 함께하는 맞춤형 로스팅 파트너. 상권 특성과 추출 환경에 최적화된 안정적인 프로파일 솔루션을 제공합니다.</p>
          </div>
          <div className="mt-space-xl grid grid-cols-1 gap-space-md md:grid-cols-3">
            {stats.map(({ v, Icon, title, text }) => (
              <div key={title} className="rounded-xl bg-surface-container-lowest/5 p-space-lg backdrop-blur-sm transition-colors hover:bg-surface-container-lowest/10">
                <div className="mb-space-xs flex items-baseline justify-between">
                  <span className="text-display-mobile leading-none font-semibold text-primary-fixed-dim sm:text-display">{v}</span>
                  <Icon className="size-6 text-primary-fixed-dim" aria-hidden="true" />
                </div>
                <span className="mb-1 block text-headline-sm">{title}</span>
                <p className="text-body-sm text-surface-variant">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-warm-canvas py-space-xl">
        <div className="wrap grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
          <div className="flex flex-col gap-space-lg lg:col-span-5">
            <div className="rounded-xl bg-canvas-card p-space-lg shadow-sm">
              <div className="mb-space-sm flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-tertiary-container/15 px-2.5 py-1 text-label-caps uppercase text-tertiary">Welcome Offer</span>
                <span className="text-spec-num text-cobalt-electric">정상가 32,000원 상당 무료</span>
              </div>
              <h2 className="mb-space-xs text-headline-md text-navy-ink">B2B 웰컴 3종 샘플러 키트</h2>
              <p className="mb-space-md text-body-md text-on-surface-variant">매장의 추출 세팅과 음료 메뉴 구성에 최적화된 시그니처 블렌드 2종과 이달의 싱글오리진 1종(각 200g, 총 600g)을 배송비 없이 무료로 전달해 드립니다.</p>
              <div className="relative mb-space-md h-56 w-full overflow-hidden rounded-lg bg-surface-container">
                <Image src="/images/b2b-sampler.webp" alt="파란 라벨의 흰 원두 패키지 세 개로 구성된 샘플러 키트" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                <span className="absolute bottom-2 left-2 rounded bg-navy-ink/80 px-space-xs py-0.5 text-body-sm text-on-primary">600g Tasting Pack Included</span>
              </div>
              <ul className="space-y-space-xs text-body-sm text-navy-ink">
                {["로우웨이브 #1 시그니처 에스프레소 블렌드 (200g)", "로우웨이브 #2 라이트 로스트 플로럴 블렌드 (200g)", "이달의 싱글오리진 큐레이션 원두 (200g)"].map((t) => (
                  <li key={t} className="flex items-center gap-space-xs">
                    <CheckCircle2 className="size-[18px] shrink-0 text-cobalt-electric" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-canvas-card p-space-lg shadow-sm">
              <h3 className="mb-space-md text-label-caps uppercase tracking-wider text-on-surface-variant">Onboarding Timeline</h3>
              <ol className="space-y-space-md">
                {steps.map((s, i) => (
                  <li key={s.no} className="flex items-start gap-space-md">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded text-spec-num text-on-primary ${i === 2 ? "bg-cobalt-electric" : "bg-navy-ink"}`}>{s.no}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="text-headline-sm text-navy-ink">{s.title}</span>
                        <span className="rounded bg-secondary-container px-1.5 py-0.5 text-body-sm text-cobalt-electric">{s.tag}</span>
                      </div>
                      <p className="mt-0.5 text-body-sm text-on-surface-variant">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas-subtle p-space-md">
              <div className="flex items-center gap-space-sm">
                <Phone className="size-6 text-navy-ink" aria-hidden="true" />
                <div>
                  <span className="block text-label-caps uppercase text-on-surface-variant">B2B 직통 유선 상담</span>
                  <span className="text-headline-sm text-navy-ink tabular-nums">{site.b2bPhone}</span>
                </div>
              </div>
              <a href="#inquiry" className="inline-flex min-h-11 items-center rounded bg-navy-ink px-space-md text-label-caps uppercase text-on-primary transition-colors hover:bg-cobalt-electric">
                온라인 신청
              </a>
            </div>
          </div>

          <div id="inquiry" className="lg:col-span-7">
            <div className="rounded-xl bg-canvas-card p-space-lg shadow-md sm:p-space-xl">
              <div className="mb-space-lg">
                <div className="mb-1 flex items-center gap-space-xs">
                  <span className="size-2 rounded-full bg-cobalt-electric" />
                  <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Partnership Inquiry</span>
                </div>
                <h2 className="text-headline-lg-mobile tracking-tight text-navy-ink md:text-headline-lg">납품 상담 및 무료 샘플 신청</h2>
                <p className="mt-1 text-body-md text-on-surface-variant">간단한 매장 정보만 남겨주시면 단가표와 함께 맞춤형 웰컴 샘플러를 발송해 드립니다.</p>
              </div>
              <Suspense fallback={<WholesaleForm />}>
                <WholesaleFormFromParams />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="wrap">
          <div className="mb-space-xl flex flex-col justify-between md:flex-row md:items-end">
            <div>
              <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Case Studies &amp; Profiles</span>
              <h2 className="mt-1 text-headline-lg-mobile text-navy-ink md:text-headline-lg">로우웨이브와 함께하는 파트너 카페 이야기</h2>
            </div>
            <p className="mt-2 max-w-md text-body-md text-on-surface-variant md:mt-0">단순 원두 납품을 넘어 매장의 브랜딩과 고객 만족도를 함께 설계한 파트너 매장의 경험입니다.</p>
          </div>
          <div className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
            {partners.map((p) => (
              <figure key={p.cafe} className="flex flex-col justify-between overflow-hidden rounded-xl bg-canvas-card shadow-sm transition-shadow hover:shadow-md">
                <div className="p-space-lg">
                  <div className="mb-space-md flex items-center justify-between gap-2">
                    <span className="text-label-caps uppercase tracking-wider text-navy-ink">{p.cafe}</span>
                    <span className="rounded bg-surface-container px-2 py-0.5 text-body-sm font-medium text-cobalt-electric">{p.vol}</span>
                  </div>
                  <blockquote className="text-body-md leading-relaxed text-navy-ink">“{p.text}”</blockquote>
                </div>
                <figcaption className="flex items-center gap-space-sm bg-warm-canvas/60 p-space-lg">
                  <Image src={p.photo} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" />
                  <div>
                    <span className="block text-sm font-semibold text-navy-ink">{p.name}</span>
                    <span className="block text-body-sm text-on-surface-variant">{p.where}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-canvas-card py-space-xl">
        <div className="wrap">
          <div className="mx-auto max-w-4xl">
          <div className="mb-space-xl text-center">
            <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Wholesale FAQ</span>
            <h2 className="mt-1 text-headline-lg-mobile text-navy-ink md:text-headline-lg">자주 묻는 질문</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">납품 절차 및 원두 운영에 대한 핵심 가이드를 확인하세요.</p>
          </div>
          <div className="space-y-space-sm">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-lg bg-warm-canvas transition-colors open:bg-surface-container">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 p-space-md text-headline-sm text-navy-ink [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <ChevronDown className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-space-md pb-space-md text-body-md leading-relaxed text-on-surface-variant">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-space-xl flex flex-col items-center justify-between gap-space-md rounded-xl bg-navy-ink p-space-lg text-on-primary md:flex-row">
            <div>
              <span className="block text-headline-sm">추가로 궁금한 점이 있으신가요?</span>
              <span className="text-body-sm text-surface-variant">원두 큐레이터가 매장 상황에 맞는 현실적인 상담을 진행해 드립니다.</span>
            </div>
            <a href="#inquiry" className="inline-flex min-h-11 shrink-0 items-center rounded bg-cobalt-electric px-space-lg text-label-caps uppercase transition-colors hover:bg-primary">
              무료 샘플 신청하기 ↑
            </a>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
