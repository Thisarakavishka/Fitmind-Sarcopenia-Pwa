import { Sidebar } from "../../components/layout/Sidebar";
import { MobileNav } from "../../components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* 1. Desktop Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 md:ml-72 pb-24 md:pb-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-500">
          {children}
        </div>
      </main>

      {/* 3. Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}