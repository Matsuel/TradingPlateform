"use client"

import * as React from "react";

import SidebarNav from "@/components/SidebarNav";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import tabs from "@/constants/sidebar";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  const { data: session, isPending } = useSession();
    const router = useRouter();
  
    React.useEffect(() => {
      if (!isPending && !session) router.replace("/login");
    }, [isPending, session, router]);
  
    if (isPending) return <p>Chargement...</p>;
    if (!session) return null;
  
    const { user } = session;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Link href="/dashboard" className="flex w-full items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Oeoeoe l&apos;application</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {tabs.map((parts) => (
          <SidebarNav tabs={parts.tabs} name={parts.name} key={parts.name} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
