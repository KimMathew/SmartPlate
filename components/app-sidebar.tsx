"use client";

import {
  Utensils,
  Calendar,
  BarChart2,
  BookOpen,
  User,
  LogOut,
  ChevronDown,
  ChevronsUpDown,
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
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";
import { useEffect, useState } from "react";

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
];

const accountItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const { user } = useSession();
  const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("Users")
          .select("first_name, last_name, email")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile({
            fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            email: data.email || user.email || "",
          });
        } else {
          setProfile({ fullName: "", email: user.email || "" });
        }
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-center">
          <h1 className="text-xl font-bold text-emerald-600">SmartPlate</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Meal & Nutrition Hub</SidebarGroupLabel>
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
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => {
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
      <SidebarFooter className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-1 gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {profile?.fullName
                    ? profile.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm min-w-0">
                <span className="font-medium truncate max-w-[150px]">
                  {profile?.fullName || "-"}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {profile?.email || "-"}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[256px]">
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 py-2 cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
