import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/format";
import { MultiplierBadge } from "@/pos/components/MultiplierBadge";
import { posCategories, posProducts } from "@/pos/mock";
import { addItem } from "@/pos/store/cartSlice";
import { usePOSDispatch } from "@/pos/store/posStore";
import type { Product, ProductVariant } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Grid3X3, List, ScanBarcode, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type ViewMode = "grid" | "list";
const VIEW_MODE_KEY = "pos_product_view";

const loadViewMode = (): ViewMode => {
  try {
    const v = localStorage.getItem(VIEW_MODE_KEY);
    if (v === "list" || v === "grid") return v;
  } catch {}
  return "grid";
};

interface ProductBrowserProps {
  className?: string;
  multiplier?: number;
  onProductAdded?: () => void;
  searchRef?: React.RefObject<HTMLInputElement>;
}

export const ProductBrowser: React.FC<ProductBrowserProps> = ({
  className,
  multiplier = 1,
  onProductAdded,
  searchRef: externalSearchRef,
}) => {
  const dispatch = usePOSDispatch();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [pulsingVariant, setPulsingVariant] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);
  const internalRef = React.useRef<HTMLInputElement>(null);
  const searchInputRef = externalSearchRef || internalRef;

  useEffect(() => {
    if (!barcodeMode) return;
    searchInputRef.current?.focus();
  }, [barcodeMode, searchInputRef]);

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const filtered = useMemo(() => {
    let products = posProducts;
    if (activeCategory) {
      products = products.filter((p) => p.category_id === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(q)),
      );
    }
    return products;
  }, [search, activeCategory]);

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    if (variant.stock_quantity <= 0) return;
    dispatch(
      addItem({
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_name: variant.name,
        image_url: product.image_url,
        unit_price_paisa: variant.price_paisa,
        quantity: multiplier,
      }),
    );
    setPulsingVariant(variant.id);
    setTimeout(() => setPulsingVariant(null), 300);
    onProductAdded?.();
  };

  const handleBarcodeInput = (value: string) => {
    if (!barcodeMode) return;
    const sku = value.trim().toUpperCase();
    for (const product of posProducts) {
      for (const variant of product.variants) {
        if (variant.sku === sku) {
          handleAddToCart(product, variant);
          setSearch("");
          return;
        }
      }
    }
  };

  const getStockStatus = (
    v: ProductVariant,
  ): "in_stock" | "low_stock" | "out_of_stock" => {
    if (v.stock_quantity <= 0) return "out_of_stock";
    if (v.stock_quantity <= v.low_stock_threshold) return "low_stock";
    return "in_stock";
  };

  const stockDotColor = {
    in_stock: "bg-success",
    low_stock: "bg-warning",
    out_of_stock: "bg-destructive",
  };

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="sticky top-0 z-10 bg-background border-b border-border px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (barcodeMode && e.target.value.length >= 5) {
                  handleBarcodeInput(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && barcodeMode) {
                  handleBarcodeInput(search);
                }
                if (e.key === "Escape") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder={
                barcodeMode ? "Scan barcode..." : "Search products... (Ctrl+F)"
              }
              className="w-full pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                title="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setBarcodeMode(!barcodeMode)}
            title={barcodeMode ? "Disable barcode mode" : "Enable barcode mode"}
            className={`p-2.5 rounded-lg border transition-colors shrink-0 ${barcodeMode ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background text-muted-foreground hover:text-foreground"}`}
          >
            <ScanBarcode className="h-4 w-4" />
          </button>
          <div className="flex rounded-lg border border-input overflow-hidden shrink-0">
            <button
              onClick={() => toggleViewMode("grid")}
              title="Grid view"
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleViewMode("list")}
              title="List view"
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <div className="md:hidden">
            <MultiplierBadge multiplier={multiplier} />
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            title="Show all products"
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
          >
            All
          </button>
          {posCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setActiveCategory(cat.id === activeCategory ? null : cat.id)
              }
              title={`Filter by ${cat.name}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No products found</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  pulsingVariant={pulsingVariant}
                  onAddToCart={handleAddToCart}
                  getStockStatus={getStockStatus}
                  stockDotColor={stockDotColor}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductListRow
                  key={product.id}
                  product={product}
                  pulsingVariant={pulsingVariant}
                  onAddToCart={handleAddToCart}
                  getStockStatus={getStockStatus}
                  stockDotColor={stockDotColor}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductTileProps {
  product: Product;
  pulsingVariant: string | null;
  onAddToCart: (product: Product, variant: ProductVariant) => void;
  getStockStatus: (
    v: ProductVariant,
  ) => "in_stock" | "low_stock" | "out_of_stock";
  stockDotColor: Record<string, string>;
}

const ProductTile: React.FC<ProductTileProps> = ({
  product,
  pulsingVariant,
  onAddToCart,
  getStockStatus,
  stockDotColor,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const variant = product.variants[selectedIdx];
  if (!variant) return null;
  const status = getStockStatus(variant);
  const isDisabled = status === "out_of_stock";
  const isPulsing = pulsingVariant === variant.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: isPulsing ? 1.03 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`rounded-xl border border-border bg-card overflow-hidden flex flex-col cursor-pointer select-none transition-shadow hover:shadow-md ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => !isDisabled && onAddToCart(product, variant)}
      title={`Add ${product.name} – ${variant.name} to cart`}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDisabled) onAddToCart(product, variant);
        }
      }}
    >
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
            {product.name.charAt(0)}
          </div>
        )}
        <div
          className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full ${stockDotColor[status]} ring-2 ring-card`}
          title={status.replace(/_/g, " ")}
        />
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-semibold text-card-foreground leading-tight line-clamp-2">
          {product.name}
        </p>
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {product.variants.map((v, idx) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIdx(idx);
                }}
                title={`Select ${v.name} variant`}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${idx === selectedIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
        <p className="text-sm font-bold text-primary mt-auto">
          {formatINR(variant.price_paisa)}
        </p>
      </div>
    </motion.div>
  );
};

const ProductListRow: React.FC<ProductTileProps> = ({
  product,
  pulsingVariant,
  onAddToCart,
  getStockStatus,
  stockDotColor,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const variant = product.variants[selectedIdx];
  if (!variant) return null;
  const status = getStockStatus(variant);
  const isDisabled = status === "out_of_stock";
  const isPulsing = pulsingVariant === variant.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0, scale: isPulsing ? 1.01 : 1 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15 }}
      className={`rounded-lg border border-border bg-card overflow-hidden flex items-center gap-3 px-3 py-2 cursor-pointer select-none transition-shadow hover:shadow-md ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => !isDisabled && onAddToCart(product, variant)}
      title={`Add ${product.name} – ${variant.name} to cart`}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDisabled) onAddToCart(product, variant);
        }
      }}
    >
      <div className="relative h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-bold">
            {product.name.charAt(0)}
          </div>
        )}
        <div
          className={`absolute top-0.5 right-0.5 h-2 w-2 rounded-full ${stockDotColor[status]} ring-1 ring-card`}
          title={status.replace(/_/g, " ")}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-card-foreground truncate">{product.name}</p>
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {product.variants.map((v, idx) => (
              <button
                key={v.id}
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(idx); }}
                title={`Select ${v.name} variant`}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${idx === selectedIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-primary">{formatINR(variant.price_paisa)}</p>
        <p className="text-[10px] text-muted-foreground">{variant.stock_quantity} in stock</p>
      </div>
    </motion.div>
  );
};