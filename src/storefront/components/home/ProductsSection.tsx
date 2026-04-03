import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { useStorefrontProducts } from '@/storefront/hooks/useStorefrontProducts';
import ProductCard from '../shared/ProductCard';

gsap.registerPlugin(ScrollTrigger);


const tickerItems = [
  '100% Natural', 'Handcrafted', 'No Preservatives', 'Made in India',
  'Pure Spices', 'Since 1995', 'Premium Quality', 'Authentic Flavours',
];

export const ProductsSection: React.FC = () => {
  const { products } = useStorefrontProducts();
  const [offset, setOffset] = useState(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const maxOffset = Math.max(0, products.length - 4);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.from(card, {
        y: 60,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%' },
        delay: i * 0.12,
      });
    });
  }, []);

  return (
    <section data-header-bg="cream" className="relative bg-[hsl(var(--sf-cream))] pt-24 pb-0 md:pt-32 overflow-hidden">

      <div className="max-w-[1500px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="w-10 h-0.5 bg-[hsl(var(--sf-gold))] mb-4" />
            <h2
              className="font-black text-[hsl(var(--sf-brown))] leading-none tracking-tight uppercase"
              style={{ fontSize: 'clamp(32px, 4.5vw, 60px)', }}
            >
              Find Your Flavour
            </h2>
            <p className="text-[hsl(var(--sf-brown-mid))] mt-2 text-sm md:text-base font-medium">
              Classic Indian favourites, crafted with pure ingredients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/store"
              className="hidden md:inline-flex items-center gap-1.5 text-[hsl(var(--sf-red))] text-sm font-bold uppercase tracking-[0.1em] hover:gap-3 transition-all duration-200"
            >
              View All <span>→</span>
            </a>
            <button
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="w-11 h-11 rounded-full border-2 border-[hsl(var(--sf-brown)/0.3)] flex items-center justify-center text-[hsl(var(--sf-brown))] transition-all duration-200 hover:border-[hsl(var(--sf-red))] hover:text-[hsl(var(--sf-red))] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next"
              className="w-11 h-11 rounded-full border-2 border-[hsl(var(--sf-brown)/0.3)] flex items-center justify-center text-[hsl(var(--sf-brown))] transition-all duration-200 hover:border-[hsl(var(--sf-red))] hover:text-[hsl(var(--sf-red))] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto overflow-y-hidden px-2 pb-4 scroll-smooth no-scrollbar"
          >
            {products.map((product, i) => (
              <div
                key={i}
                className="min-w-[305px] sm:min-w-[320px] md:min-w-[360px] flex-shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Scrolling ticker */}
      <div className="bg-[hsl(var(--sf-brown))] py-3.5 mt-4">
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: 'ticker 22s linear infinite',
          }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 text-[hsl(var(--sf-gold))] text-xs font-black uppercase tracking-[0.2em] px-8"
            >
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sf-gold)/0.5)] inline-block" />
            </span>
          ))}
        </div>
      </div>
      <div className="leading-[0]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(50px, 6vw, 80px)' }}
        >
          <rect width="1000" height="100" fill="#1c1917" />
          <path d="M1000 0C500 0 500 36 0 36V100h1000V0Z" fill="#faf8f5" opacity=".4" />
          <path d="M1000 0C500 0 500 66 0 66V100h1000V0Z" fill="#faf8f5" opacity=".4" />
          <path d="M1000 0C500 0 500 96 0 96V100h1000V0Z" fill="#faf8f5" />
        </svg>
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};