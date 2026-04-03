import React, { useMemo } from "react"
import { X } from "lucide-react"
import { useAuthModal } from "./AuthModalContext"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import VerifyEmailForm from "./VerifyEmailForm"
import ForgotPasswordForm from "./ForgotPasswordForm"
import ResetPasswordForm from "./ResetPasswordForm"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import logoImg from "@/assets/logo.png"

const views = {
  login: LoginForm,
  signup: SignupForm,
  "verify-email": VerifyEmailForm,
  "forgot-password": ForgotPasswordForm,
  "reset-password": ResetPasswordForm,
} as const

const titles: Record<keyof typeof views, string> = {
  login: "Login",
  signup: "Create Account",
  "verify-email": "Verify Email",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
}

const AuthModal: React.FC = () => {
  const { view, close } = useAuthModal()

  const Form = view ? views[view] : null

  const title = useMemo(() => {
    if (!view) return ""
    return titles[view]
  }, [view])

  if (!view || !Form) return null

  return (
    <ResponsiveModal
      open={!!view}
      onOpenChange={(open) => {
        if (!open) close()
      }}
      title={title}
      className="sf-theme bg-[hsl(var(--sf-cream))] rounded-2xl"
    >
      <div className="relative">
        <div className="flex justify-center mb-2">
          <img
            src={logoImg}
            alt="The Mukhwas Company"
            className="h-10 object-contain"
          />
        </div>

        <Form />
      </div>
    </ResponsiveModal>
  )
}

export default AuthModal