import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CreditCard, ClipboardCheck, Plus, Check } from "lucide-react";
import { useStorefrontAddresses } from "@/storefront/hooks/useStorefrontAddresses";
import { useStorefrontSelector } from "@/storefront/store/storefrontStore";
import type { CustomerAddress } from "@/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const steps = [
  { label: "Address", icon: MapPin },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: ClipboardCheck },
];

const addressFields = [
  { label: "Full Name", key: "name", full: false },
  { label: "Phone", key: "phone", full: false },
  { label: "Address Line 1", key: "line1", full: true },
  { label: "Address Line 2", key: "line2", full: true },
  { label: "City", key: "city", full: false },
  { label: "State", key: "state", full: false },
  { label: "Pincode", key: "pincode", full: false },
] as const;

const paymentOptions = [
  {
    id: "cod" as const,
    label: "Cash on Delivery",
    desc: "Amount collected on delivery.",
  },
  {
    id: "online" as const,
    label: "Online Payment",
    desc: "You will be redirected to payment gateway.",
  },
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const cartItems = useStorefrontSelector((state) => state.cart.items);
  const { addresses } = useStorefrontAddresses();

  const [step, setStep] = useState(0);
  const [selectedAddr, setSelectedAddr] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cod" | "online">("cod");
  const [loading, setLoading] = useState(false);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddr) || addresses[0];

  const displayItems = useMemo(() => {
    if (cartItems.length > 0) {
      return cartItems.map((item) => ({
        name: item.productName,
        variant: item.variantName,
        qty: item.quantity,
        price_paisa: item.pricePaisa,
      }));
    }
    return [
      { name: "Pan Mukhwas", variant: "100g", qty: 2, price_paisa: 34900 },
      { name: "Meetha Saunf", variant: "50g", qty: 1, price_paisa: 14900 },
    ];
  }, [cartItems]);

  const subtotal = displayItems.reduce((s, i) => s + i.price_paisa * i.qty, 0);
  const tax = Math.round(subtotal * 0.12);
  const shipping = subtotal > 50000 ? 0 : 4900;
  const total = subtotal + tax + shipping;

  const placeOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    navigate("/order-confirmation?orderId=MKW-2025-NEW");
  };

  const OrderSummary = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black uppercase tracking-[0.1em]">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {displayItems.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.name} ({item.variant}) × {item.qty}
            </span>
            <span className="font-medium text-foreground">
              {formatPrice(item.price_paisa * item.qty)}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (12% GST)</span>
            <span className="text-foreground">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground">
              {shipping === 0 ? "Free" : formatPrice(shipping)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-black">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="bg-[hsl(var(--sf-cream))] min-h-screen py-10">
      <div className="max-w-[1100px] mx-auto px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-8">
          Checkout
        </h1>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div
                className={`flex items-center gap-2 ${i <= step ? "text-[hsl(var(--sf-red))]" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < step
                      ? "bg-success text-white"
                      : i === step
                        ? "bg-[hsl(var(--sf-red))] text-white"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.1em] hidden sm:inline">
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${i < step ? "bg-success" : "bg-border"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Address */}
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                    Delivery Address
                  </h2>
                  <RadioGroup
                    value={selectedAddr}
                    onValueChange={setSelectedAddr}
                    className="flex flex-col gap-3"
                  >
                    {addresses.map((addr) => (
                      <Label
                        key={addr.id}
                        htmlFor={`addr-${addr.id}`}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          selectedAddr === addr.id
                            ? "border-[hsl(var(--sf-red))] bg-[hsl(var(--sf-red)/0.05)]"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem
                          id={`addr-${addr.id}`}
                          value={addr.id}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {addr.line1}
                          </p>
                          {addr.line2 && (
                            <p className="text-sm text-muted-foreground">
                              {addr.line2}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          {addr.is_default && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary mt-1"
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-dashed justify-start font-bold text-muted-foreground hover:text-primary hover:border-primary"
                    onClick={() => setShowNewAddr(!showNewAddr)}
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </Button>

                  {showNewAddr && (
                    <Card>
                      <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addressFields.map((f) => (
                          <div
                            key={f.key}
                            className={f.full ? "sm:col-span-2" : ""}
                          >
                            <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground mb-1 block">
                              {f.label}
                            </Label>
                            <Input
                              value={newAddr[f.key]}
                              onChange={(e) =>
                                setNewAddr((p) => ({
                                  ...p,
                                  [f.key]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    disabled={!selectedAddr}
                    onClick={() => setStep(1)}
                    className="h-12 bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))] mt-2"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                    Payment Method
                  </h2>
                  <RadioGroup
                    value={paymentMode}
                    onValueChange={(v) => setPaymentMode(v as "cod" | "online")}
                    className="flex flex-col gap-3"
                  >
                    {paymentOptions.map((pm) => (
                      <Label
                        key={pm.id}
                        htmlFor={`pm-${pm.id}`}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMode === pm.id
                            ? "border-[hsl(var(--sf-red))] bg-[hsl(var(--sf-red)/0.05)]"
                            : "border-border bg-card"
                        }`}
                      >
                        <RadioGroupItem
                          id={`pm-${pm.id}`}
                          value={pm.id}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {pm.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {pm.desc}
                          </p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                  <div className="flex gap-3 mt-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 font-bold border-2"
                      onClick={() => setStep(0)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 h-12 bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))]"
                      onClick={() => setStep(2)}
                    >
                      Review Order
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                    Review & Place Order
                  </h2>

                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-2">
                        Delivery Address
                      </p>
                      {selectedAddress && (
                        <p className="text-sm text-foreground">
                          {selectedAddress.line1}
                          {selectedAddress.line2
                            ? `, ${selectedAddress.line2}`
                            : ""}
                          , {selectedAddress.city}, {selectedAddress.state} —{" "}
                          {selectedAddress.pincode}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-2">
                        Payment
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {paymentMode === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-3">
                        Items
                      </p>
                      {displayItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between py-2 text-sm border-b border-border last:border-0"
                        >
                          <span className="text-foreground">
                            {item.name} ({item.variant}) × {item.qty}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatPrice(item.price_paisa * item.qty)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 font-bold border-2"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      disabled={loading}
                      onClick={placeOrder}
                      className="flex-1 h-12 bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-[hsl(var(--sf-brown))]"
                    >
                      {loading ? "Placing order..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:w-[360px] shrink-0">
            <div className="sticky top-[100px]">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
