"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebarRoutes = ["/"];

  const showSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <>
      {showSidebar ? (
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 px-4">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      ) : (
        <main>{children}</main>
      )}
    </>
  );
}
