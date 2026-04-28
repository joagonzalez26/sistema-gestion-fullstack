import { Appearance } from "@/components/Common/Appearance"
import { WelcomeOrb } from "./WelcomeOrb"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[linear-gradient(0deg,#1a3379,#0f172a,#000)]">
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="relative hidden items-center justify-center lg:flex">
          <WelcomeOrb />
        </div>

        <div className="relative z-10 flex flex-col p-6 md:p-10">
          <div className="flex justify-end">
            <Appearance />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}