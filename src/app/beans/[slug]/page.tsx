import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, CalendarDays, FlaskConical, MessageCircleQuestion, Star } from "lucide-react";
import Gallery from "@/components/detail/Gallery";
import PurchasePanel from "@/components/detail/PurchasePanel";
import BeanCard from "@/components/BeanCard";
import { beans, CATEGORY_LABEL, getBean } from "@/data/beans";

export const dynamicParams = false;
export const generateStaticParams = () => beans.map((b) => ({ slug: b.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = getBean((await params).slug);
  if (!b) return {};
  return { title: b.name, description: `${b.detail.quote.replace(/[“”]/g, "")} — ${b.notes.join(", ")}`, openGraph: { images: [{ url: b.image }] } };
}

// 시안의 테이스팅 리뷰는 예가체프 아리차 기준이라 그 원두에만 보여 준다.
const REVIEWS: Record<string, { date: string; title: string; text: string; who: string; initial: string; tag: string; photo?: string }[]> = {
  aricha: [
    { date: "2026.10.14", title: "자스민과 복숭아 향이 드립하는 내내 거실 가득 퍼집니다", text: "리듬 아틀리에 레시피대로 92도 하리오 V60 뜸 40초 주고 추출했더니 정말 노트에 적힌 화사한 자스민 꽃 향이 폭발하네요. 식을수록 단맛이 더 좋아져서 주말 아침마다 매일 내리고 있습니다. 500g 재구매 예정입니다.", who: "강*현 (홈바리스타)", initial: "K", tag: "200g 홀빈 구매" },
    { date: "2026.10.08", title: "매장 필터 커피 라인업으로 손님들 반응이 폭발적입니다", text: "마포구 연남동에서 스페셜티 카페를 운영 중인데 이번 마이크로랏을 싱글 오리진 브루잉으로 세팅했습니다. 클린컵이 매우 우수하고 발효취 없이 아주 투명한 단맛입니다. B2B 1kg 벌크 주문으로 정기배송 전환했어요.", who: "문*호 (카페 오너)", initial: "M", tag: "B2B 파트너 구매", photo: "/images/review-cafe.webp" },
    { date: "2026.09.29", title: "구독으로 받아보는데 디개싱 5일차에 포텐셜이 터집니다", text: "로스팅 날짜가 바로 어제 날짜로 적혀서 안전하게 배송되었고 질소 충진 패키징 덕분에 향미 손실이 전혀 없습니다. 로스팅 후 5일에서 10일 사이에 단맛과 복숭아 톤이 가장 선명해지네요. 강력 추천합니다.", who: "박*우 (구독 회원)", initial: "P", tag: "2주 정기구독 이용 중" },
  ],
};

const SENSORY = [
  ["aroma", "Aroma (향미)"],
  ["sweetness", "Sweetness (단맛)"],
  ["acidity", "Acidity (산미의 질)"],
  ["aftertaste", "Aftertaste (여운)"],
  ["body", "Body (마우스필)"],
] as const;

const card = "w-full rounded-xl bg-surface-container-lowest p-space-lg shadow-sm";

export default async function BeanPage({ params }: Props) {
  const b = getBean((await params).slug);
  if (!b) notFound();
  const d = b.detail;
  const reviews = REVIEWS[b.slug];
  const temp = b.roast === "light" ? 92 : 89;
  const others = beans.filter((x) => x.slug !== b.slug && x.category === b.category).slice(0, 3);

  return (
    <>
      <section className="w-full bg-surface-container-low/60">
        <div className="wrap flex items-center justify-between gap-space-md py-space-sm text-body-sm text-on-surface-variant">
          <nav aria-label="현재 위치" className="flex min-w-0 items-center gap-space-xs">
            <Link href="/" className="py-2 hover:text-on-surface">
              홈
            </Link>
            <span className="text-outline-variant">/</span>
            <Link href="/beans/" className="shrink-0 py-2 hover:text-on-surface">
              원두 컬렉션
            </Link>
            <span className="text-outline-variant">/</span>
            <Link href={`/beans/?category=${b.category}`} className="shrink-0 py-2 hover:text-on-surface">
              {CATEGORY_LABEL[b.category]}
            </Link>
            <span className="hidden text-outline-variant sm:inline">/</span>
            <span aria-current="page" className="hidden truncate font-semibold text-on-surface sm:inline">
              {b.name}
            </span>
          </nav>
          <div className="hidden shrink-0 items-center gap-space-md lg:flex">
            <span className="text-spec-num tracking-wider text-primary">LOT: {d.lot}</span>
            <span className="size-1.5 rounded-full bg-primary-container" />
            <span className="text-label-caps uppercase tracking-wider text-secondary">In Stock · Roasting Today</span>
          </div>
        </div>
      </section>

      <section className="wrap py-space-xl">
        <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-space-xl lg:col-span-7">
            <Gallery bean={b} />

            <div className={card}>
              <div className="mb-space-md flex items-center justify-between pb-space-sm">
                <h2 className="flex items-center gap-1.5 text-label-caps uppercase tracking-wider text-secondary">
                  <BarChart3 className="size-4 text-primary" aria-hidden="true" /> Origin Dossier &amp; Telemetry
                </h2>
                <span className="text-spec-num text-on-surface-variant">SCA {d.score} PTS</span>
              </div>
              <dl className="grid grid-cols-2 gap-space-md md:grid-cols-4">
                {[
                  ["Altitude", d.altitude, d.region],
                  ["Process", d.process, d.processNote],
                  ["Varietal", d.varietal, d.varietalNote],
                  ["Crop Year", d.crop, d.moisture],
                ].map(([k, v, note]) => (
                  <div key={k} className="flex flex-col rounded-lg bg-surface-container-low p-space-md">
                    <dt className="text-label-caps uppercase text-secondary">{k}</dt>
                    <dd className="mt-0.5 text-headline-sm text-navy-ink">{v}</dd>
                    <dd className="text-body-sm text-on-surface-variant">{note}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={`${card} flex flex-col gap-space-md`}>
              <div className="flex items-center gap-space-xs">
                <span className="size-2.5 rounded-full bg-accent-amber" />
                <span className="text-label-caps uppercase tracking-wider text-secondary">Roaster&apos;s Cupping Note</span>
              </div>
              <h2 className="text-headline-md font-semibold text-navy-ink">{d.quote}</h2>
              <p className="text-body-lg leading-relaxed text-on-surface-variant">{d.story}</p>
              <ul className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                {d.flavors.map((f) => (
                  <li key={f} className="rounded bg-surface-container-low px-3 py-1.5 text-spec-num text-navy-ink">
                    # {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className={card}>
              <div className="flex flex-col justify-between gap-space-xs pb-space-md sm:flex-row sm:items-center">
                <div>
                  <span className="text-label-caps uppercase tracking-wider text-secondary">Sensory Spectrum</span>
                  <h2 className="text-headline-sm text-navy-ink">관능 스펙트럼 지표</h2>
                </div>
                <div className="flex items-center gap-space-xs self-start rounded-lg bg-surface-container-low px-3 py-1.5 sm:self-auto">
                  <span className="size-2.5 rounded-full bg-accent-amber" />
                  <span className="text-label-caps uppercase text-navy-ink">Roast Degree: {d.roastDegree}</span>
                </div>
              </div>
              <dl className="flex flex-col gap-space-md">
                {SENSORY.map(([key, label]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-body-sm">
                      <dt className="font-semibold text-navy-ink">{label}</dt>
                      <dd className="text-spec-num text-primary tabular-nums">{d.sensory[key].toFixed(1)} / 5.0</dd>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high" aria-hidden="true">
                      <div className="h-full rounded-full bg-primary-container" style={{ width: `${d.sensory[key] * 20}%` }} />
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div id="brew" className={card}>
              <div className="mb-space-md flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <FlaskConical className="size-5 text-primary" aria-hidden="true" />
                  <div>
                    <span className="text-label-caps uppercase tracking-wider text-secondary">Atelier Brewing Formula</span>
                    <h2 className="text-headline-sm text-navy-ink">Hario V60 추출 가이드</h2>
                  </div>
                </div>
                <span className="rounded bg-surface-container-low px-2.5 py-1 text-label-caps text-on-surface">1:15.5 Ratio</span>
              </div>
              <dl className="mb-space-lg grid grid-cols-2 gap-space-xs sm:grid-cols-4">
                {[
                  ["Dose", "18.0 g"],
                  ["Water Volume", "280 ml"],
                  ["Water Temp", `${temp} ℃`],
                  ["Total Time", "2m 20s"],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col-reverse rounded bg-surface-container-low p-space-sm text-center">
                    <dt className="text-label-caps uppercase text-secondary">{k}</dt>
                    <dd className="text-headline-sm text-navy-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <ol className="relative space-y-space-md pl-6">
                <span className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-surface-container-high" aria-hidden="true" />
                {[
                  ["0:00 - 0:40", "뜸 들이기 (Blooming)", "원두 중심부부터 부드럽게 적시어 이산화탄소 가스 배출", "45 ml"],
                  ["0:40 - 1:20", "1차 푸어 (1st Pour)", "일정한 유속의 나선형 푸어로 과즙감과 아로마를 농축 추출", "+115 ml (누적 160ml)"],
                  ["1:30 - 2:20", "2차 푸어 및 드리퍼 분리 (Final Pour)", "중심부에 집중 주수해 깔끔한 여운을 완성하고 2분 20초에 분리", "+120 ml (누적 280ml)"],
                ].map(([time, title, note, ml]) => (
                  <li key={time} className="relative">
                    <span className="absolute top-1 -left-6 size-3.5 rounded-full bg-primary ring-4 ring-surface-container-lowest" aria-hidden="true" />
                    <div className="flex flex-col justify-between gap-1 rounded-lg bg-surface-container-low p-space-sm sm:flex-row sm:items-center">
                      <div>
                        <span className="text-spec-num text-primary">{time}</span>
                        <p className="text-body-md font-medium text-navy-ink">{title}</p>
                        <span className="text-body-sm text-on-surface-variant">{note}</span>
                      </div>
                      <span className="self-start rounded bg-surface-container-lowest px-2 py-1 text-spec-num font-bold text-navy-ink sm:self-center">{ml}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <PurchasePanel bean={b} rating={reviews && { score: "4.9", count: 128 }} />
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="h-px w-full bg-surface-container-highest" />
      </div>

      <section className="wrap py-space-xl">
        {reviews ? (
          <>
            <div className="mb-space-lg flex flex-col justify-between gap-space-md md:flex-row md:items-end">
              <div>
                <span className="flex items-center gap-1 text-label-caps uppercase tracking-wider text-secondary">
                  <span className="size-2 rounded-full bg-primary" /> Cupper &amp; Customer Community
                </span>
                <h2 className="mt-1 text-headline-lg-mobile text-navy-ink md:text-headline-lg">추출 저널 &amp; 테이스팅 리뷰</h2>
              </div>
              <div className="flex items-center gap-space-lg rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-accent-amber" role="img" aria-label="평균 별점 4.9점">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="size-5 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="mt-0.5 text-headline-sm font-bold text-navy-ink">4.9 / 5.0</span>
                </div>
                <div className="h-8 w-px bg-surface-container-highest" />
                <div className="flex flex-col text-body-sm">
                  <span className="font-semibold text-navy-ink">구매 고객 리뷰 128건</span>
                  <span className="text-on-surface-variant">재구매율 94.2%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
              {reviews.map((r) => (
                <article key={r.date} className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
                  <div>
                    <div className="mb-space-sm flex items-center justify-between">
                      <div className="flex items-center gap-1 text-accent-amber" role="img" aria-label="별점 5점">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                        ))}
                      </div>
                      <span className="text-spec-num text-on-surface-variant">{r.date}</span>
                    </div>
                    <h3 className="text-headline-sm font-semibold text-navy-ink">{r.title}</h3>
                    <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">{r.text}</p>
                    {r.photo && (
                      <div className="relative mt-space-sm h-28 w-full overflow-hidden rounded-lg">
                        <Image src={r.photo} alt="카페 바 카운터의 핸드드립 세팅" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="mt-space-md flex items-center justify-between gap-2 pt-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="flex size-7 items-center justify-center rounded-full bg-secondary-container text-body-sm font-semibold text-navy-ink">{r.initial}</span>
                      <span className="text-body-sm font-medium text-navy-ink">{r.who}</span>
                    </div>
                    <span className="rounded bg-secondary-container/30 px-2 py-0.5 text-label-caps text-primary">{r.tag}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          others.length > 0 && (
            <>
              <h2 className="mb-space-lg text-headline-lg-mobile text-navy-ink md:text-headline-lg">함께 보면 좋은 {CATEGORY_LABEL[b.category]}</h2>
              <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
                {others.map((o) => (
                  <BeanCard key={o.slug} bean={o} />
                ))}
              </div>
            </>
          )
        )}

        <div className="mt-space-lg flex flex-col items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md sm:flex-row">
          <div className="flex items-center gap-space-sm">
            <MessageCircleQuestion className="size-[22px] shrink-0 text-primary" aria-hidden="true" />
            <span className="text-body-md text-navy-ink">이 원두의 추출 프로파일이나 디개싱이 궁금하신가요?</span>
          </div>
          <Link href="/#lab" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded bg-primary px-4 text-label-caps uppercase tracking-wider text-on-primary transition-colors hover:bg-cobalt-electric">
            <CalendarDays className="size-4" aria-hidden="true" /> 목요 커핑에서 직접 맛보기
          </Link>
        </div>
      </section>
    </>
  );
}
