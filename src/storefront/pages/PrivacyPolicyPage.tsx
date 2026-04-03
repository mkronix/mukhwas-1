import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sections = [
  { id: 'collection', title: 'Information We Collect', text: 'We collect personal information you provide directly — name, email, phone, shipping address, and payment details when you place an order. We also collect browsing data through cookies to improve your experience.' },
  { id: 'usage', title: 'How We Use Your Information', text: 'Your information is used to process orders, send order updates, improve our products, and personalize your shopping experience. We never sell your personal data to third parties.' },
  { id: 'sharing', title: 'Information Sharing', text: 'We share your information only with trusted partners who help us deliver orders (shipping providers, payment processors). All partners are bound by strict data protection agreements.' },
  { id: 'cookies', title: 'Cookies', text: 'We use essential cookies for site functionality and analytics cookies to understand how visitors use our site. You can manage cookie preferences in your browser settings.' },
  { id: 'security', title: 'Data Security', text: 'We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.' },
  { id: 'rights', title: 'Your Rights', text: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@themukhwascompany.com for any data-related requests.' },
  { id: 'contact', title: 'Contact Us', text: 'For privacy-related questions, email privacy@themukhwascompany.com or write to: The Mukhwas Company, Mumbai, Maharashtra 400001, India.' },
];

const PrivacyPolicyPage: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.from(Array.from(contentRef.current.children), {
          y: 50, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: contentRef.current, start: 'top 78%' },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-[hsl(var(--sf-cream))]">
      {/* Hero */}
      <section className="relative bg-[hsl(var(--sf-red))] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, hsl(var(--sf-gold) / 0.08) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="max-w-[1500px] mx-auto px-6 md:px-16 py-20 md:py-28 text-center relative z-10">
          <motion.div
            className="flex items-center justify-center gap-3 mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-px w-10 bg-[hsl(var(--sf-gold))]" />
            <span className="sf-label">Legal</span>
            <div className="h-px w-10 bg-[hsl(var(--sf-gold))]" />
          </motion.div>

          {['PRIVACY', 'POLICY.'].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                className="block font-black text-white uppercase m-0"
                style={{ fontSize: 'clamp(40px, 6vw, 88px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 + i * 0.14, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.h1>
            </div>
          ))}

          <motion.p
            className="mt-5 text-white/50 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            Last updated: March 2025
          </motion.p>
        </div>

        {/* Wave divider */}
        <div className="leading-[0]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: 'clamp(50px, 6vw, 80px)' }}>
            <rect width="1000" height="100" fill="#faf8f5" />
            <path d="M1000 100C500 100 500 64 0 64V0h1000v100Z" fill="hsl(0 72% 40%)" opacity=".15" />
            <path d="M1000 100C500 100 500 34 0 34V0h1000v100Z" fill="hsl(0 72% 40%)" opacity=".35" />
            <path d="M1000 100C500 100 500 4 0 4V0h1000v100Z" fill="hsl(0 72% 40%)" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[hsl(var(--sf-cream))] text-[hsl(var(--sf-brown))]">
        <div className="max-w-[900px] mx-auto px-6 md:px-16 py-16 md:py-24 flex gap-12">
          {/* Sidebar nav */}
          <aside className="hidden lg:block w-48 shrink-0 sticky top-[100px] self-start">
            <nav className="flex flex-col gap-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-[11px] font-bold uppercase tracking-[0.06em] text-[hsl(var(--sf-brown-mid))] hover:text-[hsl(var(--sf-red))] transition-colors py-1.5 border-l-2 border-transparent hover:border-[hsl(var(--sf-red))] pl-3"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Sections */}
          <div ref={contentRef} className="flex-1 min-w-0 flex flex-col gap-12">
            {sections.map((s, i) => (
              <div key={s.id} id={s.id} className="relative">
                <div
                  className="absolute -top-1 -left-3 font-black leading-none select-none pointer-events-none text-[hsl(var(--sf-gold)/0.08)]"
                  style={{ fontSize: '48px', letterSpacing: '-0.04em' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative z-10">
                  <h2 className="font-black uppercase text-[hsl(var(--sf-brown))] tracking-tight mb-3" style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>
                    {s.title}
                  </h2>
                  <p className="sf-body-text text-sm leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
