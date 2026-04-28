import { BarChart3, Bot, Home, Package, ShoppingCart, Users, Warehouse } from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

const baseItems: Item[] = [
  { icon: Home,         title: "Panel",        path: "/" },
  { icon: Package,      title: "Productos",    path: "/items" },
  { icon: Users,        title: "Clientes",     path: "/clientes" },
  { icon: ShoppingCart, title: "Ventas",       path: "/ventas" },
  { icon: Warehouse,    title: "Stock",        path: "/stock" },
  { icon: BarChart3,    title: "Reportes",     path: "/reportes" },
  { icon: Bot,          title: "Asistente IA", path: "/asistente" },
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const items = currentUser?.is_superuser
    ? [...baseItems, { icon: Users, title: "Admin", path: "/admin" }]
    : baseItems

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/10 bg-slate-950/95 text-white backdrop-blur-md"
    >
      <SidebarHeader className="border-b border-white/10 bg-slate-950/95 px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <Logo variant="responsive" />
          <span className="shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300/70 group-data-[collapsible=icon]:hidden">
            v2.0
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-950/95 px-2 py-3">
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 bg-slate-950/95">
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
