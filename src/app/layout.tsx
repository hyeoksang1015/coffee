import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import CartProvider from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { site } from "@/data/site";

const title = `${site.name} — Specialty Roastery & Lab`;

export const metadata: Metadata = {
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { type: "website", locale: "ko_KR", siteName: site.name, title, description: site.description, images: [{ url: "/images/geisha-reserve.webp" }] },
};

export const viewport: Viewport = { themeColor: "#faf9f6" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-navy-ink focus:px-4 focus:py-2 focus:text-body-sm focus:text-on-primary">
          본문으로 건너뛰기
        </a>
        <CartProvider>
          <Header />
          <main id="main" className="w-full pt-20">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
