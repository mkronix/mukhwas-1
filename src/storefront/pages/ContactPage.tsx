import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const contactInfo = [
  { icon: Phone, label: "Phone", value: "+91 98765 43210" },
  { icon: Mail, label: "Email", value: "hello@themukhwascompany.com" },
  {
    icon: MapPin,
    label: "Address",
    value: "The Mukhwas Company, Mumbai, Maharashtra 400001",
  },
];

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "subject", label: "Subject", type: "text" },
];

const ContactPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      if (formRef.current) {
        gsap.from(formRef.current, {
          x: -50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: formRef.current, start: "top 80%" },
        });
      }
      if (cardsRef.current) {
        gsap.from(Array.from(cardsRef.current.children), {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="bg-[hsl(var(--sf-cream))]">
      {/* Hero */}
      <section className="relative bg-[hsl(var(--sf-brown))] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 50%, hsl(var(--sf-gold) / 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-[1500px] mx-auto px-6 md:px-16 py-24 md:py-32 text-center relative z-10">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-px w-10 bg-[hsl(var(--sf-gold))]" />
            <span className="sf-label">Get in Touch</span>
            <div className="h-px w-10 bg-[hsl(var(--sf-gold))]" />
          </motion.div>

          {["CONTACT", "US."].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                className="block font-black text-white uppercase m-0"
                style={{
                  fontSize: "clamp(44px, 7vw, 100px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                }}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  delay: 0.2 + i * 0.14,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {line}
              </motion.h1>
            </div>
          ))}

          <motion.p
            className="mt-6 text-white/60 max-w-md mx-auto leading-relaxed"
            style={{ fontSize: "clamp(14px, 1.3vw, 17px)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            We'd love to hear from you. Drop us a line and we'll get back to you
            shortly.
          </motion.p>
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
            <rect width="1000" height="100" fill="#faf8f5" />
            <path
              d="M1000 100C500 100 500 64 0 64V0h1000v100Z"
              fill="#1c1917"
              opacity=".15"
            />
            <path
              d="M1000 100C500 100 500 34 0 34V0h1000v100Z"
              fill="#1c1917"
              opacity=".35"
            />
            <path d="M1000 100C500 100 500 4 0 4V0h1000v100Z" fill="#1c1917" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[hsl(var(--sf-cream))]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-16 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Form */}
            <div ref={formRef} className="lg:col-span-3">
              {sent ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-20 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-[hsl(var(--sf-gold))] text-5xl mb-4">
                    ✦
                  </span>
                  <h2 className="font-black uppercase text-[hsl(var(--sf-brown))] text-2xl tracking-tight mb-2">
                    Message Sent!
                  </h2>
                  <p className="text-[hsl(var(--sf-brown-mid))] text-sm">
                    We'll get back to you shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="sf-gold-line mb-2" />
                  <h2
                    className="font-black uppercase text-[hsl(var(--sf-brown))] tracking-tight mb-2"
                    style={{ fontSize: "clamp(22px, 2.5vw, 32px)" }}
                  >
                    Send a Message
                  </h2>
                  {fields.map((f) => (
                    <div key={f.name} className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black uppercase tracking-[0.12em] text-[hsl(var(--sf-brown-mid))]">
                        {f.label}
                      </label>
                      <Input
                        type={f.type}
                        required
                        className="bg-secondary"
                        placeholder={f.label}
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-[0.12em] text-[hsl(var(--sf-brown-mid))]">
                      Message
                    </label>
                    <Textarea
                      required
                      rows={5}
                      className="bg-secondary"
                      placeholder="Your message..."
                    />
                  </div>
                  <Button type="button" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>

            {/* Contact cards */}
            <div ref={cardsRef} className="lg:col-span-2 flex flex-col gap-5">
              <div className="sf-gold-line mb-2" />
              <h2
                className="font-black uppercase text-[hsl(var(--sf-brown))] tracking-tight mb-2"
                style={{ fontSize: "clamp(22px, 2.5vw, 32px)" }}
              >
                Reach Us
              </h2>
              {contactInfo.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-[hsl(var(--sf-gold)/0.12)] hover:border-[hsl(var(--sf-gold)/0.3)] transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--sf-red))] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-black uppercase text-[11px] tracking-[0.1em] text-[hsl(var(--sf-brown))] mb-1">
                        {c.label}
                      </p>
                      <p className="text-[hsl(var(--sf-brown-mid))] text-sm leading-relaxed">
                        {c.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
