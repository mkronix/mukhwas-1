import React, { useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product, ProductVariant } from "@/types";
import { useStorefrontDispatch } from "@/storefront/store/storefrontStore";
import { addItem, openDrawer } from "@/storefront/store/cartSlice";

type Props = {
  product: Product;
  onAddToCart?: (payload: {
    product: Product;
    variant: ProductVariant;
    quantity: number;
  }) => void;
  innerRef?: (el: HTMLDivElement | null) => void;
};

const formatPrice = (paisa: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paisa / 100);

const resolveUI = (product: Product) => {
  if (product.ui) return product.ui;
  console.log("no product ui", product);
  return {
    card_bg: "linear-gradient(135deg,#111,#222)",
    name_color: "#fff",
    price_color: "#fff",
    cta_bg: "#fff",
    cta_text: "#000",
  };
};

const ProductCard: React.FC<Props> = ({ product, onAddToCart, innerRef }) => {
  const navigate = useNavigate();
  const dispatch = useStorefrontDispatch();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), {
    stiffness: 120,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), {
    stiffness: 120,
    damping: 15,
  });

  const glareX = useTransform(x, [-100, 100], ["0%", "100%"]);
  const glareY = useTransform(y, [-100, 100], ["0%", "100%"]);

  const activeVariants = useMemo(
    () => product.variants.filter((v) => v.is_active),
    [product.variants],
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    activeVariants[0]?.id || "",
  );

  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === selectedVariantId),
    [activeVariants, selectedVariantId],
  );

  if (!product || !selectedVariant) return null;

  const image = product.image_url || product.images?.[0] || "/placeholder.png";
  const ui = resolveUI(product);
  const isOOS = selectedVariant.stock_quantity <= 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    x.set(px);
    y.set(py);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOOS) return;
    dispatch(
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: selectedVariant.name,
        imageUrl: image,
        pricePaisa: selectedVariant.price_paisa,
        quantity: 1,
        maxStock: selectedVariant.stock_quantity,
      }),
    );
    dispatch(openDrawer());
    onAddToCart?.({ product, variant: selectedVariant, quantity: 1 });
  };

  return (
    <motion.div
      ref={(el) => {
        containerRef.current = el;
        innerRef?.(el);
      }}
      className="relative rounded-3xl cursor-pointer w-full flex flex-col overflow-hidden"
      style={{
        background: ui.card_bg,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      viewport={{ once: false, margin: "-20%" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onClick={() => navigate(`/store/${product.slug}`)}
    >
      <div className="flex-1 flex items-end justify-center px-8 pt-10 pb-0 relative">
        <motion.img
          src={image}
          alt={product.name}
          loading="lazy"
          className="relative z-10 object-contain w-full"
          style={{
            height: "clamp(180px, 20vw, 260px)",
            transform: "translateZ(60px)",
            filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
          }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
      </div>

      <div className="px-7 pt-5 pb-7 relative z-10">
        <div className="flex items-center gap-1.5 mb-3">
          {activeVariants.map((v) => (
            <motion.button
              key={v.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVariantId(v.id);
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className={`text-[10px] font-black uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ${
                selectedVariantId === v.id
                  ? "bg-[hsl(var(--sf-brown))] ring-1 ring-[hsl(var(--sf-brown))]"
                  : "bg-[hsl(var(--sf-brown))]"
              }`}
              style={{
                color:
                  selectedVariantId === v.id
                    ? ui.name_color
                    : `${ui.name_color}99`,
              }}
            >
              {v.name}
            </motion.button>
          ))}
        </div>

        <motion.h3
          className="font-black uppercase leading-none tracking-tight mb-5"
          style={{
            fontSize: "clamp(22px, 2.2vw, 30px)",
            color: ui.name_color,
            transform: "translateZ(40px)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
        >
          {product.name}
        </motion.h3>

        <motion.button
          disabled={!selectedVariant.is_active || isOOS}
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-[0.1em] flex items-center justify-between px-5"
          style={{
            background: isOOS ? "rgba(255,255,255,0.1)" : ui.cta_bg,
            color: isOOS ? ui.name_color : ui.cta_text,
            transform: "translateZ(30px)",
          }}
        >
          <span>
            {formatPrice(selectedVariant.price_paisa)} ·{" "}
            {isOOS ? "Out of stock" : "Add to Cart"}
          </span>
          <ShoppingCart className="w-4 h-4 flex-shrink-0" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
