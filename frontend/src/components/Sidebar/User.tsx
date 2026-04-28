import { Link as RouterLink } from "@tanstack/react-router"
import { ChevronsUpDown, LogOut, Settings } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/utils"

interface UserInfoProps {
  fullName?: string
  email?: string
}

function UserInfo({ fullName, email }: UserInfoProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2.5">
      <Avatar className="size-8">
        <AvatarFallback className="bg-cyan-500/20 text-cyan-200">
          {getInitials(fullName || "User")}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col items-start">
        <p className="w-full truncate text-sm font-medium text-white">
          {fullName}
        </p>
        <p className="w-full truncate text-xs text-white/55">{email}</p>
      </div>
    </div>
  )
}

export function User({ user }: { user: any }) {
  const { logout } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  if (!user) return null

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = async () => {
    logout()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="rounded-xl text-white hover:bg-white/5 data-[state=open]:bg-white/8 data-[state=open]:text-white"
              data-testid="user-menu"
            >
              <UserInfo fullName={user?.full_name} email={user?.email} />
              <ChevronsUpDown className="ml-auto size-4 text-white/45" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg border border-white/10 bg-slate-950 text-white"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-2 font-normal">
              <UserInfo fullName={user?.full_name} email={user?.email} />
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-white/10" />

            <RouterLink to="/settings" onClick={handleMenuClick}>
              <DropdownMenuItem className="cursor-pointer text-white hover:bg-white/5 focus:bg-white/5">
                <Settings />
                Configuración
              </DropdownMenuItem>
            </RouterLink>

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-white hover:bg-white/5 focus:bg-white/5"
            >
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}