import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };

export default function AdminPage() {
  return (
    <section className="wrap min-h-[70vh] py-space-xl">
      <AdminDashboard />
    </section>
  );
}
