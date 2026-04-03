import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/admin/hooks/useProducts";
import { ProductService } from "@/admin/services/ProductService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Archive, X } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/types";
import { Action, Module } from "@/constant/permissions";

const formatINR = (paisa: number) =>
  `₹${(paisa / 100).toLocaleString("en-IN")}`;

const AdminProductsPage: React.FC = () => {
  const { products, categories, loading, refresh } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formMode, setFormMode] = useState<
    "finished_goods" | "recipe_realtime"
  >("finished_goods");
  const [formVariants, setFormVariants] = useState<Partial<ProductVariant>[]>([
    {
      name: "100g",
      sku: "",
      weight_grams: 100,
      price_paisa: 0,
      stock_quantity: 0,
      low_stock_threshold: 10,
      is_active: true,
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [productErrors, setProductErrors] = useState<{
    name?: string;
    category?: string;
    variants?: string;
  }>({});

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && products.length > 0) {
      const product = products.find((p) => p.id === editId);
      if (product) {
        openEdit(product);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.includes(q),
      );
    }
    if (filterCategory !== "all")
      list = list.filter((p) => p.category_id === filterCategory);
    if (filterStatus !== "all")
      list = list.filter((p) =>
        filterStatus === "active" ? p.is_active : !p.is_active,
      );
    if (filterMode !== "all")
      list = list.filter((p) => p.inventory_mode === filterMode);
    return list;
  }, [products, search, filterCategory, filterStatus, filterMode]);

  const openCreate = () => {
    setProductErrors({});
    setEditProduct(null);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormCategory("");
    setFormActive(true);
    setFormMode("finished_goods");
    setFormVariants([
      {
        name: "100g",
        sku: "",
        weight_grams: 100,
        price_paisa: 0,
        stock_quantity: 0,
        low_stock_threshold: 10,
        is_active: true,
      },
    ]);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setProductErrors({});
    setEditProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormDesc(p.description);
    setFormCategory(p.category_id);
    setFormActive(p.is_active);
    setFormMode(p.inventory_mode);
    setFormVariants([...p.variants]);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const err: typeof productErrors = {};
    if (!formName.trim()) err.name = "Product name is required";
    if (!formCategory) err.category = "Select a category";
    let badV = false;
    for (const v of formVariants) {
      if (!v.name?.trim() || !String(v.sku ?? "").trim()) {
        badV = true;
        break;
      }
    }
    if (badV) err.variants = "Each variant needs a name and SKU";
    if (Object.keys(err).length) {
      setProductErrors(err);
      return;
    }
    setProductErrors({});
    setSaving(true);
    try {
      const slug =
        formSlug ||
        formName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      const data = {
        name: formName,
        slug,
        description: formDesc,
        category_id: formCategory,
        base_price_paisa: formVariants[0]?.price_paisa ?? 0,
        gst_slab: "5" as const,
        hsn_code: "0909",
        inventory_mode: formMode,
        is_active: formActive,
        images: ["/placeholder.svg"],
        variants: formVariants.map((v, i) => ({
          id: v.id || `v_new_${Date.now()}_${i}`,
          product_id: editProduct?.id || "",
          name: v.name || "100g",
          sku:
            v.sku ||
            `${slug.toUpperCase().slice(0, 4)}-${v.weight_grams ?? 100}`,
          weight_grams: v.weight_grams || 100,
          price_paisa: v.price_paisa || 0,
          compare_at_price_paisa: v.compare_at_price_paisa,
          stock_quantity: v.stock_quantity || 0,
          low_stock_threshold: v.low_stock_threshold || 10,
          is_active: v.is_active ?? true,
        })),
      };
      if (editProduct) {
        await ProductService.update(editProduct.id, data);
        toast.success("Product updated");
      } else {
        await ProductService.create(
          data as Parameters<typeof ProductService.create>[0],
        );
        toast.success("Product created");
      }
      setModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    await ProductService.archive(id);
    toast.success("Product archived");
    refresh();
  };

  const addVariant = () => {
    setFormVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        weight_grams: 100,
        price_paisa: 0,
        stock_quantity: 0,
        low_stock_threshold: 10,
        is_active: true,
      },
    ]);
  };

  const updateVariant = (index: number, field: string, value: unknown) => {
    setFormVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const removeVariant = (index: number) => {
    if (formVariants.length <= 1) return;
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const columns: DataTableOneColumn<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              p.name[0]
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">
              {p.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {categories.find((c) => c.id === p.category_id)?.name ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "variants",
      header: "Variants",
      render: (p) => (
        <span className="text-[13px] text-muted-foreground">
          {p.variants.length}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price Range",
      sortable: true,
      sortValue: (p) => Math.min(...p.variants.map((v) => v.price_paisa)),
      render: (p) => {
        const prices = p.variants.map((v) => v.price_paisa);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return (
          <span className="text-[13px] font-medium text-foreground">
            {min === max
              ? formatINR(min)
              : `${formatINR(min)} – ${formatINR(max)}`}
          </span>
        );
      },
    },
    {
      key: "mode",
      header: "Inventory",
      render: (p) => (
        <Badge variant="outline" className="text-[10px]">
          {p.inventory_mode === "finished_goods"
            ? "Finished Goods"
            : "Recipe RT"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge
          variant="secondary"
          className={`text-[10px] ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
        >
          {p.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex items-center gap-1 justify-end">
          <PermissionGuard
            permission={{ module: Module.PRODUCTS, action: Action.UPDATE }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEdit(p)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={{ module: Module.PRODUCTS, action: Action.DELETE }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => handleArchive(p.id)}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Products</h2>
        <PermissionGuard
          permission={{ module: Module.PRODUCTS, action: Action.CREATE }}
        >
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />{" "}
            <span className="lg:inline hidden">Add Product</span>
          </Button>
        </PermissionGuard>
      </div>

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.id}
        loading={loading}
        emptyMessage="No products found"
        toolbarFilters={
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 text-xs"
            />
          </div>
        }
        filters={[
          {
            key: "category",
            label: "Category",
            value: filterCategory,
            options: categories.map((c) => ({ label: c.name, value: c.id })),
            onChange: setFilterCategory,
          },
          {
            key: "status",
            label: "Status",
            value: filterStatus,
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
            onChange: setFilterStatus,
          },
          {
            key: "mode",
            label: "Inventory Mode",
            value: filterMode,
            options: [
              { label: "Finished Goods", value: "finished_goods" },
              { label: "Recipe RT", value: "recipe_realtime" },
            ],
            onChange: setFilterMode,
          },
        ]}
      />

      <ResponsiveModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setProductErrors({});
        }}
        title={editProduct ? "Edit Product" : "Add Product"}
      >
        <div className="space-y-5 pb-20">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Basic Info
            </h4>
            <ModalFormField label="Product name" error={productErrors.name}>
              {(id) => (
                <Input
                  id={id}
                  placeholder="Royal Mukhwas"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (productErrors.name) setProductErrors((p) => ({ ...p, name: undefined }));
                    if (!editProduct)
                      setFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, ""),
                      );
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Slug" description="URL key; lowercase">
              {(id) => (
                <Input
                  id={id}
                  placeholder="royal-mukhwas"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="text-xs"
                />
              )}
            </ModalFormField>
            <ModalFormField label="Category" error={productErrors.category}>
              {(id) => (
                <Select
                  value={formCategory || undefined}
                  onValueChange={(v) => {
                    setFormCategory(v);
                    if (productErrors.category) setProductErrors((p) => ({ ...p, category: undefined }));
                  }}
                >
                  <SelectTrigger id={id}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
            <ModalFormField label="Description" description="Shown on storefront">
              {(id) => (
                <Textarea
                  id={id}
                  placeholder="Aromatic blend…"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                />
              )}
            </ModalFormField>
            <div className="flex items-center gap-3">
              <Switch id="product-active" checked={formActive} onCheckedChange={setFormActive} />
              <label htmlFor="product-active" className="text-sm font-medium text-foreground">
                Active
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Variants
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addVariant();
                  if (productErrors.variants) setProductErrors((p) => ({ ...p, variants: undefined }));
                }}
                className="gap-1 text-xs"
              >
                <Plus className="h-3 w-3" /> Add Variant
              </Button>
            </div>
            {productErrors.variants ? (
              <p className="text-sm font-medium text-destructive">{productErrors.variants}</p>
            ) : null}
            {formVariants.map((v, i) => (
              <div
                key={i}
                className="p-3 border border-border flex flex-col rounded-lg space-y-3 relative"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ModalFormField label="Variant name">
                    {(id) => (
                      <Input
                        id={id}
                        placeholder="100g pouch"
                        value={v.name || ""}
                        onChange={(e) => {
                          updateVariant(i, "name", e.target.value);
                          if (productErrors.variants) setProductErrors((p) => ({ ...p, variants: undefined }));
                        }}
                        className="text-xs"
                      />
                    )}
                  </ModalFormField>
                  <ModalFormField label="SKU">
                    {(id) => (
                      <Input
                        id={id}
                        placeholder="RM-100G"
                        value={v.sku || ""}
                        onChange={(e) => {
                          updateVariant(i, "sku", e.target.value);
                          if (productErrors.variants) setProductErrors((p) => ({ ...p, variants: undefined }));
                        }}
                        className="text-xs"
                      />
                    )}
                  </ModalFormField>
                  <ModalFormField label="Price" description="₹ incl. tax display per your rules">
                    {(id) => (
                      <Input
                        id={id}
                        type="number"
                        step="0.01"
                        placeholder="299"
                        value={v.price_paisa ? v.price_paisa / 100 : ""}
                        onChange={(e) =>
                          updateVariant(
                            i,
                            "price_paisa",
                            Number(e.target.value) * 100,
                          )
                        }
                        className="text-xs"
                      />
                    )}
                  </ModalFormField>
                  <ModalFormField label="Weight (g)">
                    {(id) => (
                      <Input
                        id={id}
                        type="number"
                        placeholder="100"
                        value={v.weight_grams || ""}
                        onChange={(e) =>
                          updateVariant(i, "weight_grams", Number(e.target.value))
                        }
                        className="text-xs"
                      />
                    )}
                  </ModalFormField>
                  <ModalFormField label="Stock qty">
                    {(id) => (
                      <Input
                        id={id}
                        type="number"
                        placeholder="0"
                        value={v.stock_quantity ?? ""}
                        onChange={(e) =>
                          updateVariant(i, "stock_quantity", Number(e.target.value))
                        }
                        className="text-xs"
                      />
                    )}
                  </ModalFormField>
                  <ModalFormField label="Reorder level">
                    {(id) => (
                      <Input
                        id={id}
                        type="number"
                        placeholder="10"
                        value={v.low_stock_threshold ?? ""}
                        onChange={(e) =>
                          updateVariant(
                            i,
                            "low_stock_threshold",
                            Number(e.target.value),
                          )
                        }
                        className="text-xs"
                      />
                    )}
                  </ModalFormField>
                </div>
                {formVariants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="bg-primary self-end p-2 rounded-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Inventory Settings
            </h4>
            <ModalFormField label="Inventory mode">
              {(id) => (
                <Select
                  value={formMode}
                  onValueChange={(v) => setFormMode(v as typeof formMode)}
                >
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finished_goods">Finished Goods</SelectItem>
                    <SelectItem value="recipe_realtime">Recipe Realtime</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
            {formMode === "recipe_realtime" && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Recipe is managed in the Manufacturing module. Stock is
                calculated in realtime based on raw material availability.
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border pt-3 flex justify-end gap-2 ">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? "Saving..."
              : editProduct
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default AdminProductsPage;
