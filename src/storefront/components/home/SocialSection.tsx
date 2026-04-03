import React, { useRef, useEffect } from "react";
import { Instagram, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const items = [
  {
    img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    testimonial: {
      name: "Kasim Kadiwala",
      location: "Mumbai",
      rating: 5,
      text: '"The Pan Mukhwas reminds me of my grandmother\'s home. Absolutely authentic."',
    },
  },
  {
    img: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600",
    testimonial: {
      name: "Rahul Mehta",
      location: "Delhi",
      rating: 5,
      text: '"Best mukhwas I\'ve had outside of a 5-star restaurant. The Elaichi Mix is divine."',
    },
  },
  {
    img: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
    testimonial: {
      name: "Ananya Patel",
      location: "Ahmedabad",
      rating: 5,
      text: '"We order every month. The freshness and quality is unmatched. Truly handcrafted."',
    },
  },
  {
    img: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600",
    testimonial: {
      name: "Suresh Iyer",
      location: "Chennai",
      rating: 5,
      text: '"Since 1995 — you can taste the tradition in every bite. Nothing comes close."',
    },
  },
  {
    img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    testimonial: {
      name: "Meena Kapoor",
      location: "Jaipur",
      rating: 5,
      text: '"My family has been buying from them for years. The Meetha Saunf is a staple."',
    },
  },
  {
    img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    testimonial: {
      name: "Vikram Nair",
      location: "Bangalore",
      rating: 5,
      text: '"Pure ingredients, real flavour. You can taste the difference immediately."',
    },
  },
];

const GridItem: React.FC<{ item: (typeof items)[0]; index: number }> = ({
  item,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isOdd = index % 2 !== 0;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!ref.current) return;
    gsap.from(ref.current, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      delay: (index % 3) * 0.1,
      scrollTrigger: { trigger: ref.current, start: "top 88%" },
    });
  }, [index]);

  const imageLayer = (
    <div
      className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOdd ? "translate-y-0 group-hover:-translate-y-full" : "-translate-y-full group-hover:translate-y-0"}`}
    >
      <img
        src={item.img}
        alt={item.testimonial.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute bottom-3 left-3">
        <Instagram className="w-4 h-4 text-white opacity-70" />
      </div>
    </div>
  );

  const contentLayer = (
    <div
      className={`absolute inset-0 flex flex-col justify-between p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOdd ? "translate-y-full group-hover:translate-y-0" : "translate-y-0 group-hover:-translate-y-full"}`}
      style={{ background: "hsl(var(--sf-brown))" }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: item.testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5 fill-[hsl(var(--sf-gold))] text-[hsl(var(--sf-gold))]"
          />
        ))}
      </div>
      <p
        className="text-white leading-relaxed font-medium"
        style={{ fontSize: "clamp(12px, 1.1vw, 15px)" }}
      >
        {item.testimonial.text}
      </p>
      <div>
        <p className="font-black text-[hsl(var(--sf-gold))] text-[13px] uppercase tracking-[0.08em]">
          {item.testimonial.name}
        </p>
        <p className="text-white/50 text-[11px] font-medium uppercase tracking-[0.1em]">
          {item.testimonial.location}
        </p>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl cursor-pointer group h-48"
    >
      {imageLayer}
      {contentLayer}
    </div>
  );
};

export const SocialSection: React.FC = () => {
  return (
    <section
      data-header-bg="cream"
      className="relative bg-[hsl(var(--sf-cream))] -mt-px overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto px-6 md:px-16 pt-16 md:pt-20 pb-24 md:pb-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="w-10 h-px bg-[hsl(var(--sf-gold))] mb-4" />
            <h2
              className="font-black text-[hsl(var(--sf-brown))] uppercase leading-none tracking-tight"
              style={{ fontSize: "clamp(30px, 4vw, 56px)" }}
            >
              Loved by Families.
              <br />
              <span className="text-[hsl(var(--sf-red))]">
                Shared on Social.
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <p className="text-[hsl(var(--sf-brown-mid))] text-sm font-medium">
              Hover each photo to read their story.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--sf-brown))] text-white text-[12px] font-black uppercase tracking-[0.1em] hover:bg-[hsl(var(--sf-red))] transition-colors duration-200"
            >
              <Instagram className="w-4 h-4" />
              @themukhwascompany
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {items.map((item, i) => (
            <GridItem key={i} item={item} index={i} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-8 mt-12 pt-10 border-t border-[hsl(var(--sf-brown)/0.1)]">
          <div className="text-center">
            <p
              className="font-black text-[hsl(var(--sf-brown))] leading-none"
              style={{ fontSize: "clamp(24px, 3vw, 40px)" }}
            >
              10K+
            </p>
            <p className="text-[11px] font-bold text-[hsl(var(--sf-brown-mid))] uppercase tracking-[0.1em] mt-1">
              Happy Families
            </p>
          </div>
          <div className="w-px h-10 bg-[hsl(var(--sf-brown)/0.15)]" />
          <div className="text-center">
            <p
              className="font-black text-[hsl(var(--sf-brown))] leading-none"
              style={{ fontSize: "clamp(24px, 3vw, 40px)" }}
            >
              4.9★
            </p>
            <p className="text-[11px] font-bold text-[hsl(var(--sf-brown-mid))] uppercase tracking-[0.1em] mt-1">
              Average Rating
            </p>
          </div>
          <div className="w-px h-10 bg-[hsl(var(--sf-brown)/0.15)]" />
          <div className="text-center">
            <p
              className="font-black text-[hsl(var(--sf-brown))] leading-none"
              style={{ fontSize: "clamp(24px, 3vw, 40px)" }}
            >
              25K+
            </p>
            <p className="text-[11px] font-bold text-[hsl(var(--sf-brown-mid))] uppercase tracking-[0.1em] mt-1">
              Instagram Followers
            </p>
          </div>
        </div>
      </div>

      <div className="leading-[0]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(60px, 8vw, 100px)",
          }}
        >
          <rect width="1000" height="100" fill="hsl(0 72% 40%)" />
          <path
            d="M0 100C500 100 500 64 1000 64V0H0v100Z"
            fill="#faf8f5"
            opacity=".15"
          />
          <path
            d="M0 100C500 100 500 34 1000 34V0H0v100Z"
            fill="#faf8f5"
            opacity=".35"
          />
          <path d="M0 100C500 100 500 4 1000 4V0H0v100Z" fill="#faf8f5" />
        </svg>
      </div>
    </section>
  );
};
