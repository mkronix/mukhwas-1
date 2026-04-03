import React, { useMemo } from "react"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { ShoppingBag, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  useStorefrontDispatch,
  useStorefrontSelector,
} from "@/storefront/store/storefrontStore"
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  clearCart,
  closeDrawer,
  selectCartDrawerOpen,
} from "@/storefront/store/cartSlice"
import type { Product } from "@/types"
import ProductCard from "../shared/ProductCard"

const formatPrice = (paisa: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paisa / 100)

const mapCartItemsToProducts = (items: any[]): Product[] =>
  items.map((item) => ({
    id: item.productId,
    name: item.productName,
    slug: item.productSlug,

    description: "",
    category_id: "",
    subcategory_id: undefined,
    base_price_paisa: item.pricePaisa,
    gst_slab: 0 as any,
    hsn_code: "",
    inventory_mode: "" as any,
    is_active: true,

    image_url: item.imageUrl,
    images: [item.imageUrl],

    variants: [
      {
        id: item.variantId,
        product_id: item.productId,
        name: item.variantName,
        sku: "",
        weight_grams: 0,
        price_paisa: item.pricePaisa,
        compare_at_price_paisa: undefined,
        stock_quantity: item.maxStock,
        low_stock_threshold: 0,
        is_active: true,
      },
    ],

    ui: undefined,

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
const CartDrawer: React.FC = () => {
  const dispatch = useStorefrontDispatch()
  const navigate = useNavigate()

  const open = useStorefrontSelector(selectCartDrawerOpen)
  const items = useStorefrontSelector(selectCartItems)
  const count = useStorefrontSelector(selectCartCount)
  const total = useStorefrontSelector(selectCartTotal)

  const products = useMemo(
    () => mapCartItemsToProducts(items),
    [items]
  )

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        if (!v) dispatch(closeDrawer())
      }}
      modal
    >
      <DrawerContent className="sf-theme h-[92vh] flex flex-col bg-[hsl(var(--sf-cream))]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--sf-gold)/0.2)]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[hsl(var(--sf-brown))]" />
            <h2 className="font-black text-lg uppercase tracking-wide text-[hsl(var(--sf-brown))]">
              Your Cart ({count})
            </h2>
            <span className="font-black text-lg text-[hsl(var(--sf-brown))]">
              {formatPrice(total)}
            </span>
          </div>

          <button
            onClick={() => dispatch(closeDrawer())}
            className="p-2 text-[hsl(var(--sf-brown-mid))] hover:text-[hsl(var(--sf-red))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - horizontal scroll */}
        <div className="flex-1 overflow-x-scroll whitespace-nowrap overflow-y-hidden p-4">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-[hsl(var(--sf-brown)/0.2)] mb-4" />
              <p className="font-bold text-[hsl(var(--sf-brown))] text-lg mb-1">
                Your cart is empty
              </p>
              <p className="text-sm text-[hsl(var(--sf-brown-mid))]">
                Add some products
              </p>
            </div>
          ) : (
            <div className="flex gap-5 min-w-max">
              {products.map((product) => (
                <div key={product.id} className="w-[350px] ">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div className="border-t border-[hsl(var(--sf-gold)/0.2)] p-4 space-y-3">

            <div className="flex gap-3">
              <button
                onClick={() => {
                  dispatch(closeDrawer())
                  navigate("/store")
                }}
                className="flex-1 h-12 rounded-xl bg-[hsl(var(--sf-cream))] text-[hsl(var(--sf-brown))] font-bold border border-[hsl(var(--sf-brown)/0.15)] hover:bg-white transition-colors"
              >
                Add More
              </button>

              <button
                onClick={() => {
                  dispatch(closeDrawer())
                  navigate("/checkout")
                }}
                className="flex-1 h-12 rounded-xl bg-[hsl(var(--sf-red))] text-white font-bold hover:bg-[hsl(var(--sf-brown))] transition-colors"
              >
                Checkout
              </button>
            </div>
            {/* <button
              onClick={() => dispatch(clearCart())}
              className="w-full text-center text-xs text-[hsl(var(--sf-brown-mid))] hover:text-[hsl(var(--sf-red))] transition-colors py-1"
            >
              Clear Cart
            </button> */}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer