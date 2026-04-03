import React, { useState, useMemo } from "react";
import { DatePicker } from "@/admin/components/DatePicker";
import { useContent, useCustomers } from "@/admin/hooks/useAdminData";
import { useProducts } from "@/admin/hooks/useProducts";
import {
  ContentService,
  CouponService,
  ReviewService,
} from "@/admin/services/ContentService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { CMSSlider, CMSBanner, Coupon, CustomerReview } from "@/types";
import { Action, Module } from "@/constant/permissions";

const formatINR = (paisa: number) =>
  `₹${(paisa / 100).toLocaleString("en-IN")}`;

const AdminContentPage: React.FC = () => {
  const { sliders, banners, coupons, reviews, loading, refresh } = useContent();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [tab, setTab] = useState("sliders");

  const [sliderModal, setSliderModal] = useState(false);
  const [editSlider, setEditSlider] = useState<CMSSlider | null>(null);
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderLink, setSliderLink] = useState("");
  const [sliderActive, setSliderActive] = useState(true);

  const [bannerModal, setBannerModal] = useState(false);
  const [editBanner, setEditBanner] = useState<CMSBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerActive, setBannerActive] = useState(true);

  const [couponModal, setCouponModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percentage" | "flat_amount">(
    "percentage",
  );
  const [couponValue, setCouponValue] = useState(0);
  const [couponMinOrder, setCouponMinOrder] = useState(0);
  const [couponLimit, setCouponLimit] = useState<number | undefined>();
  const [couponExpiry, setCouponExpiry] = useState("");
  const [couponActive, setCouponActive] = useState(true);
  const [couponDesc, setCouponDesc] = useState("");
  const [sliderErrors, setSliderErrors] = useState<{ title?: string; link?: string }>({});
  const [bannerErrors, setBannerErrors] = useState<{ title?: string; link?: string }>({});
  const [couponErrors, setCouponErrors] = useState<{
    code?: string;
    value?: string;
    expiry?: string;
  }>({});

  const openSliderModal = (s?: CMSSlider) => {
    setSliderErrors({});
    setEditSlider(s || null);
    setSliderTitle(s?.title || "");
    setSliderLink(s?.link_url || "");
    setSliderActive(s?.is_active ?? true);
    setSliderModal(true);
  };

  const saveSlider = async () => {
    const err: typeof sliderErrors = {};
    if (!sliderTitle.trim()) err.title = "Headline is required";
    if (sliderLink.trim() && !/^https?:\/\//i.test(sliderLink.trim()))
      err.link = "Use a full URL starting with http:// or https://";
    if (Object.keys(err).length) {
      setSliderErrors(err);
      return;
    }
    setSliderErrors({});
    if (editSlider) {
      await ContentService.updateSlider(editSlider.id, {
        title: sliderTitle,
        link_url: sliderLink,
        is_active: sliderActive,
      });
    } else {
      await ContentService.createSlider({
        title: sliderTitle,
        image_url: "/placeholder.svg",
        link_url: sliderLink,
        sort_order: sliders.length + 1,
        is_active: sliderActive,
      });
    }
    toast.success(editSlider ? "Slider updated" : "Slider created");
    setSliderModal(false);
    refresh();
  };

  const deleteSlider = async (id: string) => {
    await ContentService.deleteSlider(id);
    toast.success("Slider deleted");
    refresh();
  };

  const openBannerModal = (b?: CMSBanner) => {
    setBannerErrors({});
    setEditBanner(b || null);
    setBannerTitle(b?.title || "");
    setBannerLink(b?.link_url || "");
    setBannerActive(b?.is_active ?? true);
    setBannerModal(true);
  };

  const saveBanner = async () => {
    const err: typeof bannerErrors = {};
    if (!bannerTitle.trim()) err.title = "Banner text is required";
    if (bannerLink.trim() && !/^https?:\/\//i.test(bannerLink.trim()))
      err.link = "Use a full URL starting with http:// or https://";
    if (Object.keys(err).length) {
      setBannerErrors(err);
      return;
    }
    setBannerErrors({});
    if (editBanner) {
      await ContentService.updateBanner(editBanner.id, {
        title: bannerTitle,
        link_url: bannerLink,
        is_active: bannerActive,
      });
    } else {
      await ContentService.createBanner({
        title: bannerTitle,
        image_url: "/placeholder.svg",
        link_url: bannerLink,
        position: "top",
        is_active: bannerActive,
      });
    }
    toast.success(editBanner ? "Banner updated" : "Banner created");
    setBannerModal(false);
    refresh();
  };

  const openCouponModal = (c?: Coupon) => {
    setCouponErrors({});
    setEditCoupon(c || null);
    setCouponCode(c?.code || "");
    setCouponType(c?.discount_type || "percentage");
    setCouponValue(c?.value || 0);
    setCouponMinOrder(c ? c.min_order_paisa / 100 : 0);
    setCouponLimit(c?.usage_limit);
    setCouponExpiry(c?.expiry_date ? c.expiry_date.split("T")[0] : "");
    setCouponActive(c?.is_active ?? true);
    setCouponDesc(c?.description || "");
    setCouponModal(true);
  };

  const saveCoupon = async () => {
    const err: typeof couponErrors = {};
    if (!couponCode.trim()) err.code = "Coupon code is required";
    if (!couponValue || couponValue <= 0) err.value = "Enter a positive discount value";
    if (!couponExpiry.trim()) err.expiry = "Expiry date is required";
    if (Object.keys(err).length) {
      setCouponErrors(err);
      return;
    }
    setCouponErrors({});
    const data = {
      code: couponCode.toUpperCase(),
      description: couponDesc,
      discount_type: couponType,
      value: couponValue,
      min_order_paisa: couponMinOrder * 100,
      surface: "storefront" as const,
      usage_limit: couponLimit,
      expiry_date: new Date(couponExpiry).toISOString(),
      is_active: couponActive,
    };
    if (editCoupon) {
      await CouponService.update(editCoupon.id, data);
    } else {
      await CouponService.create(data);
    }
    toast.success(editCoupon ? "Coupon updated" : "Coupon created");
    setCouponModal(false);
    refresh();
  };

  const handleReviewAction = async (
    id: string,
    action: "approve" | "reject" | "delete",
  ) => {
    if (action === "approve") await ReviewService.approve(id);
    else if (action === "reject") await ReviewService.reject(id);
    else await ReviewService.delete(id);
    toast.success(`Review ${action}d`);
    refresh();
  };

  const couponColumns: DataTableOneColumn<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      render: (c) => (
        <span className="text-[13px] font-mono font-semibold text-foreground">
          {c.code}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (c) => (
        <Badge variant="outline" className="text-[10px]">
          {c.discount_type === "percentage" ? "Percentage" : "Flat"}
        </Badge>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (c) => (
        <span className="text-[13px] text-foreground">
          {c.discount_type === "percentage"
            ? `${c.value}%`
            : formatINR(c.value)}
        </span>
      ),
    },
    {
      key: "minOrder",
      header: "Min Order",
      render: (c) => (
        <span className="text-[13px] text-muted-foreground">
          {formatINR(c.min_order_paisa)}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      render: (c) => (
        <span className="text-[13px] text-muted-foreground">
          {c.used_count}/{c.usage_limit ?? "∞"}
        </span>
      ),
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (c) => (
        <span className="text-[13px] text-muted-foreground">
          {format(new Date(c.expiry_date), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge
          variant="secondary"
          className={`text-[10px] ${c.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
        >
          {c.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => openCouponModal(c)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={async () => {
              await CouponService.delete(c.id);
              toast.success("Deleted");
              refresh();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const reviewColumns: DataTableOneColumn<CustomerReview>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <span className="text-[13px] text-foreground">
          {products.find((p) => p.id === r.product_id)?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {customers.find((c) => c.id === r.customer_id)?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < r.rating ? "text-warning fill-warning" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
      ),
    },
    {
      key: "review",
      header: "Review",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground truncate max-w-[200px] block">
          {r.body?.slice(0, 60)}...
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {format(new Date(r.created_at), "MMM dd")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant="secondary"
          className={`text-[10px] ${r.is_approved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
        >
          {r.is_approved ? "Published" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-1">
          {!r.is_approved && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-success"
              onClick={() => handleReviewAction(r.id, "approve")}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          {r.is_approved && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-warning"
              onClick={() => handleReviewAction(r.id, "reject")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => handleReviewAction(r.id, "delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Content Management
        </h2>
        {tab === "sliders" && (
          <PermissionGuard
            permission={{
              module: Module.CONTENT_SLIDERS,
              action: Action.CREATE,
            }}
          >
            <Button
              size="sm"
              onClick={() => openSliderModal()}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Add Slide</span>
            </Button>
          </PermissionGuard>
        )}

        {tab === "banners" && (
          <PermissionGuard
            permission={{
              module: Module.CONTENT_BANNERS,
              action: Action.CREATE,
            }}
          >
            <Button
              size="sm"
              onClick={() => openBannerModal()}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Add Banner</span>
            </Button>
          </PermissionGuard>
        )}

        {tab === "coupons" && (
          <PermissionGuard
            permission={{
              module: Module.CONTENT_BANNERS,
              action: Action.CREATE,
            }}
          >
            <Button
              size="sm"
              onClick={() => openCouponModal()}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Add Coupon</span>
            </Button>
          </PermissionGuard>
        )}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="sliders">Sliders</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="sliders" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sliders.map((s) => (
              <Card
                key={s.id}
                className="p-4 border border-border flex items-center gap-4"
              >
                <div className="h-16 w-24 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.link_url || "No link"}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] mt-1 ${s.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openSliderModal(s)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => deleteSlider(s.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="banners" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {banners.map((b) => (
              <Card
                key={b.id}
                className="p-4 border border-border flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">
                    {b.title}
                  </p>
                  {b.subtitle && (
                    <p className="text-[11px] text-muted-foreground">
                      {b.subtitle}
                    </p>
                  )}
                  <Badge
                    variant="secondary"
                    className={`text-[10px] mt-1 ${b.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                  >
                    {b.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openBannerModal(b)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={async () => {
                      await ContentService.deleteBanner(b.id);
                      toast.success("Deleted");
                      refresh();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="mt-4 space-y-3">
          <DataTableOne
            columns={couponColumns}
            data={coupons}
            keyExtractor={(c) => c.id}
            loading={loading}
            emptyMessage="No coupons"
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <DataTableOne
            columns={reviewColumns}
            data={reviews}
            keyExtractor={(r) => r.id}
            loading={loading}
            emptyMessage="No reviews"
          />
        </TabsContent>
      </Tabs>

      <ResponsiveModal
        open={sliderModal}
        onOpenChange={(v) => {
          setSliderModal(v);
          if (!v) setSliderErrors({});
        }}
        title={editSlider ? "Edit Slider" : "Add Slider"}
      >
        <div className="space-y-4 pb-16">
          <ModalFormField label="Headline" error={sliderErrors.title}>
            {(id) => (
              <Input
                id={id}
                placeholder="New arrivals"
                value={sliderTitle}
                onChange={(e) => {
                  setSliderTitle(e.target.value);
                  if (sliderErrors.title) setSliderErrors((p) => ({ ...p, title: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Link URL" error={sliderErrors.link} description="Optional; full https URL">
            {(id) => (
              <Input
                id={id}
                placeholder="https://…"
                value={sliderLink}
                onChange={(e) => {
                  setSliderLink(e.target.value);
                  if (sliderErrors.link) setSliderErrors((p) => ({ ...p, link: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <div className="flex items-center gap-3">
            <Switch id="slider-active" checked={sliderActive} onCheckedChange={setSliderActive} />
            <label htmlFor="slider-active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSliderModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveSlider}>
            {editSlider ? "Update" : "Create"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={bannerModal}
        onOpenChange={(v) => {
          setBannerModal(v);
          if (!v) setBannerErrors({});
        }}
        title={editBanner ? "Edit Banner" : "Add Banner"}
      >
        <div className="space-y-4 pb-16">
          <ModalFormField label="Banner text" error={bannerErrors.title}>
            {(id) => (
              <Input
                id={id}
                placeholder="Free shipping over ₹999"
                value={bannerTitle}
                onChange={(e) => {
                  setBannerTitle(e.target.value);
                  if (bannerErrors.title) setBannerErrors((p) => ({ ...p, title: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Link URL" error={bannerErrors.link} description="Optional">
            {(id) => (
              <Input
                id={id}
                placeholder="https://…"
                value={bannerLink}
                onChange={(e) => {
                  setBannerLink(e.target.value);
                  if (bannerErrors.link) setBannerErrors((p) => ({ ...p, link: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <div className="flex items-center gap-3">
            <Switch id="banner-active" checked={bannerActive} onCheckedChange={setBannerActive} />
            <label htmlFor="banner-active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setBannerModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveBanner}>
            {editBanner ? "Update" : "Create"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={couponModal}
        onOpenChange={(v) => {
          setCouponModal(v);
          if (!v) setCouponErrors({});
        }}
        title={editCoupon ? "Edit Coupon" : "Add Coupon"}
      >
        <div className="space-y-4 pb-16">
          <ModalFormField label="Code" error={couponErrors.code}>
            {(id) => (
              <div className="flex gap-2">
                <Input
                  id={id}
                  placeholder="SUMMER10"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    if (couponErrors.code) setCouponErrors((p) => ({ ...p, code: undefined }));
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCouponCode(
                      `MKW${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                    )
                  }
                >
                  Generate
                </Button>
              </div>
            )}
          </ModalFormField>
          <ModalFormField label="Description" description="Internal / customer-facing note">
            {(id) => (
              <Input
                id={id}
                placeholder="10% off summer collection"
                value={couponDesc}
                onChange={(e) => setCouponDesc(e.target.value)}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Discount type">
            {(id) => (
              <Select
                value={couponType}
                onValueChange={(v) => setCouponType(v as typeof couponType)}
              >
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat_amount">Flat Amount</SelectItem>
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          <ModalFormField
            label={couponType === "percentage" ? "Percentage off" : "Amount off"}
            error={couponErrors.value}
            description={couponType === "percentage" ? "e.g. 10 for 10%" : "In rupees"}
          >
            {(id) => (
              <Input
                id={id}
                type="number"
                step="0.01"
                placeholder={couponType === "percentage" ? "10" : "100"}
                value={couponValue || ""}
                onChange={(e) => {
                  setCouponValue(Number(e.target.value));
                  if (couponErrors.value) setCouponErrors((p) => ({ ...p, value: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Minimum order" description="In rupees">
            {(id) => (
              <Input
                id={id}
                type="number"
                placeholder="0"
                value={couponMinOrder || ""}
                onChange={(e) => setCouponMinOrder(Number(e.target.value))}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Usage limit" description="Optional cap on redemptions">
            {(id) => (
              <Input
                id={id}
                type="number"
                placeholder="Unlimited"
                value={couponLimit ?? ""}
                onChange={(e) =>
                  setCouponLimit(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            )}
          </ModalFormField>
          <ModalFormField label="Expiry date" error={couponErrors.expiry}>
            {() => (
              <DatePicker
                value={couponExpiry}
                onChange={(d) => {
                  setCouponExpiry(d);
                  if (couponErrors.expiry) setCouponErrors((p) => ({ ...p, expiry: undefined }));
                }}
                placeholder="Select expiry"
              />
            )}
          </ModalFormField>
          <div className="flex items-center gap-3">
            <Switch id="coupon-active" checked={couponActive} onCheckedChange={setCouponActive} />
            <label htmlFor="coupon-active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCouponModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveCoupon}>
            {editCoupon ? "Update" : "Create"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default AdminContentPage;
