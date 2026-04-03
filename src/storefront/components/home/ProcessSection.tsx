import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import img1 from '@/assets/process/1.jpeg';
import img2 from '@/assets/process/2.jpeg';
import img3 from '@/assets/process/3.jpeg';
import img4 from '@/assets/process/4.jpeg';
import img5 from '@/assets/process/5.jpeg';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { img: img1, label: 'SOURCING SPICES', rotate: '-4deg', offsetY: '32px' },
  { img: img2, label: 'HAND CLEANING', rotate: '3deg', offsetY: '0px' },
  { img: img3, label: 'SLOW ROASTING', rotate: '-2deg', offsetY: '48px' },
  { img: img4, label: 'SUGAR COATING', rotate: '5deg', offsetY: '16px' },
  { img: img5, label: 'FINAL BLEND', rotate: '-3deg', offsetY: '40px' },
];

export const ProcessSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const maxIndex = steps.length - 1;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      data-header-bg="cream"
      ref={sectionRef}
      className="relative overflow-hidden bg-[hsl(var(--sf-red))] pt-24 pb-0 md:pt-32 -mt-px"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-1/2 h-full opacity-[0.04]"
        style={{ background: 'radial-gradient(ellipse at top right, hsl(var(--sf-gold)), transparent 65%)' }}
      />

      <div className="max-w-[1500px] mx-auto px-6 md:px-16">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <div className="w-10 h-px bg-[hsl(var(--sf-gold))] mb-4" />
            <h2
              className="font-black text-white uppercase leading-none tracking-tight"
              style={{ fontSize: 'clamp(32px, 4.5vw, 62px)' }}
            >
              How We Make<br />
              <span className="text-[hsl(var(--sf-gold))]">Our Mukhwas</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <p
              className="text-white/60 max-w-[340px] leading-relaxed md:text-right"
              style={{ fontSize: 'clamp(13px, 1.1vw, 16px)' }}
            >
              Every batch is crafted by hand — sourced, cleaned, roasted, and blended
              with generations of expertise.
            </p>
            <div className="hidden md:flex items-center gap-3 mt-2">
              <button
                onClick={() => setActive(Math.max(0, active - 1))}
                disabled={active === 0}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border-2 border-white/25 flex items-center justify-center text-white transition-all duration-200 hover:border-[hsl(var(--sf-gold))] hover:text-[hsl(var(--sf-gold))] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActive(Math.min(maxIndex, active + 1))}
                disabled={active >= maxIndex}
                aria-label="Next"
                className="w-10 h-10 rounded-full border-2 border-white/25 flex items-center justify-center text-white transition-all duration-200 hover:border-[hsl(var(--sf-gold))] hover:text-[hsl(var(--sf-gold))] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-end justify-center gap-6 pb-16" style={{ minHeight: '420px' }}>
          {steps.map((step, i) => (
            <div
              key={step.label}
              ref={el => { cardsRef.current[i] = el; }}
              className="shrink-0 cursor-pointer group"
              style={{
                transform: `rotate(${step.rotate}) translateY(${step.offsetY})`,
                width: 'clamp(180px, 16vw, 240px)',
              }}
              onMouseEnter={e => {
                gsap.to(e.currentTarget, { y: -16, scale: 1.04, duration: 0.3, ease: 'power2.out' });
              }}
              onMouseLeave={e => {
                gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.4, ease: 'power2.inOut' });
              }}
            >
              <div className="bg-white p-3 pb-12 shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative">
                <div className="overflow-hidden aspect-[4/5] bg-[hsl(var(--sf-cream))]">
                  <img
                    src={step.img}
                    alt={step.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-2">
                  <p
                    className="font-black uppercase text-[hsl(var(--sf-brown))] text-center leading-tight"
                    style={{ fontSize: 'clamp(10px, 0.9vw, 13px)', letterSpacing: '0.08em' }}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
              <div
                className="h-1 mt-1 mx-auto rounded-full opacity-60"
                style={{ width: '40%', background: 'hsl(var(--sf-gold))' }}
              />
            </div>
          ))}
        </div>

        <div className="md:hidden overflow-hidden pb-12">
          <div
            className="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${active * (72)}vw)` }}
          >
            {steps.map((step, i) => (
              <div
                key={step.label}
                className="shrink-0"
                style={{
                  width: '72vw',
                  transform: `rotate(${i % 2 === 0 ? '-3deg' : '3deg'}) translateY(${i % 2 === 0 ? '12px' : '0px'})`,
                }}
              >
                <div className="bg-white p-3 pb-12 shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative">
                  <div className="overflow-hidden aspect-[4/5] bg-[hsl(var(--sf-cream))]">
                    <img
                      src={step.img}
                      alt={step.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-2">
                    <p className="font-black uppercase text-[hsl(var(--sf-brown))] text-center text-[11px] tracking-[0.08em] leading-tight">
                      {step.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              aria-label="Previous"
              className="w-10 h-10 rounded-full border-2 border-white/25 flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-200 ${i === active ? 'w-6 h-2 bg-[hsl(var(--sf-gold))]' : 'w-2 h-2 bg-white/20'}`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActive(Math.min(maxIndex, active + 1))}
              disabled={active >= maxIndex}
              aria-label="Next"
              className="w-10 h-10 rounded-full border-2 border-white/25 flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="leading-[0]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(60px, 8vw, 100px)' }}
        >
          <rect width="1000" height="100" fill="#faf8f5" />
          <path d="M0 100C500 100 500 64 1000 64V0H0v100Z" fill="hsl(0 72% 40%)" opacity=".15" />
          <path d="M0 100C500 100 500 34 1000 34V0H0v100Z" fill="hsl(0 72% 40%)" opacity=".35" />
          <path d="M0 100C500 100 500 4 1000 4V0H0v100Z" fill="hsl(0 72% 40%)" />
        </svg>
      </div>
    </section>
  );
};