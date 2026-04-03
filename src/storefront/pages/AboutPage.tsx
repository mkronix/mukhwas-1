import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const story = [
  {
    title: 'The Beginning',
    body: 'In 1995, in the bustling lanes of Mumbai, a small family workshop began crafting mukhwas the traditional way — hand-roasting spices, blending recipes passed down through generations, and packaging each batch with pride. What started as a neighbourhood favourite quickly became a city-wide sensation.',
  },
  {
    title: 'Our Mission',
    body: 'We believe every meal deserves a perfect ending. Our mission is to bring the authentic taste of handcrafted Indian mukhwas to every home — using only 100% natural ingredients, no artificial colours, and time-honoured recipes that honour our heritage.',
  },
  {
    title: 'Our Process',
    body: 'Every blend is crafted in small batches. We source the finest fennel from Gujarat, cardamom from Kerala, and saffron from Kashmir. Each ingredient is hand-selected, slow-roasted, and blended to perfection. No shortcuts, no compromises — just pure, authentic flavour.',
  },
];

const stats = [
  { value: '25+', label: 'Years of Heritage' },
  { value: '100%', label: 'Natural Ingredients' },
  { value: '50+', label: 'Flavour Varieties' },
  { value: '10K+', label: 'Happy Families' },
];

const values = [
  { emoji: '🌿', title: 'Pure & Natural', text: 'No artificial colours, flavours, or preservatives. Ever.' },
  { emoji: '🤲', title: 'Handcrafted', text: 'Small-batch production. Every blend made with human touch.' },
  { emoji: '🇮🇳', title: 'Made in India', text: 'Sourced and crafted entirely in India, from farm to jar.' },
  { emoji: '💛', title: 'Family Legacy', text: 'Three generations of flavour expertise, one family passion.' },
];

const AboutPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      // Story blocks
      if (storyRef.current) {
        gsap.from(Array.from(storyRef.current.children), {
          y: 60,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.18,
          scrollTrigger: { trigger: storyRef.current, start: 'top 78%' },
        });
      }
      // Stats
      if (statsRef.current) {
        gsap.from(Array.from(statsRef.current.children), {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
        });
      }
      // Values
      if (valuesRef.current) {
        gsap.from(Array.from(valuesRef.current.children), {
          y: 50,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: valuesRef.current, start: 'top 80%' },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-[hsl(var(--sf-cream))]">
      {/* Hero */}
      <section ref={heroRef} className="relative bg-[hsl(var(--sf-red))] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 40%, hsl(var(--sf-gold) / 0.1) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="max-w-[1500px] mx-auto px-6 md:px-16 py-24 md:py-36 text-center relative z-10">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-px w-10 bg-[hsl(var(--sf-gold))]" />
            <span className="sf-label">Our Story</span>
            <div className="h-px w-10 bg-[hsl(var(--sf-gold))]" />
          </motion.div>

          <div style={{ lineHeight: 1 }}>
            {['CRAFTED WITH', 'LOVE & PRIDE.'].map((line, i) => (
              <div key={line} className="overflow-hidden">
                <motion.h1
                  className="block font-black text-white uppercase m-0"
                  style={{ fontSize: 'clamp(40px, 6vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 + i * 0.14, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          <motion.p
            className="mt-6 text-white/70 max-w-lg mx-auto leading-relaxed"
            style={{ fontSize: 'clamp(14px, 1.3vw, 18px)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            A legacy of flavour, crafted with love since 1995. Three generations of passion in every bite.
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

      {/* Story */}
      <section className="bg-[hsl(var(--sf-cream))]">
        <div className="max-w-[900px] mx-auto px-6 md:px-16 py-20 md:py-28">
          <div ref={storyRef} className="flex flex-col gap-14">
            {story.map((s, i) => (
              <div key={s.title} className="relative text-[hsl(var(--sf-brown))]">
                <div
                  className="absolute -top-2 -left-4 font-black uppercase leading-none select-none pointer-events-none text-[hsl(var(--sf-gold))]"
                  style={{ fontSize: 'clamp(60px, 8vw, 100px)', letterSpacing: '-0.04em' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative z-10">
                  <div className="sf-gold-line mb-4" />
                  <h2
                    className="font-black uppercase tracking-tight mb-4"
                    style={{ fontSize: 'clamp(24px, 3vw, 40px)' }}
                  >
                    {s.title}
                  </h2>
                  <p className="sf-body-text max-w-[640px] text-" style={{ fontSize: 'clamp(14px, 1.2vw, 17px)' }}>
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[hsl(var(--sf-brown))]">
        <div className="max-w-[1500px] mx-auto px-6 md:px-16 py-16 md:py-20">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-black text-[hsl(var(--sf-gold))] leading-none" style={{ fontSize: 'clamp(36px, 4vw, 60px)' }}>
                  {s.value}
                </p>
                <p className="font-bold uppercase text-[10px] tracking-[0.14em] text-[hsl(var(--sf-cream)/0.5)] mt-2">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[hsl(var(--sf-cream))]">
        <div className="max-w-[1500px] mx-auto px-6 md:px-16 py-20 md:py-28">
          <div className="text-center mb-14">
            <div className="sf-gold-line mx-auto mb-4" />
            <h2 className="text-[hsl(var(--sf-brown))] font-black uppercase" style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}>
              What We Stand For
            </h2>
          </div>
          <div ref={valuesRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-[hsl(var(--sf-cream))] rounded-2xl p-8 border border-[hsl(var(--sf-gold)/0.12)] hover:border-[hsl(var(--sf-gold)/0.3)] transition-colors duration-300"
              >
                <div className="text-3xl mb-4">{v.emoji}</div>
                <h3 className="font-black uppercase text-[hsl(var(--sf-brown))] text-sm tracking-[0.08em] mb-2">{v.title}</h3>
                <p className="text-[hsl(var(--sf-brown-mid))] text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
