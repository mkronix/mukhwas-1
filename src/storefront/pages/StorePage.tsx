import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/storefront/components/shared/ProductCard";
import { useStorefrontProducts } from "@/storefront/hooks/useStorefrontProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

const weightOptions = ["50g", "100g", "250g"];

const StorePage: React.FC = () => {
  const {
    products: allProducts,
    categories,
    loading,
  } = useStorefrontProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const selectedCategories = useMemo(
    () => searchParams.getAll("category"),
    [searchParams],
  );
  const selectedWeights = useMemo(
    () => searchParams.getAll("weight"),
    [searchParams],
  );
  const sortBy = searchParams.get("sort") || "featured";
  const inStockOnly = searchParams.get("inStock") === "true";
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 200000);
  const page = Number(searchParams.get("page") || 1);
  const perPage = 12;

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        next.delete(k);
        if (v === null) return;
        if (Array.isArray(v)) v.forEach((val) => next.append(k, val));
        else next.set(k, v);
      });
      if (!updates.page) next.set("page", "1");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const toggleArrayParam = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next.length ? next : null });
  };

  const clearAllFilters = () =>
    updateParams({
      category: null,
      weight: null,
      inStock: null,
      minPrice: null,
      maxPrice: null,
    });

  const filtered = useMemo(() => {
    let products = [...allProducts].filter((p) => p.is_active);
    if (selectedCategories.length)
      products = products.filter((p) =>
        selectedCategories.includes(p.category_id),
      );
    if (selectedWeights.length)
      products = products.filter((p) =>
        p.variants.some((v) => selectedWeights.includes(v.name)),
      );
    if (inStockOnly)
      products = products.filter((p) =>
        p.variants.some((v) => v.stock_quantity > 0),
      );
    products = products.filter((p) => {
      const min = Math.min(...p.variants.map((v) => v.price_paisa));
      return min >= minPrice && min <= maxPrice;
    });
    switch (sortBy) {
      case "newest":
        products.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "price-low":
        products.sort(
          (a, b) =>
            Math.min(...a.variants.map((v) => v.price_paisa)) -
            Math.min(...b.variants.map((v) => v.price_paisa)),
        );
        break;
      case "price-high":
        products.sort(
          (a, b) =>
            Math.min(...b.variants.map((v) => v.price_paisa)) -
            Math.min(...a.variants.map((v) => v.price_paisa)),
        );
        break;
      default:
        break;
    }
    return products;
  }, [
    allProducts,
    selectedCategories,
    selectedWeights,
    sortBy,
    inStockOnly,
    minPrice,
    maxPrice,
  ]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const activeFilterCount =
    selectedCategories.length + selectedWeights.length + (inStockOnly ? 1 : 0);

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[hsl(var(--sf-brown))] mb-3">
          Category
        </p>
        <div className="flex flex-col gap-2.5">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() =>
                  toggleArrayParam("category", cat.id, selectedCategories)
                }
              />
              <Label
                htmlFor={`cat-${cat.id}`}
                className="text-sm text-[hsl(var(--sf-brown-mid))] cursor-pointer font-normal"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[hsl(var(--sf-brown))] mb-3">
          Weight
        </p>
        <div className="flex flex-col gap-2.5">
          {weightOptions.map((w) => (
            <div key={w} className="flex items-center gap-2.5">
              <Checkbox
                id={`weight-${w}`}
                checked={selectedWeights.includes(w)}
                onCheckedChange={() =>
                  toggleArrayParam("weight", w, selectedWeights)
                }
              />
              <Label
                htmlFor={`weight-${w}`}
                className="text-sm text-[hsl(var(--sf-brown-mid))] cursor-pointer font-normal"
              >
                {w}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[hsl(var(--sf-brown))] mb-3">
          Availability
        </p>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="instock"
            checked={inStockOnly}
            onCheckedChange={() =>
              updateParams({ inStock: inStockOnly ? null : "true" })
            }
          />
          <Label
            htmlFor="instock"
            className="text-sm text-[hsl(var(--sf-brown-mid))] cursor-pointer font-normal"
          >
            In stock only
          </Label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs font-bold text-[hsl(var(--sf-red))] uppercase tracking-[0.1em] h-auto p-0 self-start hover:bg-transparent hover:underline"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <section className="bg-[hsl(var(--sf-cream))] min-h-screen">
      <div className="bg-[hsl(var(--sf-brown))] py-16 md:py-20">
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-black text-white uppercase tracking-tight"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
          >
            Our Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mt-3 text-sm md:text-base"
          >
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} —
            handcrafted with pure ingredients
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="flex gap-10">
          <aside className="hidden lg:block w-[220px] shrink-0 sticky top-[100px] self-start">
            <FilterContent />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8 gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterOpen(true)}
                className="lg:hidden gap-2 border-2 border-[hsl(var(--sf-brown)/0.2)] text-[hsl(var(--sf-brown))] font-black uppercase tracking-[0.1em] text-xs hover:border-[hsl(var(--sf-red))]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="w-5 h-5 p-0 text-[10px] font-bold flex items-center justify-center bg-[hsl(var(--sf-red))] rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <div className="ml-auto">
                <Select
                  value={sortBy}
                  onValueChange={(v) => updateParams({ sort: v })}
                >
                  <SelectTrigger className="w-[190px] text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((o) => (
                      <SelectItem
                        key={o.value}
                        value={o.value}
                        className="text-sm"
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xl font-bold text-foreground mb-2">
                  No products found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      size="icon"
                      variant={p === page ? "default" : "secondary"}
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? "bg-[hsl(var(--sf-red))] hover:bg-[hsl(var(--sf-red))]" : ""}`}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent
          side="left"
          className="w-[300px] bg-[hsl(var(--sf-cream))] p-0"
        >
          <SheetHeader className="px-6 h-14 border-b border-border flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-sm font-black uppercase tracking-[0.1em]">
              Filters
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 h-[calc(100vh-56px)]">
            <div className="px-6 py-6">
              <FilterContent />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default StorePage;
