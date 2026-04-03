import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Gift, Truck, Shield } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const avatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
];

const perks = [
  { icon: Truck, label: "Free Shipping", sub: "On your first order" },
  { icon: Gift, label: "Exclusive Offers", sub: "Members-only deals" },
  { icon: Shield, label: "No Spam Ever", sub: "Unsubscribe anytime" },
];

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!contentRef.current) return;
    gsap.from(Array.from(contentRef.current.children), {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: contentRef.current, start: "top 80%" },
    });
  }, []);

  const handleSubmit = () => {
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      data-header-bg="cream"
      className="relative bg-[hsl(var(--sf-red))] overflow-hidden -mt-px"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, hsl(var(--sf-gold) / 0.08) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 w-full h-full opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-[1500px] mx-auto px-6 md:px-16 py-20 md:py-28">
        <div
          ref={contentRef}
          className="flex flex-col items-center text-center gap-8"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bactext-background/10 border border-bactext-background/20">
              <span className="text-[hsl(var(--sf-gold))] text-[10px] font-black uppercase tracking-[0.2em]">
                ✦ Limited Time Offer
              </span>
            </div>
            <h2
              className="font-black text-background uppercase leading-none tracking-tight"
              style={{ fontSize: "clamp(32px, 5vw, 72px)" }}
            >
              Free Shipping on
              <br />
              <span className="text-[hsl(var(--sf-gold))]">
                Your First Order
              </span>
            </h2>
            <p
              className="text-background/70 max-w-[420px] leading-relaxed"
              style={{ fontSize: "clamp(14px, 1.2vw, 17px)" }}
            >
              Join 10,000+ families who start every meal with The Mukhwas
              Company. Get exclusive drops, recipes, and offers.
            </p>
          </div>

          <div className="flex items-center">
            <div className="flex items-center gap-0 -space-x-3">
              {avatars.map((src, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full overflow-hidden ring-0 ring-[hsl(var(--sf-red))]"
                  style={{ zIndex: avatars.length - i }}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            <div className="ml-2 text-left">
              <p className="text-background text-[13px] font-black leading-tight">
                10,000+ joined
              </p>
              <p className="text-background/50 text-[11px]">this month alone</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <span className="text-[hsl(var(--sf-gold))] text-4xl">✦</span>
              <p className="text-background font-black text-xl uppercase tracking-tight">
                You're in!
              </p>
              <p className="text-background/60 text-sm">
                Check your inbox for your free shipping code.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-[480px] flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="your@email.com"
              />
              <Button
                onClick={handleSubmit}
                className="px-7 py-4 text-[13px] font-black uppercase bg-[hsl(var(--sf-gold))]"
              >
                Get My Code
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 pt-2">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.label} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-bactext-background/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[hsl(var(--sf-gold))]" />
                  </div>
                  <div className="text-left">
                    <p className="text-background text-[12px] font-black uppercase tracking-[0.06em] leading-none">
                      {perk.label}
                    </p>
                    <p className="text-background/50 text-[10px] mt-0.5">
                      {perk.sub}
                    </p>
                  </div>
                </div>
              );
            })}
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
            height: "clamp(50px, 6vw, 80px)",
          }}
        >
          <rect width="1000" height="100" fill="#1c1917" />
          <path
            d="M1000 100C500 100 500 64 0 64V0h1000v100Z"
            fill="hsl(0 72% 40%)"
            opacity=".4"
          />
          <path
            d="M1000 100C500 100 500 34 0 34V0h1000v100Z"
            fill="hsl(0 72% 40%)"
            opacity=".4"
          />
          <path
            d="M1000 100C500 100 500 4 0 4V0h1000v100Z"
            fill="hsl(0 72% 40%)"
          />
        </svg>
      </div>
    </section>
  );
};
