import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-center justify-center gap-space-md py-space-xl text-center">
      <span className="text-label-caps uppercase tracking-wider text-cobalt-electric">404 · Not Found</span>
      <h1 className="text-headline-lg-mobile text-navy-ink md:text-headline-lg">찾으시는 페이지가 없습니다.</h1>
      <Link href="/beans/" className="inline-flex min-h-11 items-center rounded-lg bg-cobalt-electric px-6 text-body-md font-semibold text-on-primary hover:bg-primary">
        원두 컬렉션으로 가기
      </Link>
    </section>
  );
}
