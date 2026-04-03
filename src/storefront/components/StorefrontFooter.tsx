import React from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/store', label: 'Shop All' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const supportLinks = [
  { to: '/account/orders', label: 'Track Order' },
  { to: '/account/returns', label: 'Returns' },
  { to: '/about#faq', label: 'FAQ' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
];

const socialBar = [
  {
    label: 'Facebook',
    url: '#',
    hex: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0d5fd1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    url: '#',
    hex: '#E1306C',
    gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    url: '#',
    hex: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000, #cc0000)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    url: '#',
    hex: '#25D366',
    gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export const StorefrontFooter: React.FC = () => {
  return (
    <footer data-header-bg="cream" className="bg-[hsl(var(--sf-brown))] overflow-hidden">

      <div className="max-w-[1500px] mx-auto px-6 md:px-16 pt-16 md:pt-20 pb-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-16 md:mb-20">

          <div className="flex flex-col gap-4">
            <h3 className="text-[hsl(var(--sf-gold))] text-base font-black uppercase tracking-[0.22em]">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-background/50 hover:text-background text-md font-medium transition-colors duration-200 hover:pl-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[hsl(var(--sf-gold))] text-base font-black uppercase tracking-[0.22em]">Support</h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-background/50 hover:text-background text-md font-medium transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[hsl(var(--sf-gold))] text-base font-black uppercase tracking-[0.22em]">Address</h3>
            <div className="flex flex-col gap-2 text-background/50 text-md leading-relaxed">
              <p>The Mukhwas Company</p>
              <p>Mumbai, Maharashtra<br />India — 400001</p>
              <div className="mt-1 flex flex-col gap-1.5">
                <span className="text-background/30 text-base uppercase tracking-[0.12em]">Hours</span>
                <p>Mon – Sat: 9am – 7pm</p>
                <p>Sun: 10am – 5pm</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[hsl(var(--sf-gold))] text-base font-black uppercase tracking-[0.22em]">Contact</h3>
            <div className="flex flex-col gap-2.5 text-background/50 text-md leading-relaxed">
              <a href="tel:+919876543210" className="hover:text-background transition-colors">
                +91 98765 43210
              </a>
              <a href="mailto:hello@themukhwascompany.com" className="hover:text-background transition-colors break-all">
                hello@themukhwascompany.com
              </a>
              <div className="mt-2 flex flex-wrap gap-2">
                {['VISA', 'Mastercard', 'UPI', 'GPay'].map(p => (
                  <span key={p} className="px-2 py-0.5 rounded text-base font-bold text-background/30 border border-[rgba(255,255,255,0.06)] uppercase tracking-[0.06em]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 py-6 border-t border-b border-[rgba(255,255,255,0.06)]">
          <div className="text-center leading-none" style={{ fontFamily: 'inherit' }}>
            <p
              className="font-black uppercase text-background/15 leading-none tracking-[-0.02em] select-none"
              style={{ fontSize: 'clamp(14px, 1.8vw, 20px)', letterSpacing: '0.3em' }}
            >
              The
            </p>
            <p
              className="font-black uppercase leading-none tracking-tight"
              style={{
                fontSize: 'clamp(52px, 10vw, 140px)',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, hsl(43 85% 52%) 0%, hsl(36 90% 70%) 40%, hsl(43 85% 52%) 70%, hsl(24 60% 45%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MUKHWAS
            </p>
            <p
              className="font-black uppercase leading-none"
              style={{
                fontSize: 'clamp(18px, 3vw, 42px)',
                letterSpacing: '0.35em',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.2)',
              }}
            >
              COMPANY
            </p>
          </div>

          {/* <div className="flex items-center gap-3 mt-2">
            {socialBar.map((s) => (
              <a
                key={s.label}
                href={s.url}
                aria-label={s.label}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 text-background/40"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = s.gradient;
                  el.style.color = '#fff';
                  el.style.borderColor = 'transparent';
                  el.style.transform = 'translateY(-3px) scale(1.08)';
                  el.style.boxShadow = `0 8px 24px ${s.hex}55`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'rgba(255,255,255,0.06)';
                  el.style.color = 'rgba(255,255,255,0.4)';
                  el.style.borderColor = 'rgba(255,255,255,0.08)';
                  el.style.transform = '';
                  el.style.boxShadow = '';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div> */}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4">
          <p className="text-background/25 text-[11px] tracking-[0.06em]">
            © {new Date().getFullYear()} The Mukhwas Company. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: 'Privacy Policy', to: '/privacy-policy' },
              { label: 'Terms', to: '/terms' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="text-background/25 hover:text-background/60 text-[11px] transition-colors tracking-[0.04em]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.06)] text-background/[0.06]">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {socialBar.map((s, i) => (
            <a
              key={s.label}
              href={s.url}
              className="flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-200 text-background/30"
              style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = s.hex + '14';
                el.style.color = s.hex;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = '';
                el.style.color = '';
              }}
            >
              <span className="opacity-70">{s.icon}</span>
              {s.label}
              <span className="opacity-50">↗</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};