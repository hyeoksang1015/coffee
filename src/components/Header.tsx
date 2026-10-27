"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { nav, site } from "@/data/site";
import { totals } from "@/lib/cart";
import { useCart } from "./CartProvider";

export default function Header() {
  const path = usePathname();
  const { items, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const count = totals(items).count;
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <header className="fixed top-0 left-0 z-40 w-full bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="wrap flex h-20 items-center justify-between">
        <Link href="/" className="group flex flex-col">
          <span className="text-headline-sm uppercase tracking-tight text-on-surface transition-colors group-hover:text-primary">{site.name}</span>
          <span className="text-label-caps uppercase tracking-wider text-on-surface-variant">{site.tagline}</span>
        </Link>
        <nav aria-label="주요 메뉴" className="hidden items-center gap-space-lg md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={active(n.href) ? "text-body-md font-semibold text-primary" : "text-body-md text-on-surface-variant transition-colors hover:text-on-surface"}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-space-sm">
          <Link href="/wholesale/#inquiry" className="hidden items-center rounded-lg bg-primary-container px-space-md py-space-xs text-label-caps uppercase tracking-wider text-on-primary transition-colors hover:bg-primary lg:inline-flex">
            B2B 샘플 신청
          </Link>
          <button type="button" onClick={() => setOpen(true)} aria-label={`장바구니 열기, ${count}개 담김`} className="relative flex size-11 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface">
            <ShoppingBag className="size-[22px]" aria-hidden="true" />
            {count > 0 && (
              <span data-testid="cart-count" className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-on-primary tabular-nums">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
            className="flex size-11 items-center justify-center text-navy-ink md:hidden"
          >
            {menu ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      {menu && (
        <nav id="mobile-menu" aria-label="모바일 메뉴" className="border-t border-line-neutral bg-surface md:hidden">
          <div className="wrap flex flex-col py-3">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)} aria-current={active(n.href) ? "page" : undefined} className="flex min-h-12 items-center text-body-lg text-navy-ink aria-[current=page]:font-semibold aria-[current=page]:text-primary">
                {n.label}
              </Link>
            ))}
            <Link href="/wholesale/#inquiry" onClick={() => setMenu(false)} className="mt-2 flex min-h-12 items-center justify-center rounded-lg bg-primary-container text-body-md font-semibold text-on-primary">
              B2B 샘플 신청
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
