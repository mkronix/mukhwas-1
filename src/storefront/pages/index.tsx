import { AboutSection } from "@/storefront/components/home/AboutSection";
import { HeroSection } from "@/storefront/components/home/HeroSection";
import { IngredientsSection } from "@/storefront/components/home/IngredientsSection";
import { MarqueeSection } from "@/storefront/components/home/MarqueeSection";
import { NewsletterSection } from "@/storefront/components/home/NewsletterSection";
import { ProcessSection } from "@/storefront/components/home/ProcessSection";
import { ProductsSection } from "@/storefront/components/home/ProductsSection";
import { SocialSection } from "@/storefront/components/home/SocialSection";
import React from "react";

const StorefrontHomePage: React.FC = () => {
  // useSmoothScroll();
  return (
    <>
      <HeroSection />
      <AboutSection />
      <MarqueeSection />
      <ProductsSection />
      <IngredientsSection />
      <ProcessSection />
      <SocialSection />
      <NewsletterSection />
    </>
  );
};

export { default as AboutPage } from "./AboutPage";
export { default as AccountOrderDetail } from "./account/OrderDetailPage";
export { default as AccountOrders } from "./account/OrdersPage";
export { default as AccountOverview } from "./account/OverviewPage";
export { default as AccountProfile } from "./account/ProfilePage";
export { default as AccountReturns } from "./account/ReturnsPage";
export { default as AccountWishlist } from "./account/WishlistPage";
export { default as StorefrontCheckout } from "./CheckoutPage";
export { default as ContactPage } from "./ContactPage";
export { default as StorefrontOrderConfirmation } from "./OrderConfirmationPage";
export { default as PrivacyPolicy } from "./PrivacyPolicyPage";
export { default as StorefrontProductDetail } from "./ProductDetailPage";
export { default as StorefrontStore } from "./StorePage";
export { default as TermsPage } from "./TermsPage";
export { StorefrontHomePage as StorefrontHome };

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm">
        This page is under construction.
      </p>
    </div>
  </div>
);

export const StorefrontCart = () => <PlaceholderPage title="Cart" />;
