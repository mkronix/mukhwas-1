import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LoadingButton } from '@/components/ui/loading-button';
import { useStorefrontAuth } from '@/storefront/auth/useStorefrontAuth';
import { useAuthModal } from './AuthModalContext';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login } = useStorefrontAuth();
  const { open, close, setEmail: setModalEmail } = useAuthModal();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: LoginFormValues) => {
    setServerError('');
    try {
      await login(values.email, values.password);
      close();
    } catch {
      setServerError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await login('google@test.com', '');
      close();
    } catch {
      setServerError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-12 pl-10 pr-12"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end -mt-1">
            <button
              type="button"
              onClick={() => { setModalEmail(form.getValues('email')); open('forgot-password'); }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Signing in..."
            className="h-12 w-full rounded-xl bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))]"
          >
            Sign In
          </LoadingButton>
        </form>
      </Form>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <LoadingButton
        type="button"
        loading={googleLoading}
        loadingText="Connecting..."
        onClick={handleGoogle}
        className="h-12 w-full rounded-xl border-2 font-bold text-sm gap-3 bg-[hsl(var(--sf-red))] text-white hover:bg-[hsl(var(--sf-brown))] border-[hsl(var(--sf-red))] hover:border-[hsl(var(--sf-brown))] flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </LoadingButton>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button type="button" onClick={() => open('signup')} className="font-bold text-primary hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;