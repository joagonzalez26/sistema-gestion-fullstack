import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import AppSidebar from "@/components/Sidebar/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-slate-950 text-white">
        <AppSidebar />

        <SidebarInset className="bg-slate-950 text-white">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1 text-white/70 hover:text-white" />
          </header>

          <main className="flex-1 bg-slate-950 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default Layout