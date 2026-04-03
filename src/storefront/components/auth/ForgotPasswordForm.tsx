import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useStorefrontAuth } from "@/storefront/auth/useStorefrontAuth";
import { useAuthModal } from "./AuthModalContext";
import { Input } from "@/components/ui/input";

const ForgotPasswordForm: React.FC = () => {
  const { resetPassword } = useStorefrontAuth();
  const { open, email: modalEmail } = useAuthModal();
  const [email, setEmail] = useState(modalEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await resetPassword(email);
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
            Check Your Email
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            We've sent password reset instructions to
            <br />
            <strong className="text-foreground">{email}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => open("login")}
          className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
          Forgot Password?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we'll send reset instructions
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-xl bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))] transition-colors disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <button
        type="button"
        onClick={() => open("login")}
        className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to login
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
