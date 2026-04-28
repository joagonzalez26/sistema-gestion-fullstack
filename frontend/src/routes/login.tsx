import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { AuthLayout } from "@/components/Common/AuthLayout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const formSchema = z.object({
  username: z.email(),
  password: z
    .string()
    .min(1, { message: "Contraseña requerida" })
    .min(8, { message: "La contraseña requiere al menos 8 carácteres." }),
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Iniciar Sesión",
      },
    ],
  }),
})

function Login() {
  const { loginMutation } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return
    loginMutation.mutate(data)
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-white">
              Iniciá sesión
            </h1>
            <p className="text-sm text-white/70">
              Accedé a tu panel de gestión
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="email-input"
                      placeholder="correo@ejemplo.com"
                      type="email"
                      className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="text-white/90">Contraseña</FormLabel>
                    <RouterLink
                      to="/recover-password"
                      className="ml-auto text-sm text-white/80 underline-offset-4 hover:text-cyan-300 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </RouterLink>
                  </div>
                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="Contraseña"
                      className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              loading={loginMutation.isPending}
              className="bg-teal-500 text-white hover:bg-teal-400"
            >
              Ingresar
            </LoadingButton>
          </div>

          <div className="text-center text-sm text-white/80">
            ¿No tenés una cuenta?{" "}
            <RouterLink
              to="/signup"
              className="font-medium text-white underline underline-offset-4 hover:text-cyan-300"
            >
              Registrate
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}