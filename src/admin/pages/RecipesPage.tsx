import { useRawMaterials } from "@/admin/hooks/useInventory";
import { useRecipes } from "@/admin/hooks/useRecipes";
import { formatINR } from "@/admin/lib/format";
import { RecipeService } from "@/admin/services/RecipeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { DataTableOne } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Action, Module } from "@/constant/permissions";
import type { RecipeIngredientRecord, RecipeRecord } from "@/types";
import { format } from "date-fns";
import {
  Archive,
  ChevronDown,
  Copy,
  History,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const RecipesPage: React.FC = () => {
  const { recipes, loading, refresh } = useRecipes();
  const { rawMaterials } = useRawMaterials();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editRecipe, setEditRecipe] = useState<RecipeRecord | null>(null);
  const [formName, setFormName] = useState("");
  const [formVariant, setFormVariant] = useState("");
  const [formOutput, setFormOutput] = useState("");
  const [formUnit, setFormUnit] = useState("g");
  const [formNotes, setFormNotes] = useState("");
  const [formIngredients, setFormIngredients] = useState<
    Partial<RecipeIngredientRecord>[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recipeErrors, setRecipeErrors] = useState<{
    name?: string;
    output?: string;
    ingredients?: string;
  }>({});

  const filtered = useMemo(() => {
    let list = recipes;
    if (filterStatus !== "all")
      list = list.filter((r) => r.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return list;
  }, [recipes, filterStatus, search]);

  const openCreate = () => {
    setRecipeErrors({});
    setEditRecipe(null);
    setFormName("");
    setFormVariant("");
    setFormOutput("");
    setFormUnit("g");
    setFormNotes("");
    setFormIngredients([
      {
        raw_material_id: "",
        raw_material_name: "",
        quantity: 0,
        unit: "g",
        cost_per_unit_paisa: 0,
      },
    ]);
    setModal(true);
  };

  const openEdit = (r: RecipeRecord) => {
    setRecipeErrors({});
    setEditRecipe(r);
    setFormName(r.name);
    setFormVariant(r.variant_id);
    setFormOutput(String(r.output_quantity));
    setFormUnit(r.output_unit);
    setFormNotes(r.notes);
    setFormIngredients([...r.ingredients]);
    setModal(true);
  };

  const addIngredient = () =>
    setFormIngredients((p) => [
      ...p,
      {
        raw_material_id: "",
        raw_material_name: "",
        quantity: 0,
        unit: "g",
        cost_per_unit_paisa: 0,
      },
    ]);
  const removeIngredient = (i: number) => {
    if (formIngredients.length > 1)
      setFormIngredients((p) => p.filter((_, idx) => idx !== i));
  };
  const updateIngredient = (i: number, field: string, value: unknown) => {
    setFormIngredients((p) =>
      p.map((ing, idx) => {
        if (idx !== i) return ing;
        const updated = { ...ing, [field]: value };
        if (field === "raw_material_id") {
          const rm = rawMaterials.find((r) => r.id === value);
          if (rm) {
            updated.raw_material_name = rm.name;
            updated.unit = rm.unit;
            updated.cost_per_unit_paisa = rm.cost_per_unit_paisa;
          }
        }
        return updated;
      }),
    );
  };

  const totalCost = formIngredients.reduce(
    (s, ing) => s + (ing.quantity || 0) * (ing.cost_per_unit_paisa || 0),
    0,
  );
  const costPerUnit =
    Number(formOutput) > 0 ? totalCost / Number(formOutput) : 0;

  const handleSave = async (activate = false) => {
    const err: typeof recipeErrors = {};
    if (!formName.trim()) err.name = "Recipe name is required";
    const out = Number(formOutput);
    if (!formOutput.trim() || Number.isNaN(out) || out <= 0)
      err.output = "Enter a positive output quantity";
    let badIng = false;
    for (const ing of formIngredients) {
      if (!ing.raw_material_id || !ing.quantity || ing.quantity <= 0) {
        badIng = true;
        break;
      }
    }
    if (badIng || formIngredients.length === 0) {
      err.ingredients = "Each row needs a raw material and a positive quantity";
    }
    if (Object.keys(err).length) {
      setRecipeErrors(err);
      return;
    }
    setRecipeErrors({});
    setSaving(true);
    try {
      if (editRecipe) {
        await RecipeService.updateRecipe(editRecipe.id, {
          name: formName,
          notes: formNotes,
          output_quantity: Number(formOutput),
          output_unit: formUnit,
          ingredients: formIngredients as RecipeIngredientRecord[],
        });
        if (activate) await RecipeService.activateRecipe(editRecipe.id);
        toast.success("Recipe updated");
      } else {
        const r = await RecipeService.createRecipe({
          name: formName,
          product_id: "",
          variant_id: formVariant,
          variant_label: "",
          output_quantity: Number(formOutput),
          output_unit: formUnit,
          ingredients: formIngredients as RecipeIngredientRecord[],
          status: activate ? "active" : "inactive",
          notes: formNotes,
          created_by: "Admin User",
        });
        if (activate) await RecipeService.activateRecipe(r.id);
        toast.success("Recipe created");
      }
      setModal(false);
      refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableOneColumn<RecipeRecord>[] = [
    {
      key: "name",
      header: "Recipe",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="text-[13px] font-medium text-foreground">{r.name}</p>
          <p className="text-[11px] text-muted-foreground">{r.variant_label}</p>
        </div>
      ),
    },
    {
      key: "output",
      header: "Output",
      render: (r) => (
        <span className="text-[13px]">
          {r.output_quantity}
          {r.output_unit}
        </span>
      ),
    },
    {
      key: "ingredients",
      header: "Ingredients",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {r.ingredients.length}
        </span>
      ),
    },
    {
      key: "version",
      header: "Version",
      render: (r) => (
        <Badge variant="outline" className="text-[10px]">
          v{r.version}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant="secondary"
          className={`text-[10px] ${r.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
        >
          {r.status}
        </Badge>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {format(new Date(r.updated_at), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <PermissionGuard
            permission={{ module: Module.RECIPES, action: Action.UPDATE }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEdit(r)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={async () => {
              await RecipeService.duplicateRecipe(r.id);
              toast.success("Duplicated");
              refresh();
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={async () => {
              await RecipeService.archiveRecipe(r.id);
              toast.success("Archived");
              refresh();
            }}
          >
            <Archive className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recipes</h2>
        <PermissionGuard
          permission={{ module: Module.RECIPES, action: Action.CREATE }}
        >
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />{" "}
            <span className="lg:inline hidden">Add Recipe</span>
          </Button>
        </PermissionGuard>
      </div>
      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyMessage="No recipes"
        toolbarFilters={
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-48 text-xs"
          />
        }
        filters={[
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
        ]}
      />
      <ResponsiveModal
        open={modal}
        onOpenChange={(v) => {
          setModal(v);
          if (!v) setRecipeErrors({});
        }}
        title={editRecipe ? "Edit Recipe" : "Add Recipe"}
      >
        <div className="space-y-5 pb-20">
          <ModalFormField label="Recipe name" error={recipeErrors.name}>
            {(id) => (
              <Input
                id={id}
                placeholder="Mukhwas blend — large"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (recipeErrors.name) setRecipeErrors((p) => ({ ...p, name: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <div className="grid grid-cols-2 gap-3">
            <ModalFormField label="Output quantity" error={recipeErrors.output}>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  placeholder="1000"
                  value={formOutput}
                  onChange={(e) => {
                    setFormOutput(e.target.value);
                    if (recipeErrors.output) setRecipeErrors((p) => ({ ...p, output: undefined }));
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Output unit">
              {(id) => (
                <Select value={formUnit} onValueChange={setFormUnit}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["g", "kg", "pcs", "mL", "L"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
          </div>
          <ModalFormField label="Notes" description="Optional">
            {(id) => (
              <Textarea
                id={id}
                placeholder="Roast level 2…"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
              />
            )}
          </ModalFormField>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Ingredients
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addIngredient();
                  if (recipeErrors.ingredients) setRecipeErrors((p) => ({ ...p, ingredients: undefined }));
                }}
                className="gap-1 text-xs"
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            {recipeErrors.ingredients ? (
              <p className="text-sm font-medium text-destructive">{recipeErrors.ingredients}</p>
            ) : null}
            {formIngredients.map((ing, i) => (
              <div
                key={i}
                className="p-3 border border-border rounded-lg space-y-2 relative"
              >
                <Select
                  value={ing.raw_material_id || ""}
                  onValueChange={(v) => {
                    updateIngredient(i, "raw_material_id", v);
                    if (recipeErrors.ingredients) setRecipeErrors((p) => ({ ...p, ingredients: undefined }));
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select raw material" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawMaterials.map((rm) => (
                      <SelectItem key={rm.id} value={rm.id}>
                        {rm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={ing.quantity || ""}
                    onChange={(e) => {
                      updateIngredient(i, "quantity", Number(e.target.value));
                      if (recipeErrors.ingredients) setRecipeErrors((p) => ({ ...p, ingredients: undefined }));
                    }}
                    className="text-xs"
                  />
                  <Input
                    value={ing.unit || "g"}
                    readOnly
                    className="text-xs bg-muted/50"
                  />
                </div>
                <div className="flex justify-between items-center">
                  {ing.quantity && ing.cost_per_unit_paisa ? (
                    <p className="text-[11px] text-muted-foreground">
                      Cost: {formatINR(ing.quantity * ing.cost_per_unit_paisa)}
                    </p>
                  ) : null}
                  {formIngredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(i)}
                      className="bg-primary p-2 rounded-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <p className="text-xs text-muted-foreground">
              Total recipe cost:{" "}
              <span className="font-semibold text-foreground">
                {formatINR(totalCost)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Cost per unit:{" "}
              <span className="font-semibold text-foreground">
                {formatINR(Math.round(costPerUnit))}
              </span>
            </p>
          </div>
          {editRecipe && editRecipe.versions.length > 0 && (
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> Version History (
                    {editRecipe.versions.length})
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {editRecipe.versions.map((v) => (
                  <div
                    key={v.version}
                    className="p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">
                        v{v.version}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(v.changed_at), "dd MMM yyyy")} by{" "}
                        {v.changed_by}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {v.diff_summary}
                    </p>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            Save as Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? "Saving..." : "Activate"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default RecipesPage;
