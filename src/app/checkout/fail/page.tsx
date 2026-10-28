import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutFail } from "@/components/checkout/CheckoutResult";

export const metadata: Metadata = { title: "결제 실패", robots: { index: false } };

export default function CheckoutFailPage() {
  return (
    <section className="wrap min-h-[70vh] py-space-xl">
      <Suspense>
        <CheckoutFail />
      </Suspense>
    </section>
  );
}
