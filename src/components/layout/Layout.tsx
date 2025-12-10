import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/sonner";

export function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <main className="md:ml-64 flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-6 md:p-8">
          <Outlet />
        </div>
        <Footer />
      </main>
      <Toaster />
    </div>
  );
}
