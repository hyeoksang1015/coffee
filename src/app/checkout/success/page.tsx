import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";

export const metadata: Metadata = { title: "결제 완료", robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <section className="wrap min-h-[70vh] py-space-xl">
      <Suspense>
        <CheckoutSuccess />
      </Suspense>
    </section>
  );
}
