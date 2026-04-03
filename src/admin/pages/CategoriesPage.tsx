import React, { useState, useMemo } from "react";
import { useCategories, useProducts } from "@/admin/hooks/useProducts";
import { CategoryService } from "@/admin/services/ProductService";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import type { Category, Subcategory } from "@/types";
import { Action, Module } from "@/constant/permissions";

const AdminCategoriesPage: React.FC = () => {
  const { categories, subcategories, loading, refresh } = useCategories();
  const { products } = useProducts();
  const [selected, setSelected] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editSub, setEditSub] = useState<Subcategory | null>(null);
  const [parentForSub, setParentForSub] = useState<string>("");

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subFormName, setSubFormName] = useState("");
  const [subFormSlug, setSubFormSlug] = useState("");
  const [subFormActive, setSubFormActive] = useState(true);
  const [subFieldErrors, setSubFieldErrors] = useState<{ name?: string; slug?: string }>({});

  const selectCategory = (cat: Category) => {
    setCreatingCategory(false);
    setSelected(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description || "");
    setFormActive(cat.is_active);
  };

  const handleCreateCategory = () => {
    setSelected(null);
    setCreatingCategory(true);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormActive(true);
  };

  const handleSaveCategory = async () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const slug = formSlug || formName.toLowerCase().replace(/\s+/g, "-");
      if (selected) {
        await CategoryService.update(selected.id, {
          name: formName,
          slug,
          description: formDesc,
          is_active: formActive,
        });
        toast.success("Category updated");
      } else {
        await CategoryService.create({
          name: formName,
          slug,
          description: formDesc,
          is_active: formActive,
          sort_order: categories.length + 1,
        });
        toast.success("Category created");
      }
      refresh();
      setCreatingCategory(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selected) return;
    const count = products.filter((p) => p.category_id === selected.id).length;
    if (count > 0) {
      toast.error(`Cannot delete: ${count} products use this category`);
      return;
    }
    await CategoryService.delete(selected.id);
    toast.success("Category deleted");
    setSelected(null);
    setCreatingCategory(false);
    refresh();
  };

  const openSubModal = (parentId: string, sub?: Subcategory) => {
    setSubFieldErrors({});
    setParentForSub(parentId);
    setEditSub(sub || null);
    setSubFormName(sub?.name || "");
    setSubFormSlug(sub?.slug || "");
    setSubFormActive(sub?.is_active ?? true);
    setSubModalOpen(true);
  };

  const handleSaveSub = async () => {
    const err: { name?: string; slug?: string } = {};
    if (!subFormName.trim()) err.name = "Subcategory name is required";
    const slug = subFormSlug.trim() || subFormName.toLowerCase().replace(/\s+/g, "-");
    if (!slug.trim()) err.slug = "Slug is required";
    if (Object.keys(err).length) {
      setSubFieldErrors(err);
      return;
    }
    setSubFieldErrors({});
    if (editSub) {
      await CategoryService.updateSubcategory(editSub.id, {
        name: subFormName,
        slug,
        is_active: subFormActive,
      });
      toast.success("Subcategory updated");
    } else {
      const subs = subcategories.filter((s) => s.category_id === parentForSub);
      await CategoryService.createSubcategory({
        category_id: parentForSub,
        name: subFormName,
        slug,
        sort_order: subs.length + 1,
        is_active: subFormActive,
      });
      toast.success("Subcategory created");
    }
    setSubModalOpen(false);
    refresh();
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Categories</h2>
        <PermissionGuard
          permission={{ module: Module.CATEGORIES, action: Action.CREATE }}
        >
          <Button size="sm" onClick={handleCreateCategory} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="lg:inline hidden">Add Category</span>
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 border border-border rounded-xl bg-card p-4 space-y-1">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading...
            </p>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderTree className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No categories yet</p>
            </div>
          ) : (
            categories.map((cat) => {
              const subs = subcategories.filter(
                (s) => s.category_id === cat.id,
              );
              const prodCount = products.filter(
                (p) => p.category_id === cat.id,
              ).length;
              const isExpanded = expanded.has(cat.id);
              const isSelected = selected?.id === cat.id;
              return (
                <div key={cat.id}>
                  <Button
                    onClick={() => selectCategory(cat)}
                    variant="ghost"
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all
                      ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"}
                    `}
                  >
                    {subs.length > 0 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(cat.id);
                        }}
                        className="shrink-0"
                        variant="ghost"
                      >
                        <ChevronRight
                          className={`h-3.5 my-1 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </Button>
                    )}
                    <span className="text-[13px] font-medium flex-1 truncate">
                      {cat.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {prodCount}
                    </Badge>
                    <PermissionGuard
                      permission={{
                        module: Module.CATEGORIES,
                        action: Action.CREATE,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSubModal(cat.id);
                        }}
                        className="shrink-0 text-muted-foreground hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </PermissionGuard>
                  </Button>
                  {isExpanded && subs.length > 0 && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {subs.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => openSubModal(cat.id, sub)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        >
                          <span className="flex-1 truncate">{sub.name}</span>
                          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-3 border border-border rounded-xl bg-card p-6">
          {selected || creatingCategory ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                {selected ? "Edit Category" : "New Category"}
              </h3>
              <Input
                placeholder="Category name"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!selected)
                    setFormSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    );
                }}
              />
              <Input
                placeholder="Slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="text-xs"
              />
              <Textarea
                placeholder="Description"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-3">
                <Switch checked={formActive} onCheckedChange={setFormActive} />
                <span className="text-sm text-foreground">Active</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {selected && (
                  <PermissionGuard
                    permission={{
                      module: Module.CATEGORIES,
                      action: Action.DELETE,
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={handleDeleteCategory}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </PermissionGuard>
                )}
                <div className="flex-1" />
                <Button
                  size="sm"
                  onClick={handleSaveCategory}
                  disabled={saving}
                >
                  {saving ? "Saving..." : selected ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm text-muted-foreground">
                Select a category to edit
              </p>
            </div>
          )}
        </div>
      </div>

      <ResponsiveModal
        open={subModalOpen}
        onOpenChange={(open) => {
          setSubModalOpen(open);
          if (!open) setSubFieldErrors({});
        }}
        title={editSub ? "Edit Subcategory" : "Add Subcategory"}
      >
        <div className="space-y-4 pb-16">
          <ModalFormField label="Subcategory name" error={subFieldErrors.name}>
            {(id) => (
              <Input
                id={id}
                placeholder="Premium mixes"
                value={subFormName}
                onChange={(e) => {
                  setSubFormName(e.target.value);
                  if (subFieldErrors.name) setSubFieldErrors((p) => ({ ...p, name: undefined }));
                  if (!editSub)
                    setSubFormSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    );
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Slug" error={subFieldErrors.slug} description="URL segment; lowercase, no spaces">
            {(id) => (
              <Input
                id={id}
                placeholder="premium-mixes"
                value={subFormSlug}
                onChange={(e) => {
                  setSubFormSlug(e.target.value);
                  if (subFieldErrors.slug) setSubFieldErrors((p) => ({ ...p, slug: undefined }));
                }}
                className="text-xs"
              />
            )}
          </ModalFormField>
          <div className="flex items-center gap-3">
            <Switch
              id="subcat-active"
              checked={subFormActive}
              onCheckedChange={setSubFormActive}
            />
            <label htmlFor="subcat-active" className="text-sm font-medium text-foreground">
              Active
            </label>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSubModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSub}>
            {editSub ? "Update" : "Create"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default AdminCategoriesPage;
