"use client";

import { ReactNode } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { useSession } from "@/lib/session-context";
import Forbidden from "@/components/ui/forbidden";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useSession();
  if (!isLoading && !user) {
    return <Forbidden message="You must be logged in to access Recipes." />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
