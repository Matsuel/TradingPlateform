"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { findActive } from "@/lib/path"
import { usePathname } from "next/navigation"

interface SidebarNavProps {
  name: string
  tabs: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}

const SidebarNav = ({
  tabs,
  name
}: SidebarNavProps) => {

  const active = findActive(usePathname())

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{name}</SidebarGroupLabel>
      <SidebarMenu>
        {tabs.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton isActive={active?.url === item.url} render={<a href={item.url} />}>
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default SidebarNav