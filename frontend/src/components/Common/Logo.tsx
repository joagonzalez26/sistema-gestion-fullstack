import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const textOnly = (
    <div className={cn("flex items-center", className)}>
      <span className="text-lg font-semibold tracking-tight text-white">
        Sistema de Gestión
      </span>
    </div>
  )

  const responsive = (
    <>
      <div className="group-data-[collapsible=icon]:hidden">{textOnly}</div>
      <div className="hidden group-data-[collapsible=icon]:block" />
    </>
  )

  const content =
    variant === "responsive"
      ? responsive
      : variant === "icon"
        ? null
        : textOnly

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}