import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef } from 'react';
import AboutImage from '@/assets/about.jpeg'
gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '25+', label: 'Years of Heritage' },
  { value: '100%', label: 'Natural Ingredients' },
  { value: '50+', label: 'Flavour Varieties' },
  { value: '10K+', label: 'Happy Families' },
];

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from(imageRef.current, {
        x: -60,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
      });
      gsap.from(stripeRef.current, {
        scaleX: 0,
        duration: 0.9,
        ease: 'power3.inOut',
        transformOrigin: 'left center',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
      });
      if (headlineRef.current) {
        gsap.from(Array.from(headlineRef.current.children), {
          y: 50,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: headlineRef.current, start: 'top 78%' },
        });
      }
      if (statsRef.current) {
        gsap.from(Array.from(statsRef.current.children), {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
        });
      }
      if (bodyRef.current) {
        gsap.from(Array.from(bodyRef.current.children), {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: bodyRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section data-header-bg="cream" ref={sectionRef} className="relative overflow-hidden bg-[hsl(var(--sf-red))] -mt-px">
      <div className="max-w-[1500px] mx-auto px-6 md:px-16 pt-16 pb-20 md:pt-20 md:pb-28">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-16 items-start">

          <div ref={imageRef} className="relative mb-4 md:mb-0">
            <div
              className="absolute -top-6 -left-6 font-black uppercase leading-none select-none pointer-events-none z-0 text-[hsl(var(--sf-gold)/0.06)]"
              style={{ fontSize: 'clamp(80px, 12vw, 160px)', letterSpacing: '-0.04em', lineHeight: 0.85 }}
            >
              1995
            </div>

            <div className="relative z-10 overflow-hidden rounded-tl-sm rounded-tr-3xl rounded-bl-3xl rounded-br-sm aspect-[4/5]">
              <img src={AboutImage} alt="" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, hsl(var(--sf-brown)/0.5) 0%, transparent 50%)' }} />
              <div className="absolute bottom-6 left-6 px-5 py-2.5 bg-[hsl(var(--sf-red))] rounded-[4px]">
                <p className="font-black uppercase text-white text-[11px] tracking-[0.18em]">Est. 1995 — Mumbai, India</p>
              </div>
            </div>

            <div
              className="absolute -bottom-5 -right-5 md:-bottom-8 md:-right-8 z-20 flex items-center justify-center rounded-full bg-[hsl(var(--sf-gold))] border-4 border-[hsl(var(--sf-brown))]"
              style={{ width: 'clamp(80px, 10vw, 120px)', height: 'clamp(80px, 10vw, 120px)' }}
            >
              <div className="text-center">
                <p className="font-black text-[hsl(var(--sf-brown))] leading-none" style={{ fontSize: 'clamp(20px, 2.5vw, 32px)' }}>25+</p>
                <p className="font-bold text-[hsl(var(--sf-brown))] uppercase leading-tight" style={{ fontSize: 'clamp(7px, 0.8vw, 10px)', letterSpacing: '0.1em' }}>
                  Yrs of<br />Heritage
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-7">
            <div ref={headlineRef}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-[hsl(var(--sf-gold))]" />
                <span className="font-black uppercase text-[11px] tracking-[0.22em] text-[hsl(var(--sf-gold))]">
                  Our Story
                </span>
              </div>
              <h2
                className=" font-black text-white leading-[0.92] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}
              >
                Crafted with Love.{' '}
                <span className="text-[hsl(var(--sf-gold))]">Savoured</span>
                <br />
                with Pride.
              </h2>
            </div>

            <div ref={bodyRef} className="flex flex-col gap-4">
              <p
                className="leading-relaxed text-[hsl(var(--sf-cream)/0.75)] max-w-[520px]"
                style={{ fontSize: 'clamp(14px, 1.2vw, 17px)' }}
              >
                For over 25 years, our family has been preserving the art of authentic Indian mukhwas.
                From hand-selected fennel seeds to premium cardamom pods, every ingredient is chosen
                for its purity and flavour.
              </p>
            </div>

            <div
              ref={statsRef}
              className="grid grid-cols-2 rounded-xl overflow-hidden border border-[hsl(var(--sf-gold)/0.12)]"
              style={{ gap: '1px', background: 'hsl(var(--sf-gold)/0.12)' }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 bg-[hsl(var(--sf-brown))] p-5 md:p-7"
                >
                  <span
                    className=" font-black text-[hsl(var(--sf-gold))] leading-none tracking-[-0.02em]"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 48px)' }}
                  >
                    {stat.value}
                  </span>
                  <span className="font-bold uppercase text-[10px] tracking-[0.14em] text-[hsl(var(--sf-cream)/0.5)]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-[hsl(var(--sf-red)/0.12)] border border-[hsl(var(--sf-red)/0.2)]">
              <div className="w-9 h-9 rounded-full bg-[hsl(var(--sf-red))] flex items-center justify-center shrink-0 text-base">
                🤝
              </div>
              <p className="text-[13px] text-[hsl(var(--sf-cream)/0.7)] leading-relaxed m-0">
                <span className="font-black text-[hsl(var(--sf-cream))] block mb-0.5">
                  Family-Owned Since 1995
                </span>
                Every batch is made with the same love and care as the very first one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};