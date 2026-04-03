import React from 'react';
import { Tag } from 'lucide-react';

const messages = [
  "Free Shipping on First Order",
  "100% Natural Ingredients — No Artificial Colours",
  "Handcrafted Since 1995 — Authentic Indian Recipes",
  "Free Shipping on First Order",
  "100% Natural Ingredients — No Artificial Colours",
  "Handcrafted Since 1995 — Authentic Indian Recipes",
];

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="h-9 bg-brand-brown overflow-hidden flex items-center">
      <div
        className="flex items-center whitespace-nowrap"
        style={{
          animation: 'marquee-scroll 28s linear infinite',
        }}
      >
        {messages.map((msg, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-brand-gold text-[12px] font-bold uppercase tracking-[0.12em] px-8"
          >
            <Tag className="w-3 h-3 text-brand-gold shrink-0" />
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};