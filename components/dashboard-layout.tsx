"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-stretch">
          <div className="border-b border-gray-200 px-4 py-2 h-auto flex-shrink-0 w-full">
            <SidebarTrigger />
          </div>
        </div>
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
