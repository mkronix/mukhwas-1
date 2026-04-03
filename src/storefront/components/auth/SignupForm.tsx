import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useStorefrontAuth } from "@/storefront/auth/useStorefrontAuth";
import { useAuthModal } from "./AuthModalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const getStrength = (
  pw: string,
): { score: number; label: string; color: string } => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too weak", color: "bg-destructive" },
    1: { label: "Weak", color: "bg-destructive" },
    2: { label: "Fair", color: "bg-warning" },
    3: { label: "Good", color: "bg-success" },
    4: { label: "Strong", color: "bg-success" },
  };
  return { score: s, ...map[s] };
};

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showToggle?: boolean;
}> = ({ value, onChange, placeholder = "••••••••", showToggle = false }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

const StrengthBar: React.FC<{
  score: number;
  color: string;
  label: string;
}> = ({ score, color, label }) => (
  <div className="flex items-center gap-2 mt-1">
    <div className="flex-1 flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${i < score ? color : "bg-border"}`}
        />
      ))}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  </div>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const SignupForm: React.FC = () => {
  const { signup } = useStorefrontAuth();
  const { open, close, setEmail } = useAuthModal();

  const [name, setName] = useState("");
  const [email_, setEmail_] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) {
      setError("Passwords do not match");
      return;
    }
    if (strength.score < 2) {
      setError("Password is too weak");
      return;
    }
    if (!terms) {
      setError("Please accept terms and conditions");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signup({ name, email: email_, password, phone: "" });
      setEmail(email_);
      open("verify-email");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await signup({
      name: "Google User",
      email: "google@test.com",
      password: "",
      phone: "",
    });
    close();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="text-center mb-1">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
          Create Account
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Join The Mukhwas Company
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="email"
            required
            value={email_}
            onChange={(e) => setEmail_(e.target.value)}
            placeholder="you@example.com"
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Password
        </Label>
        <PasswordInput value={password} onChange={setPassword} showToggle />
        {password && (
          <StrengthBar
            score={strength.score}
            color={strength.color}
            label={strength.label}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Confirm Password
        </Label>
        <PasswordInput value={confirmPw} onChange={setConfirmPw} />
      </div>

      <div className="flex items-start gap-2.5">
        <Checkbox
          id="terms"
          checked={terms}
          onCheckedChange={(v) => setTerms(v === true)}
          className="mt-0.5"
        />
        <label
          htmlFor="terms"
          className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
        >
          I agree to the{" "}
          <a href="/terms" className="font-bold text-primary hover:underline">
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            className="font-bold text-primary hover:underline"
          >
            Privacy Policy
          </a>
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))]"
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        className="h-11 font-bold text-sm gap-3"
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => open("login")}
          className="font-bold text-primary hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  );
};

export default SignupForm;
