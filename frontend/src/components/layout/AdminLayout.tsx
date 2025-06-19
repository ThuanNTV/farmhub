import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function AdminLayout(): ReactNode {
  return (
    <div className="h-screen flex ">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 ">
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-muted/40">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </div>
  );
}
