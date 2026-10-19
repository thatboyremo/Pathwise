import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "../landing/Footer";

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  return (
    <div
      className="min-h-screen bg-[#f6f7f3] text-[#0d1f17]"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <Navbar title={title} />

      <div className="flex min-h-[calc(100vh-70px)]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-8">
            {children}
          </main>

          <Footer />
        </div>
      </div>

      <Link
        to="/dashboard/coach"
        className="fixed bottom-7 right-7 z-50 inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,61,46,0.35)] transition-all hover:-translate-y-1 hover:bg-[#16523d]"
      >
        <MessageSquare className="h-4 w-4 text-[#f4b740]" />
        Ask AI Coach
      </Link>
    </div>
  );
}