import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.png";
import logoLightImg from "@/assets/logo.png";
import { useAuthModal } from "./auth/AuthModalContext";
import { useStorefrontAuth } from "@/storefront/auth/useStorefrontAuth";
import {
  useStorefrontDispatch,
  useStorefrontSelector,
} from "@/storefront/store/storefrontStore";
import { selectCartCount, openDrawer } from "@/storefront/store/cartSlice";
import { useStorefrontProducts } from "@/storefront/hooks/useStorefrontProducts";

type HeaderBg = "cream" | "red" | "brown";

const headerHex: Record<HeaderBg, string> = {
  cream: "#faf8f5",
  red: "#b01a1a",
  brown: "#47291a",
};

const bgClasses: Record<HeaderBg, string> = {
  cream: "bg-[hsl(var(--sf-cream))]",
  red: "bg-[hsl(var(--sf-red))]",
  brown: "bg-[hsl(var(--sf-brown))]",
};

const textPrimary: Record<HeaderBg, string> = {
  cream: "text-[hsl(var(--sf-brown))]",
  red: "text-white",
  brown: "text-white",
};

const textMuted: Record<HeaderBg, string> = {
  cream: "text-[hsl(var(--sf-brown-mid))]",
  red: "text-white/70",
  brown: "text-white/60",
};

const hoverText: Record<HeaderBg, string> = {
  cream: "hover:text-[hsl(var(--sf-red))]",
  red: "hover:text-[hsl(var(--sf-gold))]",
  brown: "hover:text-[hsl(var(--sf-gold))]",
};

const cartBg: Record<HeaderBg, string> = {
  cream: "bg-[hsl(var(--sf-red))] text-white hover:bg-[hsl(var(--sf-brown))]",
  red: "bg-white text-[hsl(var(--sf-red))] hover:bg-[hsl(var(--sf-gold))] hover:text-[hsl(var(--sf-brown))]",
  brown: "bg-[hsl(var(--sf-gold))] text-[hsl(var(--sf-brown))] hover:bg-white",
};

const dividerColor: Record<HeaderBg, string> = {
  cream: "bg-[hsl(var(--sf-brown)/0.2)]",
  red: "bg-white/20",
  brown: "bg-white/15",
};
// featuredProducts moved inside component

const leftLinks = [
  { to: "/store", label: "Shop", hasDropdown: true },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const rightLinks = [
  { to: "/account/orders", label: "Track Order" },
  { to: "/about#faq", label: "FAQ" },
];

export const StorefrontHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [headerBg, setHeaderBg] = useState<HeaderBg>("cream");
  const location = useLocation();
  const { open: openAuth } = useAuthModal();
  const { isAuthenticated, customer } = useStorefrontAuth();
  const dispatch = useStorefrontDispatch();
  const cartCount = useStorefrontSelector(selectCartCount);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { products, categories } = useStorefrontProducts();
  const featuredProducts = products.slice(0, 3);

  const isActive = (path: string) => location.pathname === path;
  const isLight = headerBg === "cream";

  const openMega = () => {
    clearTimeout(megaTimeoutRef.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 150);
  };

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-header-bg]");
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bg = entry.target.getAttribute("data-header-bg") as HeaderBg;
            if (bg) setHeaderBg(bg);
          }
        });
      },
      { rootMargin: "-68px 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    setMegaOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p / 100);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${bgClasses[headerBg]}`}
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between max-w-[1500px] mx-auto px-8 h-[68px]">
        <nav className="flex items-center gap-8">
          {leftLinks.map((link) => (
            <div key={link.to} className="relative">
              {link.hasDropdown ? (
                <button
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                  className={`flex items-center gap-1 font-semibold text-[13px] uppercase tracking-[0.08em] transition-colors duration-200 ${
                    isActive(link.to)
                      ? isLight
                        ? "text-[hsl(var(--sf-red))]"
                        : "text-[hsl(var(--sf-gold))]"
                      : `${textPrimary[headerBg]} ${hoverText[headerBg]}`
                  }`}
                >
                  {link.label}
                  <motion.svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="mt-0.5"
                    animate={{ rotate: megaOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      d="M2 4L5 7L8 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </button>
              ) : (
                <Link
                  to={link.to}
                  className={`font-semibold text-[13px] uppercase tracking-[0.08em] transition-colors duration-200 ${
                    isActive(link.to)
                      ? isLight
                        ? "text-[hsl(var(--sf-red))]"
                        : "text-[hsl(var(--sf-gold))]"
                      : `${textPrimary[headerBg]} ${hoverText[headerBg]}`
                  }`}
                >
                  {link.label}
                </Link>
              )}
              <span
                className={`absolute -bottom-[2px] left-0 h-[2px] bg-[hsl(var(--sf-gold))] transition-all duration-300 ${isActive(link.to) ? "w-full" : "w-0 hover:w-full"}`}
              />
            </div>
          ))}
        </nav>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img
            src={isLight ? logoImg : logoLightImg}
            alt="The Mukhwas Company"
            className="h-12 w-auto object-contain transition-opacity duration-300"
            loading="eager"
          />
        </Link>

        <div className="flex items-center gap-6">
          {rightLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-semibold text-[13px] uppercase tracking-[0.08em] transition-colors relative group ${textPrimary[headerBg]} ${hoverText[headerBg]}`}
            >
              {link.label}
              <span className="absolute -bottom-[2px] left-0 h-[2px] bg-[hsl(var(--sf-gold))] w-0 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}

          {isAuthenticated ? (
            <Link
              to="/account"
              className={`font-semibold text-[13px] uppercase tracking-[0.08em] transition-colors relative group ${textPrimary[headerBg]} ${hoverText[headerBg]}`}
            >
              {customer?.name?.split(" ")[0] || "Account"}
              <span className="absolute -bottom-[2px] left-0 h-[2px] bg-[hsl(var(--sf-gold))] w-0 group-hover:w-full transition-all duration-300" />
            </Link>
          ) : (
            <button
              onClick={() => openAuth("login")}
              className={`font-semibold text-[13px] uppercase tracking-[0.08em] transition-colors relative group ${textPrimary[headerBg]} ${hoverText[headerBg]}`}
            >
              Login
              <span className="absolute -bottom-[2px] left-0 h-[2px] bg-[hsl(var(--sf-gold))] w-0 group-hover:w-full transition-all duration-300" />
            </button>
          )}

          <div className={`w-px h-5 ${dividerColor[headerBg]}`} />
          <button
            className={`p-1.5 transition-colors ${textMuted[headerBg]} ${hoverText[headerBg]}`}
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
          <Link
            to="/account/wishlist"
            className={`p-1.5 transition-colors relative ${textMuted[headerBg]} ${hoverText[headerBg]}`}
            aria-label="Wishlist"
          >
            <Heart className="w-[18px] h-[18px]" />
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[hsl(var(--sf-red))] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              0
            </span>
          </Link>
          <button
            onClick={() => dispatch(openDrawer())}
            className={`flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] px-5 py-2.5 rounded-full transition-colors duration-200 ${cartBg[headerBg]}`}
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            CART
            <span className="w-5 h-5 bg-[hsl(var(--sf-gold))] text-[hsl(var(--sf-brown))] text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mega Menu */}
      <AnimatePresence>
        {megaOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-28 bg-[hsl(var(--sf-cream))] z-[48]"
              onClick={() => setMegaOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 z-[49] "
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <div className="max-w-[1500px] mx-auto px-8 py-10">
                <div className="flex gap-10">
                  {/* Featured Products */}
                  <div className="flex-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[hsl(var(--sf-brown-mid))] mb-6">
                      Featured Products
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      {featuredProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/store/${product.slug}`}
                          className="group"
                          onClick={() => setMegaOpen(false)}
                        >
                          <div
                            className="relative aspect-square rounded-2xl overflow-hidden mb-3"
                            style={{
                              background:
                                product.ui?.card_bg || "hsl(var(--sf-brown))",
                            }}
                          >
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <h4 className="font-black text-sm uppercase tracking-tight text-[hsl(var(--sf-brown))] group-hover:text-[hsl(var(--sf-red))] transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs text-[hsl(var(--sf-brown-mid))] mt-0.5">
                            From {formatPrice(product.base_price_paisa)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="w-64 border-l border-[hsl(var(--sf-gold)/0.15)] pl-10">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[hsl(var(--sf-brown-mid))] mb-6">
                      Categories
                    </h3>
                    <nav className="flex flex-col gap-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/store?category=${cat.slug}`}
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium text-[hsl(var(--sf-brown))] hover:text-[hsl(var(--sf-red))] hover:bg-[hsl(var(--sf-red)/0.05)] transition-colors group"
                        >
                          {cat.name}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </nav>

                    <Link
                      to="/store"
                      onClick={() => setMegaOpen(false)}
                      className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--sf-red))] text-white font-black text-xs uppercase tracking-[0.1em] hover:bg-[hsl(var(--sf-brown))] transition-colors w-full justify-center"
                    >
                      All Products
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 h-14">
        <button
          onClick={() => setMenuOpen(true)}
          className={`p-2 ${textPrimary[headerBg]}`}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/">
          <img
            src={isLight ? logoImg : logoLightImg}
            alt="The Mukhwas Company"
            className="h-9 w-auto object-contain"
            loading="eager"
          />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/account/wishlist"
            className={`p-2 relative ${textPrimary[headerBg]}`}
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-[14px] h-[14px] bg-[hsl(var(--sf-red))] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
          <button
            onClick={() => dispatch(openDrawer())}
            className={`p-2 relative ${textPrimary[headerBg]}`}
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-[14px] h-[14px] bg-[hsl(var(--sf-red))] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Wavy bottom */}
      <svg
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: "100%", zIndex: 49 }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        width="100%"
        height="clamp(24px, 3vw, 60px)"
      >
        <g fill={headerHex[headerBg]}>
          <path d="M0 0v100l500-48 500 48V0H0z" opacity=".5" />
          <path d="M0 0h1000v52H0z" opacity=".5" />
          <path d="M0 0v4l500 48 500-48V0H0z" opacity=".5" />
          <path d="M0 0v4l500 48 500-48V0H0z" />
        </g>
      </svg>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99] bg-[hsl(var(--sf-brown)/0.6)] backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed top-0 left-0 bottom-0 z-[100] w-[280px] bg-[hsl(var(--sf-cream))] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-[hsl(var(--sf-gold)/0.2)]">
                <img
                  src={logoImg}
                  alt="The Mukhwas Company"
                  className="h-8 object-contain"
                />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-[hsl(var(--sf-brown))] hover:text-[hsl(var(--sf-red))] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
                {[
                  { to: "/", label: "Home" },
                  { to: "/store", label: "Shop All" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 border-b border-[hsl(var(--sf-gold)/0.1)] font-semibold text-base text-[hsl(var(--sf-brown))] hover:text-[hsl(var(--sf-red))] transition-colors uppercase tracking-[0.06em]"
                  >
                    {link.label}
                  </Link>
                ))}
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[hsl(var(--sf-brown-mid))] mt-5 mb-2">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/store?category=${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm text-[hsl(var(--sf-brown))] hover:text-[hsl(var(--sf-red))] transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="my-4 h-px bg-[hsl(var(--sf-gold)/0.1)]" />
                {[
                  { to: "/about", label: "About" },
                  { to: "/contact", label: "Contact" },
                  { to: "/account/orders", label: "Track Order" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 border-b border-[hsl(var(--sf-gold)/0.1)] font-semibold text-base text-[hsl(var(--sf-brown))] hover:text-[hsl(var(--sf-red))] transition-colors uppercase tracking-[0.06em]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="p-5 border-t border-[hsl(var(--sf-gold)/0.2)]">
                {isAuthenticated ? (
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center bg-[hsl(var(--sf-red))] text-white font-bold uppercase tracking-[0.08em] text-sm py-3 rounded-full hover:bg-[hsl(var(--sf-brown))] transition-colors"
                  >
                    My Account
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openAuth("login");
                    }}
                    className="block w-full text-center bg-[hsl(var(--sf-red))] text-white font-bold uppercase tracking-[0.08em] text-sm py-3 rounded-full hover:bg-[hsl(var(--sf-brown))] transition-colors"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
