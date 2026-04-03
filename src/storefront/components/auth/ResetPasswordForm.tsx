import React, { useState, useMemo } from "react";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useStorefrontAuth } from "@/storefront/auth/useStorefrontAuth";
import { useAuthModal } from "./AuthModalContext";
import { Input } from "@/components/ui/input";

const getStrength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const m: Record<number, { label: string; color: string }> = {
    0: { label: "Too weak", color: "bg-destructive" },
    1: { label: "Weak", color: "bg-destructive" },
    2: { label: "Fair", color: "bg-warning" },
    3: { label: "Good", color: "bg-success" },
    4: { label: "Strong", color: "bg-success" },
  };
  return { score: s, ...m[s] };
};

const ResetPasswordForm: React.FC = () => {
  const { updatePassword } = useStorefrontAuth();
  const { open, close } = useAuthModal();
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const strength = useMemo(() => getStrength(pw), [pw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirmPw) {
      setError("Passwords do not match");
      return;
    }
    if (strength.score < 2) {
      setError("Password is too weak");
      return;
    }
    setError("");
    setLoading(true);
    await updatePassword(pw);
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-black uppercase text-foreground">
          Password Updated
        </h2>
        <p className="text-sm text-muted-foreground">
          You can now sign in with your new password.
        </p>
        <button
          onClick={() => {
            open("login");
          }}
          className="h-12 w-full rounded-xl bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
          Reset Password
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your new password
        </p>
      </div>
      {error && (
        <div className="bg-destructive-muted text-destructive text-sm px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type={showPw ? "text" : "password"}
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full pl-10 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        {pw && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < strength.score ? strength.color : "bg-border"}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="password"
            required
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="w-full pl-10 pr-4"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-xl bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))] transition-colors disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
