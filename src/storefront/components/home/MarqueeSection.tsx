import React from 'react';
import product1 from '@/assets/products/hero-product.png';
import product2 from '@/assets/products/product-saunf.png';
import product3 from '@/assets/products/product-pan.png';

const row1Items = [
  { type: 'text', content: 'MEETHA SAUNF' },
  { type: 'image', src: product1 },
  { type: 'text', content: 'HANDCRAFTED' },
  { type: 'image', src: product2 },
  { type: 'text', content: 'PAN MUKHWAS' },
  { type: 'image', src: product3 },
  { type: 'text', content: 'PREMIUM QUALITY' },
  { type: 'image', src: product1 },
  { type: 'text', content: 'ELAICHI MIX' },
  { type: 'image', src: product2 },
  { type: 'text', content: '100% NATURAL' },
  { type: 'image', src: product3 },
] as const;

const row2Items = [
  { type: 'text', content: 'MADE IN INDIA' },
  { type: 'image', src: product2 },
  { type: 'text', content: 'SINCE 1995' },
  { type: 'image', src: product3 },
  { type: 'text', content: 'FESTIVE FAVOURITES' },
  { type: 'image', src: product1 },
  { type: 'text', content: 'AROMATIC BLEND' },
  { type: 'image', src: product2 },
  { type: 'text', content: 'TRADITIONAL RECIPE' },
  { type: 'image', src: product3 },
  { type: 'text', content: 'FRESH & PURE' },
  { type: 'image', src: product1 },
] as const;

type Item = { type: 'text'; content: string } | { type: 'image'; src: string };

const MarqueeRow: React.FC<{ items: readonly Item[]; reverse?: boolean; speed: string }> = ({
  items,
  reverse = false,
  speed,
}) => {
  const tripled = [...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden w-full">
      <div
        className="flex items-center shrink-0"
        style={{
          animation: `${reverse ? 'mq-rev' : 'mq-fwd'} ${speed} linear infinite`,
          willChange: 'transform',
        }}
      >
        {tripled.map((item, i) =>
          item.type === 'text' ? (
            <span
              key={i}
              className="shrink-0 inline-flex items-center font-black uppercase text-[hsl(var(--sf-gold))] whitespace-nowrap px-5"
              style={{ fontSize: 'clamp(13px, 1.4vw, 18px)', letterSpacing: '0.12em' }}
            >
              {item.content}
              <span className="ml-5 text-[hsl(var(--sf-gold)/0.4)] text-[10px]">✦</span>
            </span>
          ) : (
            <div
              key={i}
              className="shrink-0 mx-2 overflow-hidden rounded-lg"
              style={{
                width: 'clamp(44px, 5vw, 72px)',
                height: 'clamp(32px, 4vw, 52px)',
                background: 'hsl(var(--sf-gold) / 0.08)',
              }}
            >
              <img src={item.src} alt="" aria-hidden className="w-full h-full object-contain p-1" />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export const MarqueeSection: React.FC = () => (
  <>
    <style>{`
      @keyframes mq-fwd {
        from { transform: translateX(0); }
        to   { transform: translateX(-33.333%); }
      }
      @keyframes mq-rev {
        from { transform: translateX(-33.333%); }
        to   { transform: translateX(0); }
      }
    `}</style>

    <section data-header-bg="cream" className="relative overflow-hidden -mt-px bg-[hsl(var(--sf-brown))]" >

      <div className="leading-[0]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(50px, 6vw, 80px)' }}
        >
          <rect width="1000" height="100" fill="#1c1917" />
          <path d="M1000 100C500 100 500 64 0 64V0h1000v100Z" fill="hsl(0 72% 40%)" opacity=".4" />
          <path d="M1000 100C500 100 500 34 0 34V0h1000v100Z" fill="hsl(0 72% 40%)" opacity=".4" />
          <path d="M1000 100C500 100 500 4 0 4V0h1000v100Z" fill="hsl(0 72% 40%)" />
        </svg>

      </div>

      <div className="py-5 flex flex-col gap-3">
        <MarqueeRow items={row1Items} speed="30s" />
        <div className="w-full h-px bg-[hsl(var(--sf-gold)/0.15)]" />
        <MarqueeRow items={row2Items} reverse speed="24s" />
      </div>

      <div className="leading-[0]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(50px, 6vw, 80px)' }}
        >
          <rect width="1000" height="100" fill="#1c1917" />
          <path d="M0 0C500 0 500 36 1000 36V100H0V0Z" fill="hsl(36 33% 97%)" opacity=".4" />
          <path d="M0 0C500 0 500 66 1000 66V100H0V0Z" fill="hsl(36 33% 97%)" opacity=".4" />
          <path d="M0 0C500 0 500 96 1000 96V100H0V0Z" fill="hsl(36 33% 97%)" />
        </svg>
      </div>

    </section>
  </>
);
