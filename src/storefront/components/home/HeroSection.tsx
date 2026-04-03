import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import hero1 from '@/assets/products/hero-product.png';
import hero2 from '@/assets/products/product-saunf.png';
import hero3 from '@/assets/products/product-pan.png';

const stats = [
  { value: '25+', label: 'Years of Heritage' },
  { value: '50+', label: 'Flavour Varieties' },
  { value: '10K+', label: 'Happy Customers' },
];

const coreProducts = [
  { src: hero1, label: 'Pan Mix' },
  { src: hero2, label: 'Meetha Saunf' },
  { src: hero3, label: 'Elaichi Mix' },
];

const desktopBadges = [
  {
    label: '100% Natural',
    className: 'bg-[hsl(var(--sf-gold))] text-[hsl(var(--sf-brown))]',
    style: { top: '18%', left: '4%', transform: 'rotate(-7deg)' },
  },
  {
    label: 'Handcrafted',
    className: 'bg-green-600 text-white',
    style: { top: '22%', right: '2%', transform: 'rotate(5deg)' },
  },
  {
    label: 'Made in India',
    className: 'bg-[hsl(var(--sf-cream))] text-[hsl(var(--sf-brown))] border border-[hsl(var(--sf-gold)/0.6)]',
    style: { bottom: '36%', left: '2%', transform: 'rotate(-3deg)' },
  },
  {
    label: 'Since 1995',
    className: 'bg-[hsl(var(--sf-red))] text-white',
    style: { bottom: '32%', right: '1%', transform: 'rotate(6deg)' },
  },
];

const titleLines = ['TASTE THE', 'TRADITION.'];

export const HeroSection: React.FC = () => {
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const productRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      badgeRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: i % 2 === 0 ? -10 : 10,
          duration: 2 + i * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
      if (productRef.current) {
        gsap.to(productRef.current, {
          y: -16,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.2,
          opacity: 0.4,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <section data-header-bg="cream" className="relative flex flex-col bg-[hsl(var(--sf-cream))]" style={{ minHeight: '94vh' }}>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 65% 50%, hsl(var(--sf-red) / 0.06) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 40% 40% at 10% 80%, hsl(var(--sf-gold) / 0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex-1 flex flex-col max-w-[1500px] mx-auto w-full px-8 md:px-16">

        <div className="hidden md:flex flex-1 w-full items-center" style={{ minHeight: '88vh' }}>

          <div className="flex flex-col justify-center gap-6 w-1/2 pr-8 py-20">

            <div className="flex flex-col" style={{ gap: '2px' }}>
              {titleLines.map((line, i) => (
                <div key={line} className="overflow-hidden">
                  <motion.h1
                    className="block font-black text-[hsl(var(--sf-red))] uppercase m-0"
                    style={{ fontSize: 'clamp(52px, 6.5vw, 100px)', lineHeight: 1, letterSpacing: '-0.02em' }}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.18 + i * 0.14, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line}
                  </motion.h1>
                </div>
              ))}
            </div>

            <motion.p
              className="m-0 text-[hsl(var(--sf-brown-mid))] leading-relaxed max-w-[380px]"
              style={{ fontSize: 'clamp(15px, 1.3vw, 18px)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.6 }}
            >
              Premium mukhwas crafted from the finest natural spices —{' '}
              <em className="font-semibold not-italic text-[hsl(var(--sf-brown))]">
                a celebration
              </em>{' '}
              in every bite.
            </motion.p>

            <motion.div
              className="flex items-center gap-3.5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68, duration: 0.55 }}
            >
              <Link
                to="/store"
                className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.1em] rounded-full px-8 py-[15px] bg-[hsl(var(--sf-red))] text-white transition-colors duration-200 hover:bg-[hsl(var(--sf-brown))]"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/store"
                className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] rounded-full px-7 py-3 border-2 border-[hsl(var(--sf-brown)/0.25)] text-[hsl(var(--sf-brown))] transition-colors duration-200 hover:border-[hsl(var(--sf-red))] hover:text-[hsl(var(--sf-red))]"
              >
                Explore Flavours
              </Link>
            </motion.div>

            <motion.div
              className="flex items-center gap-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.84, duration: 0.5 }}
            >
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span
                    className="font-black text-[hsl(var(--sf-red))] leading-none"
                    style={{ fontSize: 'clamp(22px, 2.2vw, 32px)' }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[11px] font-semibold text-[hsl(var(--sf-brown-mid))] uppercase tracking-[0.08em]">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.96, duration: 0.5 }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[hsl(var(--sf-brown-mid))] opacity-60 mb-2.5">
                Our Core Products
              </p>
              <div className="flex items-center gap-4">
                {coreProducts.map((p) => (
                  <Link key={p.label} to="/store" className="flex flex-col items-center gap-1.5 no-underline">
                    <div className="w-12 h-12 rounded-full border-2 border-[hsl(var(--sf-gold)/0.4)] overflow-hidden bg-white transition-[border-color] duration-200 hover:border-[hsl(var(--sf-gold))]">
                      <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-semibold text-[hsl(var(--sf-brown-mid))] text-center max-w-[44px] leading-snug">
                      {p.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center w-1/2" style={{ minHeight: '88vh' }}>

            <div
              ref={glowRef}
              className="absolute rounded-full opacity-30 pointer-events-none"
              style={{
                width: 'clamp(300px, 36vw, 520px)',
                height: 'clamp(300px, 36vw, 520px)',
                background: 'radial-gradient(circle, hsl(var(--sf-gold) / 0.3) 0%, hsl(var(--sf-red) / 0.2) 50%, transparent 75%)',
                filter: 'blur(48px)',
              }}
            />

            {desktopBadges.map((badge, i) => (
              <div
                key={badge.label}
                ref={el => { badgeRefs.current[i] = el; }}
                className={`absolute px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap z-20 ${badge.className}`}
                style={badge.style}
              >
                {badge.label}
              </div>
            ))}

            <motion.img
              ref={productRef}
              src={hero1}
              alt="Premium Indian Mukhwas"
              loading="eager"
              className="relative z-10 object-contain"
              style={{
                width: 'clamp(300px, 38vw, 560px)',
                height: 'clamp(360px, 46vw, 660px)',
                marginBottom: '-48px',
                filter: 'drop-shadow(0 32px 64px hsl(var(--sf-red) / 0.15)) drop-shadow(0 8px 24px hsl(var(--sf-brown) / 0.2))',
              }}
              initial={{ opacity: 0, scale: 0.82, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div className="md:hidden flex flex-col items-center pt-8 pb-0 gap-5">

          <motion.span
            className="inline-flex items-center gap-2 bg-[hsl(var(--sf-gold))] text-[hsl(var(--sf-brown))] text-[10px] font-black uppercase tracking-[0.18em] px-4 py-1.5 rounded-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Sparkles className="w-3 h-3" />
            India's Finest Mukhwas
          </motion.span>

          <div className="text-center" style={{ lineHeight: 1 }}>
            {titleLines.map((line, i) => (
              <div key={line} className="overflow-hidden">
                <motion.h1
                  className="block m-0 font-black text-[hsl(var(--sf-red))] leading-[0.92] tracking-tight"
                  style={{ fontSize: 'clamp(46px, 13vw, 68px)' }}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.16 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          <motion.p
            className="text-sm text-[hsl(var(--sf-brown-mid))] leading-relaxed text-center max-w-[290px] m-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48, duration: 0.5 }}
          >
            Premium mukhwas from the finest natural spices — a celebration in every bite.
          </motion.p>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.5 }}
          >
            <Link
              to="/store"
              className="inline-flex items-center gap-1.5 bg-[hsl(var(--sf-red))] text-white rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.1em] no-underline"
            >
              Shop Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/store"
              className="inline-flex rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] border-2 border-[hsl(var(--sf-brown)/0.25)] text-[hsl(var(--sf-brown))] no-underline"
            >
              Explore
            </Link>
          </motion.div>

          <motion.div
            className="relative w-full flex justify-center -mb-11"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute top-2.5 left-4 bg-[hsl(var(--sf-gold))] text-[hsl(var(--sf-brown))] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] z-20 -rotate-6">
              100% Natural
            </div>
            <div className="absolute top-2.5 right-4 bg-[hsl(var(--sf-red))] text-white px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] z-20 rotate-6">
              Since 1995
            </div>
            <div
              className="absolute inset-[10%] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, hsl(var(--sf-gold) / 0.25), hsl(var(--sf-red) / 0.15) 60%, transparent 80%)',
                filter: 'blur(28px)',
              }}
            />
            <img
              src={hero1}
              alt="Premium Mukhwas"
              loading="eager"
              className="relative z-10 object-contain"
              style={{
                width: 'clamp(200px, 62vw, 320px)',
                height: 'clamp(240px, 74vw, 390px)',
                filter: 'drop-shadow(0 20px 40px hsl(var(--sf-red) / 0.18))',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* <div className="relative z-20 leading-[0] mt-auto">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100">
          <g fill="#47291a">
            <path d="M0 1v99c134.3 0 153.7-99 296-99H0Z" opacity=".5" />
            <path d="M1000 4v86C833.3 90 833.3 3.6 666.7 3.6S500 90 333.3 90 166.7 4 0 4h1000Z" opacity=".5" />
            <path d="M617 1v86C372 119 384 1 196 1h421Z" opacity=".5" />
            <path d="M1000 0H0v52C62.5 28 125 4 250 4c250 0 250 96 500 96 125 0 187.5-24 250-48V0Z" />
          </g>
        </svg>
      </div> */}

      <div className="relative z-20 leading-[0] mt-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(60px, 8vw, 100px)' }}
        >
          <rect width="1000" height="100" fill="hsl(0 72% 40%)" />
          <path d="M1000 100C500 100 500 64 0 64V0h1000v100Z" fill="#faf8f5" opacity=".15" />
          <path d="M1000 100C500 100 500 34 0 34V0h1000v100Z" fill="#faf8f5" opacity=".35" />
          <path d="M1000 100C500 100 500 4 0 4V0h1000v100Z" fill="#faf8f5" />
        </svg>
      </div>
    </section>
  );
};