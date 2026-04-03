import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useStorefrontAuth } from '@/storefront/auth/useStorefrontAuth';
import { useAuthModal } from './AuthModalContext';

const VerifyEmailForm: React.FC = () => {
  const { verifyEmail } = useStorefrontAuth();
  const { email, close } = useAuthModal();
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async () => {
    setLoading(true);
    await verifyEmail('mock-token');
    setLoading(false);
    close();
  };

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Mail className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Verify Your Email</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          We've sent a verification link to<br />
          <strong className="text-foreground">{email || 'your email'}</strong>
        </p>
      </div>

      <button onClick={handleVerify} disabled={loading}
        className="w-full h-12 rounded-xl bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        {loading ? 'Verifying...' : 'Verify Now'}
      </button>

      <button onClick={() => setCooldown(60)} disabled={cooldown > 0}
        className="text-sm font-bold text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
      </button>
    </div>
  );
};

export default VerifyEmailForm;
