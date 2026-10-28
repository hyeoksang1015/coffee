import type { Metadata } from "next";
import Checkout from "@/components/checkout/Checkout";

export const metadata: Metadata = { title: "주문 · 결제", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <section className="wrap min-h-[70vh] py-space-xl">
      <Checkout />
    </section>
  );
}
