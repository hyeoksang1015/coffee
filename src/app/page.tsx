import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowRight, Flame, MapPin, Navigation, Star, Wind } from "lucide-react";
import BuyNow from "@/components/BuyNow";
import CuppingBooking from "@/components/home/CuppingBooking";
import Curation from "@/components/home/Curation";
import SamplerQuick from "@/components/home/SamplerQuick";
import TasteQuiz from "@/components/home/TasteQuiz";
import { btnPrimary, btnSoft } from "@/components/ui";
import { getBean, HERO_SLUG } from "@/data/beans";
import { won } from "@/data/site";

const metrics = [
  ["240+", "Partner Cafes", "text-navy-ink"],
  ["48h", "Fresh Roast Delivery", "text-cobalt-electric"],
  ["91.8", "Avg Cupping Score", "text-navy-ink"],
];

const pillars = [
  { no: "01", icon: Flame, title: "Slow Micro-Roasting", text: "1968년식 독일 프로밧(PROBAT) 12kg 주물 드럼을 기반으로 급격한 열 충격 없이 중심부까지 균일하게 캐러멜라이즈합니다.", spec: ["Roaster Spec", "Probat UG12 Cast Iron"] },
  { no: "02", icon: Activity, title: "Sensory Cadence Curve", text: "Q-그레이더 주관 매일 오전 9시 블라인드 커핑. 로스팅 데이터 로거(Cropster)와 센서리 평가표를 결합해 오차 0.3℃ 이내로 관리합니다.", spec: null },
  { no: "03", icon: Wind, title: "Nitrogen Fresh Sealed", text: "로스팅 직후 48시간의 디개싱 안정기를 거쳐 산소 잔존율 0.1% 미만의 질소 치환 패키징을 적용, 첫 컵부터 마지막 컵까지 동일한 아로마를 보존합니다.", spec: ["Residual O₂ Level", "< 0.1% Guaranteed"] },
];

const reviews = [
  { text: "성수동 매장에서 템포 블렌드를 1년 넘게 에스프레소 베이스로 사용하고 있습니다. 날씨 변화에도 분쇄도 보정이 거의 필요 없을 정도로 로스팅 편차가 적습니다.", name: "오베르 커피랩", who: "서울 성수동 • 헤드 바리스타", vol: "월 60kg" },
  { text: "필터 커피 라인업으로 게이샤와 워카 사카로를 받아서 서비스하는데, 손님들이 잔에서 피어나는 화사한 꽃향기를 바로 알아보십니다. 테이스팅 카드 디자인도 훌륭합니다.", name: "카페 모티브", who: "부산 해운대 • 대표", vol: "월 40kg" },
  { text: "정기 배송 질소 포장 패키징 덕분에 2주가 지난 시점에도 개봉했을 때 첫날의 산뜻함이 그대로 살아있습니다. 원두 손실률이 0에 가깝습니다.", name: "스테레오 사운드바", who: "대전 유성 • 매니저", vol: "월 35kg" },
];

export default function Home() {
  const hero = getBean(HERO_SLUG)!;
  return (
    <>
      {/* 첫 화면 */}
      <section className="wrap pt-space-lg pb-space-xl">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-7 lg:pr-space-lg">
            <div className="mb-space-md inline-flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 shadow-sm">
              <span className="size-2 animate-pulse rounded-full bg-cobalt-electric" />
              <span className="text-label-caps uppercase tracking-wider text-navy-ink">Atelier Vol. 08 • Cupping 90.5+</span>
            </div>
            <h1 className="mb-space-md text-display-mobile text-navy-ink sm:text-display">
              Find Your Wave
              <br />
              <span className="text-cobalt-electric">in Every Pour.</span>
            </h1>
            <p className="mb-space-lg max-w-xl text-body-lg text-secondary">
              로우웨이브는 생두의 태생적 질감과 당도를 극대화하는 건축적 로스팅을 지향합니다. 독일 프로밧 12kg 드럼에서 빚어내는 정밀한 열풍 밸런스로 일상의 매 순간 완벽한 컵 노트를 선사합니다.
            </p>
            <div className="mb-space-xl flex flex-wrap items-center gap-space-sm">
              <Link href="/beans/" className={`${btnPrimary} group min-h-12 shadow-md`}>
                원두 컬렉션 탐색 <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link href="/wholesale/" className={`${btnSoft} min-h-12`}>
                카페 원두 납품 상담
              </Link>
            </div>
            <dl className="grid w-full max-w-lg grid-cols-3 gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm">
              {metrics.map(([v, k, c]) => (
                <div key={k} className="flex flex-col-reverse">
                  <dt className="mt-0.5 text-label-caps uppercase text-secondary">{k}</dt>
                  <dd className={`text-headline-lg-mobile sm:text-display-mobile ${c}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mt-space-md lg:col-span-5 lg:mt-0">
            <article className="group relative flex flex-col overflow-hidden rounded-xl bg-canvas-card p-space-md shadow-xl">
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <span className="rounded-lg bg-navy-ink px-2.5 py-1 text-spec-num text-on-primary">LOT NO. {hero.detail.lot}</span>
                <span className="rounded-lg bg-surface-bright/90 px-2.5 py-1 text-spec-num text-cobalt-electric shadow-sm backdrop-blur-md">SCA {hero.detail.score}</span>
              </div>
              <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-canvas-subtle sm:h-[380px]">
                <Image src={hero.image} alt={hero.imageAlt} fill priority sizes="(min-width: 1024px) 500px, 100vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-ink/40 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col gap-space-xs pt-space-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label-caps uppercase text-secondary">{hero.detail.region}</span>
                  <span className="text-spec-num text-cobalt-electric">{hero.roastLabel}</span>
                </div>
                <h2 className="text-headline-md text-navy-ink">
                  <Link href={`/beans/${hero.slug}/`} className="hover:text-cobalt-electric">
                    {hero.name}
                  </Link>
                </h2>
                <p className="line-clamp-1 text-body-md text-secondary">{hero.detail.flavors.join(", ")}</p>
                <div className="mt-space-sm flex items-center justify-between pt-space-xs">
                  <div className="flex flex-col">
                    <span className="text-label-caps uppercase text-secondary">Retail {hero.sizes[0].label}</span>
                    <span className="text-headline-sm text-navy-ink tabular-nums">{won(hero.sizes[0].price)}</span>
                  </div>
                  <BuyNow bean={hero} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-navy-ink px-4 text-[13px] font-semibold text-on-primary transition-colors hover:bg-cobalt-electric" />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 로스팅 철학 */}
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="wrap">
          <div className="mb-space-xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
            <div>
              <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Craft &amp; Roasting Philosophy</span>
              <h2 className="mt-2 text-headline-lg-mobile text-navy-ink md:text-headline-lg">
                불꽃의 속도와 호흡,
                <br />한 잔의 균형을 짓는 시간.
              </h2>
            </div>
            <p className="max-w-md text-body-md text-secondary">단순한 가열이 아닌, 생두가 지닌 유기산과 당류가 가장 이상적인 접점에서 응축되도록 매일의 온습도를 기록하고 조율합니다.</p>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.no} className="flex flex-col justify-between rounded-xl bg-canvas-card p-space-lg shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <div className="mb-space-md flex items-center justify-between">
                    <span className="text-display-mobile font-bold text-surface-variant">{p.no}</span>
                    <span className="flex size-10 items-center justify-center rounded-full bg-surface-container text-cobalt-electric">
                      <p.icon className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mb-2 text-headline-sm text-navy-ink">{p.title}</h3>
                  <p className="text-body-md leading-relaxed text-secondary">{p.text}</p>
                </div>
                {p.spec ? (
                  <div className="mt-space-lg flex items-center justify-between rounded-lg bg-warm-canvas p-space-sm text-secondary">
                    <span className="text-label-caps uppercase">{p.spec[0]}</span>
                    <span className="text-spec-num text-navy-ink">{p.spec[1]}</span>
                  </div>
                ) : (
                  <div className="mt-space-lg flex flex-col gap-1 rounded-lg bg-warm-canvas p-space-sm">
                    <div className="flex items-center justify-between text-secondary">
                      <span className="text-label-caps uppercase">Roast Profile Log</span>
                      <span className="text-spec-num text-cobalt-electric">ROR Δ 8.4°C/min</span>
                    </div>
                    <svg className="h-9 w-full text-cobalt-electric" fill="none" viewBox="0 0 200 36" aria-hidden="true">
                      <path d="M0 32C30 31 50 25 80 18C110 11 130 6 160 5C180 4 195 2 200 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                      <path d="M0 32C30 31 50 25 80 18C110 11 130 6 160 5C180 4 195 2 200 2V36H0V32Z" fill="currentColor" fillOpacity="0.08" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Curation />

      {/* 패키지 */}
      <section className="wrap py-space-md">
        <div className="overflow-hidden rounded-xl bg-navy-ink p-space-lg text-on-primary shadow-lg lg:p-space-xl">
          <div className="grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12">
            <div className="flex flex-col gap-space-sm lg:col-span-7">
              <span className="text-label-caps uppercase tracking-wider text-on-primary-container">Sustainable Packaging &amp; Archival Records</span>
              <h2 className="text-headline-lg-mobile leading-tight md:text-headline-lg">
                원두가 숨쉬는 0.1%의 여백,
                <br />
                100% 재활용 가능한 알루미늄-프리 파우치.
              </h2>
              <p className="max-w-xl text-body-md leading-relaxed text-on-primary-container/80">로우웨이브는 플라스틱 코팅을 배제한 단일 재질 크라프트 복합막과 단방향 아로마 밸브를 적용합니다. 패키지마다 수확일, 로스팅 타임스탬프, 권장 브루잉 레시피가 각인된 아카이브 카드가 동봉됩니다.</p>
              <dl className="grid grid-cols-2 gap-space-sm pt-space-xs sm:grid-cols-3">
                {[
                  ["100% Recyclable", "Eco Mono-material"],
                  ["Aroma Valve", "0.1% O₂ Shield"],
                  ["Archive Card", "Custom Brew Recipe"],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <dt className="text-spec-num">{k}</dt>
                    <dd className="text-body-sm text-on-primary-container/70">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid grid-cols-2 gap-space-sm lg:col-span-5">
              {[
                ["/images/packaging-valve.webp", "밝은 조명 아래에서 아로마 밸브 파우치를 살펴보는 모습"],
                ["/images/packaging-cards.webp", "추출 비율과 시간이 적힌 레시피 카드 묶음"],
              ].map(([src, alt]) => (
                <div key={src} className="relative h-56 overflow-hidden rounded-lg bg-surface-container">
                  <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 맞춤형 가이드 */}
      <section className="wrap py-space-xl">
        <div className="mx-auto mb-space-lg max-w-xl text-center">
          <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Personalized Experience</span>
          <h2 className="mt-1 text-headline-lg-mobile text-navy-ink md:text-headline-lg">두 가지의 웨이브, 맞춤형 가이드</h2>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          <TasteQuiz />
          <SamplerQuick />
        </div>
      </section>

      {/* 후기 */}
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="wrap">
          <div className="mb-space-lg flex flex-col justify-between gap-space-sm md:flex-row md:items-end">
            <div>
              <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">Verified Feedback • 4.9 / 5.0</span>
              <h2 className="mt-1 text-headline-lg-mobile text-navy-ink md:text-headline-lg">바리스타와 카페 오너들의 목소리</h2>
            </div>
            <p className="max-w-sm text-body-md text-secondary">전국 240여 개 파트너 매장에서 증명된 안정적인 추출 수율과 균일한 디개싱 반응.</p>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="flex flex-col justify-between rounded-xl bg-canvas-card p-space-md shadow-sm">
                <div>
                  <div className="mb-space-xs flex items-center gap-1 text-accent-amber" role="img" aria-label="별점 5점">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="size-[18px] fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mb-space-md text-body-md leading-relaxed text-navy-ink">“{r.text}”</blockquote>
                </div>
                <figcaption className="flex items-center justify-between pt-space-xs">
                  <div>
                    <p className="text-[15px] font-semibold text-navy-ink">{r.name}</p>
                    <span className="text-body-sm text-secondary">{r.who}</span>
                  </div>
                  <span className="rounded bg-surface-container px-2 py-1 text-spec-num text-cobalt-electric">{r.vol}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 로스터리 랩 & 쇼룸 */}
      <section id="lab" className="wrap py-space-xl">
        <div className="overflow-hidden rounded-xl bg-canvas-card shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="flex flex-col justify-between p-space-lg lg:col-span-6 lg:p-space-xl">
              <div>
                <div className="mb-space-sm inline-flex items-center gap-1.5 rounded bg-surface-container px-3 py-1 text-label-caps uppercase tracking-wider text-cobalt-electric">
                  <MapPin className="size-3.5" aria-hidden="true" /> Mapo Atelier • Roasting Lab
                </div>
                <h2 className="mb-space-xs text-headline-lg-mobile text-navy-ink md:text-headline-lg">로우웨이브 로스터리 랩 &amp; 쇼룸</h2>
                <p className="mb-space-md text-body-md leading-relaxed text-secondary">서울 마포구 독막로. 거대한 유리창 너머로 회전하는 프로밧 로스터의 열기와 매일 정오에 진행되는 시음 바를 직접 경험해보세요.</p>
                <dl className="mb-space-md flex flex-col gap-space-xs rounded-lg bg-surface-container-low p-space-md">
                  {[
                    ["오픈 시간", "월-금 09:00 - 18:00 (주말 휴무)", "text-navy-ink"],
                    ["퍼블릭 커핑", "매주 목요일 15:00 (사전예약제)", "text-cobalt-electric"],
                    ["주차 안내", "쇼룸 앞 2대 전용 주차 가능", "text-navy-ink"],
                  ].map(([k, v, c]) => (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <dt className="shrink-0 text-label-caps uppercase text-secondary">{k}</dt>
                      <dd className={`text-right text-spec-num ${c}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm">
                <CuppingBooking />
                <a href="https://map.kakao.com/?q=서울 마포구 독막로" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-surface-container px-5 text-body-md font-semibold text-navy-ink transition-colors hover:bg-surface-dim">
                  카카오맵 길찾기 <Navigation className="size-[18px]" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="relative min-h-[320px] lg:col-span-6">
              <Image src="/images/map.webp" alt="서울 마포구 일대 지도" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
              <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-lg bg-navy-ink/90 px-3 py-2 text-on-primary shadow-lg backdrop-blur-md">
                <span className="size-2.5 animate-ping rounded-full bg-cobalt-electric" />
                <span className="text-label-caps tracking-wider">LIVE ROASTING IN SESSION</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
