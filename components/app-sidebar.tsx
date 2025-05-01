"use client";

import {
  Utensils,
  Calendar,
  BarChart2,
  BookOpen,
  User,
  Menu,
  X,
} from "lucide-react";

import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Personalized Meal Plan",
    url: "/meal-plans",
    icon: Utensils,
  },
  {
    title: "Nutritional Tracking",
    url: "/nutrition",
    icon: BarChart2,
  },
  {
    title: "Meal Scheduling",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "Recipe Recommendations",
    url: "/recipes",
    icon: BookOpen,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-center">
          <h1 className="text-xl font-bold text-emerald-600">SmartPlate</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`${
                        isActive ? "bg-emerald-100 text-emerald-800" : ""
                      }`}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
