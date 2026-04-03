import React, { useRef, useEffect } from 'react';
import { ArrowUpRight, Leaf, Sparkles, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import productImg from '@/assets/products/hero-product.png';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '0', unit: 'Artificial', label: 'Colours' },
  { value: '100%', unit: 'Real', label: 'Spices Used' },
];

const featureCards = [
  {
    title: 'PURE FENNEL SEEDS',
    subtitle: 'Naturally sweet, refreshing, and great for digestion.',
    link: 'Test Purity',
    className: 'bg-[hsl(var(--sf-gold))] text-[hsl(var(--sf-brown))]',
    linkClass: 'text-[hsl(var(--sf-brown))]',
  },
  {
    title: 'HAND-PICKED CARDAMOM',
    subtitle: 'Sustainably harvested from Kerala — aromatic and authentic.',
    link: 'Explore',
    className: 'bg-[hsl(var(--sf-red))] text-white',
    linkClass: 'text-white',
    featured: true,
  },
  {
    title: 'REAL SILVER COATING',
    subtitle: 'Traditional finishing touch. No synthetic colours or coatings.',
    link: 'Check Out',
    className: 'bg-[hsl(var(--sf-cream))] text-[hsl(var(--sf-brown))] border border-[hsl(var(--sf-gold)/0.4)]',
    linkClass: 'text-[hsl(var(--sf-brown))]',
  },
];

const ingredientList = [
  { icon: Leaf, name: 'ORGANIC FENNEL SEEDS', desc: 'Naturally sweet, hand-selected from Gujarat farms' },
  { icon: Sparkles, name: 'PREMIUM CARDAMOM', desc: 'Aromatic green pods, sourced directly from Kerala' },
  { icon: Star, name: 'PURE SUGAR COATING', desc: 'Simply made, no artificial sweeteners or colours' },
];

export const IngredientsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          delay: i * 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
        });
      });
      gsap.from(imgRef.current, {
        scale: 0.88,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: imgRef.current, start: 'top 82%' },
      });
      if (listRef.current) {
        gsap.from(Array.from(listRef.current.children), {
          x: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: listRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section data-header-bg="cream" ref={sectionRef} className="relative bg-[hsl(var(--sf-cream))] pt-24 pb-0 md:pt-32 overflow-hidden -mt-px">
      <div className="max-w-[1500px] mx-auto px-6 md:px-16">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="w-10 h-px bg-[hsl(var(--sf-gold))] mb-4" />
            <h2
              className="font-black text-[hsl(var(--sf-brown))] uppercase leading-none tracking-tight"
              style={{ fontSize: 'clamp(30px, 4vw, 58px)' }}
            >
              Clean Ingredients.<br />
              <span className="text-[hsl(var(--sf-red))]">Deep Flavour.</span>
            </h2>
          </div>
          <div className="flex items-center gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 px-6 py-3 rounded-xl border border-[hsl(var(--sf-gold)/0.3)] bg-[hsl(var(--sf-gold)/0.06)]">
                <span
                  className="font-black text-[hsl(var(--sf-brown))] leading-none"
                  style={{ fontSize: 'clamp(20px, 2vw, 28px)' }}
                >
                  {s.value}
                </span>
                <span className="text-[10px] font-bold text-[hsl(var(--sf-brown-mid))] uppercase tracking-[0.1em] text-center">
                  {s.unit}<br />{s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {featureCards.map((card, i) => (
            <div
              key={card.title}
              ref={el => { cardsRef.current[i] = el; }}
              className={`relative rounded-2xl p-7 flex flex-col justify-between gap-4 ${card.className} ${card.featured ? 'md:row-span-1' : ''}`}
              style={{ minHeight: '180px' }}
            >
              {card.featured && (
                <div
                  className="absolute right-5 bottom-5 w-20 h-20 opacity-20 rounded-full"
                  style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
                />
              )}
              <div>
                <h3
                  className="font-black uppercase leading-tight mb-2"
                  style={{ fontSize: 'clamp(15px, 1.4vw, 19px)', letterSpacing: '0.04em' }}
                >
                  {card.title}
                </h3>
                <p className="text-[13px] opacity-75 leading-relaxed">{card.subtitle}</p>
              </div>
              <a
                href="/store"
                className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] ${card.linkClass} hover:gap-3 transition-all duration-200`}
              >
                {card.link}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center py-10 md:py-16">

          <div ref={imgRef} className="flex items-center justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--sf-gold) / 0.2) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  transform: 'scale(1.2)',
                }}
              />
              <img
                src={productImg}
                alt="Our ingredients"
                className="relative z-10 object-contain"
                style={{
                  width: 'clamp(220px, 28vw, 380px)',
                  height: 'clamp(260px, 34vw, 460px)',
                  filter: 'drop-shadow(0 20px 48px hsl(var(--sf-brown) / 0.2))',
                }}
              />
              <div
                className="absolute bottom-4 right-0 z-20 px-4 py-2 rounded-full bg-[hsl(var(--sf-gold))] text-[hsl(var(--sf-brown))] text-[10px] font-black uppercase tracking-[0.12em] shadow-lg"
              >
                Original Recipe
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="mb-4">
              <h3
                className="font-black text-[hsl(var(--sf-brown))] uppercase leading-tight tracking-tight"
                style={{ fontSize: 'clamp(20px, 2.5vw, 34px)' }}
              >
                A Promise to Use Real,<br />
                <span className="text-[hsl(var(--sf-red))]">Carefully Selected</span> Ingredients —<br />
                Elevated Through Thoughtful Craft
              </h3>
            </div>

            <div ref={listRef} className="flex flex-col gap-4">
              {ingredientList.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[hsl(var(--sf-gold)/0.2)] hover:border-[hsl(var(--sf-gold)/0.5)] transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--sf-gold)/0.12)] flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-[hsl(var(--sf-gold))]" />
                    </div>
                    <div>
                      <p className="font-black text-[hsl(var(--sf-brown))] text-[12px] uppercase tracking-[0.1em] mb-0.5">
                        {item.name}
                      </p>
                      <p className="text-[13px] text-[hsl(var(--sf-brown-mid))] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <a
              href="/store"
              className="inline-flex items-center gap-2 mt-2 self-start px-7 py-3.5 rounded-full bg-[hsl(var(--sf-red))] text-white text-[12px] font-black uppercase tracking-[0.1em] hover:bg-[hsl(var(--sf-brown))] transition-colors duration-200"
            >
              Explore Ingredients
              <ArrowUpRight className="w-4 h-4" />
            </a>
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
          <rect width="1000" height="100" fill="hsl(0 72% 40%)" />
          <path d="M1000 100C500 100 500 64 0 64V0h1000v100Z" fill="#faf8f5" opacity=".15" />
          <path d="M1000 100C500 100 500 34 0 34V0h1000v100Z" fill="#faf8f5" opacity=".35" />
          <path d="M1000 100C500 100 500 4 0 4V0h1000v100Z" fill="#faf8f5" />
        </svg>
      </div>
    </section>
  );
};