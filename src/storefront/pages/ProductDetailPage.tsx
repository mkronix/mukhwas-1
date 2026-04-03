import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, ChevronRight, Minus, Plus, Star, ChevronDown } from 'lucide-react';
import { useStorefrontProducts } from '@/storefront/hooks/useStorefrontProducts';
import { StorefrontReviewService } from '@/storefront/services/ReviewService';
import ProductCard from '@/storefront/components/shared/ProductCard';
import { formatPrice } from '@/lib/format';
import { useState as useStateEffect, useEffect } from 'react';
import type { CustomerReview } from '@/types';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { products, categories } = useStorefrontProducts();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);

  const product = products.find(p => p.slug === slug);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [mainImage, setMainImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (product) {
      if (!selectedVariantId) setSelectedVariantId(product.variants[0]?.id || '');
      StorefrontReviewService.getReviewsByProduct(product.id).then(setReviews);
    }
  }, [product, selectedVariantId]);

  if (!product) {
    return (
      <div className="bg-[hsl(var(--sf-cream))] min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Product not found</h2>
          <Link to="/store" className="text-primary font-bold hover:underline">Back to store</Link>
        </div>
      </div>
    );
  }

  const variant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const category = categories.find(c => c.id === product.category_id);
  const isOOS = variant.stock_quantity <= 0;
  const isLowStock = variant.stock_quantity > 0 && variant.stock_quantity <= variant.low_stock_threshold;

  const productReviews = reviews;
  const avgRating = productReviews.length ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length : 0;

  const related = products.filter(p => p.id !== product.id && p.category_id === product.category_id).slice(0, 4);

  return (
    <section className="bg-[hsl(var(--sf-cream))] min-h-screen">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-6">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/store" className="hover:text-foreground transition-colors">Store</Link>
          <ChevronRight className="w-3 h-3" />
          {category && <><Link to={`/store?category=${category.id}`} className="hover:text-foreground transition-colors">{category.name}</Link><ChevronRight className="w-3 h-3" /></>}
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="lg:w-1/2">
            <div className="relative rounded-3xl overflow-hidden bg-card aspect-square flex items-center justify-center mb-4"
              style={{ background: product.ui?.card_bg || 'hsl(var(--card))' }}>
              <AnimatePresence mode="wait">
                <motion.img key={mainImage} src={product.images[mainImage] || product.image_url}
                  alt={product.name} className="object-contain w-[70%] h-[70%]"
                  style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} />
              </AnimatePresence>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setMainImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === mainImage ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                    style={{ background: product.ui?.card_bg || 'hsl(var(--card))' }}>
                    <img src={img} alt="" className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/2 flex flex-col gap-6">
            <div>
              <h1 className="font-black uppercase tracking-tight text-foreground" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
                {product.name}
              </h1>
              {productReviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-[hsl(var(--sf-gold))] text-[hsl(var(--sf-gold))]' : 'text-border'}`} />)}
                  </div>
                  <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({productReviews.length} reviews)</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-foreground">{formatPrice(variant.price_paisa)}</span>
              {variant.compare_at_price_paisa && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(variant.compare_at_price_paisa)}</span>
              )}
              {variant.compare_at_price_paisa && (
                <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--sf-red))] text-white text-xs font-black uppercase">
                  {Math.round((1 - variant.price_paisa / variant.compare_at_price_paisa) * 100)}% off
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-3 block">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter(v => v.is_active).map(v => (
                  <button key={v.id} onClick={() => { setSelectedVariantId(v.id); setQty(1); }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-[0.06em] border-2 transition-all ${
                      v.id === selectedVariantId
                        ? 'border-[hsl(var(--sf-red))] bg-[hsl(var(--sf-red))] text-white'
                        : 'border-border bg-card text-foreground hover:border-[hsl(var(--sf-red)/0.5)]'}`}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.08em] ${
                isOOS ? 'bg-destructive-muted text-destructive' : isLowStock ? 'bg-warning-muted text-warning' : 'bg-success-muted text-success'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOOS ? 'bg-destructive' : isLowStock ? 'bg-warning' : 'bg-success'}`} />
                {isOOS ? 'Out of Stock' : isLowStock ? `Only ${variant.stock_quantity} left` : 'In Stock'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-secondary transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-foreground">{qty}</span>
                <button onClick={() => setQty(Math.min(variant.stock_quantity, qty + 1))} className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button disabled={isOOS}
                className="flex-1 h-12 rounded-xl bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-2 hover:bg-[hsl(var(--sf-brown))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingCart className="w-4 h-4" />
                {isOOS ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button className="w-12 h-12 rounded-xl border-2 border-border flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--sf-red))] hover:border-[hsl(var(--sf-red))] transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-border pt-6">
              <p className={`text-sm text-muted-foreground leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''}`}>
                {product.description}
              </p>
              <button onClick={() => setDescExpanded(!descExpanded)}
                className="text-xs font-bold text-primary mt-2 flex items-center gap-1 hover:underline">
                {descExpanded ? 'Show less' : 'Read more'} <ChevronDown className={`w-3 h-3 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {productReviews.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mb-8">Customer Reviews</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {productReviews.map(r => (
                <div key={r.id} className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-[hsl(var(--sf-gold))] text-[hsl(var(--sf-gold))]' : 'text-border'}`} />)}
                    </div>
                    {(r as any).verified_purchase && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-success bg-success-muted px-2 py-0.5 rounded-full">Verified</span>
                    )}
                  </div>
                  {r.title && <h4 className="font-bold text-foreground mb-1">{r.title}</h4>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs font-medium text-muted-foreground">{(r as any).customer_name ?? 'Customer'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16 md:mt-24 pb-12">
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetailPage;
