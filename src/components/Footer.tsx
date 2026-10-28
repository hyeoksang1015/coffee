import Link from "next/link";
import { site } from "@/data/site";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low">
      <div className="wrap pt-space-xl pb-space-lg">
        <div className="mb-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-4">
          <div className="flex flex-col gap-space-xs">
            <span className="text-headline-sm uppercase tracking-tight text-on-surface">{site.name}</span>
            <p className="text-body-sm text-on-surface-variant">Specialty Coffee Atelier &amp; Wholesale Purveyor. Architectural roasting profiles curated for sensory clarity.</p>
            <Link href="/#lab" className="mt-space-sm inline-flex min-h-11 items-center gap-1 text-label-caps uppercase tracking-wider text-primary transition-colors hover:text-primary-container">
              커핑 세션 예약 바로가기 →
            </Link>
          </div>
          <div className="flex flex-col gap-space-xs">
            <span className="text-label-caps uppercase tracking-wider text-on-surface-variant">Roastery Lab</span>
            <p className="text-body-sm text-on-surface">{site.address}</p>
            <p className="text-body-sm text-on-surface-variant">
              운영시간: {site.hours}
              <br />
              문의: {site.email}
            </p>
          </div>
          <nav aria-label="바로가기" className="flex flex-col gap-space-xs">
            <span className="text-label-caps uppercase tracking-wider text-on-surface-variant">Quick Navigation</span>
            {[
              ["/beans/?category=single", "시즌 싱글오리진 빈샵"],
              ["/wholesale/#inquiry", "사업자 원두 공급 문의"],
              ["/beans/aricha/#brew", "추출 가이드"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="flex min-h-11 items-center text-body-sm text-on-surface-variant transition-colors hover:text-on-surface md:min-h-8">
                {label}
              </Link>
            ))}
          </nav>
          <Newsletter />
        </div>
        <div className="flex flex-col items-start justify-between gap-space-sm pt-space-md text-body-sm text-on-surface-variant md:flex-row md:items-center">
          <div className="flex flex-wrap gap-x-space-md gap-y-space-xs">
            <span>{site.company}</span>
            <span>사업자등록번호: {site.bizNo}</span>
            <span>통신판매업신고: {site.mailOrderNo}</span>
          </div>
          <span className="text-spec-num">© 2026 LOWWAVE COFFEE ATELIER.</span>
        </div>
        <p className="mt-space-md text-body-sm text-on-surface-variant">이 사이트는 포트폴리오용 가상 브랜드입니다. 상품·후기·수치는 예시이며, 결제는 토스페이먼츠 테스트 모드라 실제로 돈이 빠져나가지 않고 배송되지 않습니다.</p>
      </div>
    </footer>
  );
}
