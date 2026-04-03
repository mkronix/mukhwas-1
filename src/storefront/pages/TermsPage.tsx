import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms', text: 'By accessing and using The Mukhwas Company website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.' },
  { id: 'products', title: 'Products and Pricing', text: 'All products are subject to availability. Prices are in Indian Rupees (INR) and include applicable GST. We reserve the right to modify prices without prior notice. Product images are for illustration only and may differ slightly from the actual product.' },
  { id: 'orders', title: 'Orders and Payment', text: 'Once an order is placed, you will receive a confirmation email. We accept UPI, credit/debit cards, net banking, and cash on delivery. Orders are processed within 1-2 business days.' },
  { id: 'shipping', title: 'Shipping and Delivery', text: 'We ship across India. Standard delivery takes 3-7 business days. Free shipping on orders above ₹500. Delivery timelines are estimates and may vary by location.' },
  { id: 'returns', title: 'Returns and Refunds', text: 'We accept returns within 7 days of delivery for damaged or incorrect products. Refunds are processed within 5-7 business days to the original payment method. Opened food products cannot be returned for hygiene reasons.' },
  { id: 'intellectual', title: 'Intellectual Property', text: 'All content on this website — including text, images, logos, and product names — is the property of The Mukhwas Company and protected by intellectual property laws.' },
  { id: 'limitation', title: 'Limitation of Liability', text: 'The Mukhwas Company shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.' },
  { id: 'governing', title: 'Governing Law', text: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.' },
];

const TermsPage: React.FC = () => {
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
      <section className="relative bg-[hsl(var(--sf-brown))] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, hsl(var(--sf-gold) / 0.06) 0%, transparent 70%)' }}
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

          {['TERMS &', 'CONDITIONS.'].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                className="block font-black text-background uppercase m-0"
                style={{ fontSize: 'clamp(36px, 5.5vw, 80px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 + i * 0.14, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.h1>
            </div>
          ))}

          <motion.p
            className="mt-5 text-background/50 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            Last updated: March 2025
          </motion.p>
        </div>

        <div className="leading-[0]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: 'clamp(50px, 6vw, 80px)' }}>
            <rect width="1000" height="100" fill="#faf8f5" />
            <path d="M1000 100C500 100 500 64 0 64V0h1000v100Z" fill="#1c1917" opacity=".15" />
            <path d="M1000 100C500 100 500 34 0 34V0h1000v100Z" fill="#1c1917" opacity=".35" />
            <path d="M1000 100C500 100 500 4 0 4V0h1000v100Z" fill="#1c1917" />
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

export default TermsPage;
