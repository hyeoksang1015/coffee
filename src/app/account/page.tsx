import type { Metadata } from "next";
import Account from "@/components/account/Account";

export const metadata: Metadata = { title: "내 주문", robots: { index: false } };

export default function AccountPage() {
  return (
    <section className="wrap min-h-[70vh] py-space-xl">
      <Account />
    </section>
  );
}
