import React, { useState, useEffect, useMemo } from "react";
import { DatePicker } from "@/admin/components/DatePicker";
import { AdminProductionOrderService } from "@/admin/services/AdminProductionOrderService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Eye,
  Factory,
  Clock,
  IndianRupee,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ProductionOrderRecord } from "@/types";
import { mockRecipes } from "@/admin/mock/recipes";
import { Action, Module } from "@/constant/permissions";

const formatINR = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

const statusColors: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  partially_completed: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const ProductionPage: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    planned: 0,
    inProgress: 0,
    completedToday: 0,
    reservationValue: 0,
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [createModal, setCreateModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [selected, setSelected] = useState<ProductionOrderRecord | null>(null);
  const [formRecipe, setFormRecipe] = useState("");
  const [formBatch, setFormBatch] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStaff, setFormStaff] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [completeQty, setCompleteQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [createErrors, setCreateErrors] = useState<{
    recipe?: string;
    batch?: string;
  }>({});
  const [completeError, setCompleteError] = useState<string | undefined>();

  const load = async () => {
    setLoading(true);
    const [o, s] = await Promise.all([
      AdminProductionOrderService.getAll(),
      AdminProductionOrderService.getStats(),
    ]);
    setOrders(o);
    setStats(s);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      filterStatus === "all"
        ? orders
        : orders.filter((o) => o.status === filterStatus),
    [orders, filterStatus],
  );
  const activeRecipes = mockRecipes.filter((r) => r.status === "active");

  const handleCreate = async () => {
    const err: typeof createErrors = {};
    if (!formRecipe) err.recipe = "Select a recipe";
    const b = Number(formBatch);
    if (!formBatch.trim() || Number.isNaN(b) || b <= 0)
      err.batch = "Enter a positive batch size";
    if (Object.keys(err).length) {
      setCreateErrors(err);
      return;
    }
    setCreateErrors({});
    setSaving(true);
    try {
      const recipe = activeRecipes.find((r) => r.id === formRecipe)!;
      await AdminProductionOrderService.create({
        recipe_id: formRecipe,
        recipe_name: recipe.name,
        recipe_version: recipe.version,
        product_variant: recipe.variant_label,
        planned_quantity: Number(formBatch),
        unit: recipe.output_unit,
        scheduled_date: formDate || new Date().toISOString().slice(0, 10),
        assigned_staff_id: formStaff || "staff_2",
        assigned_staff_name:
          formStaff === "staff_3" ? "Sehzad Khan" : "Kasim Kadiwala",
        created_by: "Admin User",
        materials: [],
      });
      toast.success("Production order created");
      setCreateModal(false);
      load();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async (id: string) => {
    await AdminProductionOrderService.updateStatus(
      id,
      "in_progress",
      "Admin User",
    );
    toast.success("Production started");
    load();
  };

  const handleCancel = async (id: string) => {
    await AdminProductionOrderService.updateStatus(
      id,
      "cancelled",
      "Admin User",
    );
    toast.success("Order cancelled");
    load();
  };

  const openComplete = (o: ProductionOrderRecord) => {
    setCompleteError(undefined);
    setSelected(o);
    setCompleteQty(String(o.planned_quantity));
    setCompleteModal(true);
  };

  const handleComplete = async () => {
    if (!selected) return;
    const q = Number(completeQty);
    if (!completeQty.trim() || Number.isNaN(q) || q <= 0) {
      setCompleteError("Enter the quantity produced");
      return;
    }
    if (q > selected.planned_quantity) {
      setCompleteError(`Cannot exceed planned ${selected.planned_quantity}${selected.unit}`);
      return;
    }
    setCompleteError(undefined);
    setSaving(true);
    try {
      const usage: Record<string, number> = {};
      selected.materials.forEach((m) => {
        usage[m.raw_material_id] = m.reserved_quantity;
      });
      await AdminProductionOrderService.completeOrder(
        selected.id,
        Number(completeQty),
        usage,
        "Admin User",
      );
      toast.success("Production completed");
      setCompleteModal(false);
      setDetailDrawer(false);
      load();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const viewDetail = (o: ProductionOrderRecord) => {
    setSelected(o);
    setDetailDrawer(true);
  };

  const columns: DataTableOneColumn<ProductionOrderRecord>[] = [
    {
      key: "id",
      header: "Order",
      render: (r) => (
        <span className="text-[13px] font-mono text-primary">
          {r.order_number}
        </span>
      ),
    },
    {
      key: "recipe",
      header: "Recipe",
      render: (r) => (
        <span className="text-[13px] font-medium text-foreground">
          {r.recipe_name}
        </span>
      ),
    },
    {
      key: "variant",
      header: "Variant",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {r.product_variant}
        </span>
      ),
    },
    {
      key: "planned",
      header: "Planned",
      render: (r) => (
        <span className="text-[13px]">
          {r.planned_quantity}
          {r.unit}
        </span>
      ),
    },
    {
      key: "actual",
      header: "Actual",
      render: (r) =>
        r.actual_quantity > 0 ? (
          <span className="text-[13px] font-medium">
            {r.actual_quantity}
            {r.unit}
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant="secondary"
          className={`text-[10px] ${statusColors[r.status]}`}
        >
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Scheduled",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {r.scheduled_date}
        </span>
      ),
    },
    {
      key: "staff",
      header: "Staff",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {r.assigned_staff_name}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => viewDetail(r)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {r.status === "planned" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary"
              onClick={() => handleStart(r.id)}
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}
          {r.status === "in_progress" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-success"
              onClick={() => openComplete(r)}
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          {!["completed", "partially_completed", "cancelled"].includes(
            r.status,
          ) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => handleCancel(r.id)}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Production Orders
        </h2>
        <PermissionGuard
          permission={{
            module: Module.PRODUCTION_ORDERS,
            action: Action.CREATE,
          }}
        >
          <Button
            size="sm"
            onClick={() => {
              setFormRecipe("");
              setFormBatch("");
              setFormDate("");
              setFormStaff("");
              setFormNotes("");
              setCreateModal(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="lg:inline hidden">Create Order</span>
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Planned",
            value: stats.planned,
            icon: ListChecks,
            color: "text-muted-foreground",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: Factory,
            color: "text-primary",
          },
          {
            label: "Completed Today",
            value: stats.completedToday,
            icon: CheckCircle,
            color: "text-success",
          },
          {
            label: "Reservations",
            value: formatINR(stats.reservationValue),
            icon: IndianRupee,
            color: "text-warning",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center ${s.color}`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyMessage="No production orders"
        filters={[
          {
            key: "status",
            label: "Status",
            value: filterStatus,
            options: [
              { label: "Planned", value: "planned" },
              { label: "In Progress", value: "in_progress" },
              { label: "Completed", value: "completed" },
              { label: "Partial", value: "partially_completed" },
              { label: "Cancelled", value: "cancelled" },
            ],
            onChange: setFilterStatus,
          },
        ]}
      />

      <ResponsiveModal
        open={createModal}
        onOpenChange={(v) => {
          setCreateModal(v);
          if (!v) setCreateErrors({});
        }}
        title="Create Production Order"
      >
        <div className="space-y-4 pb-20">
          <ModalFormField label="Recipe" error={createErrors.recipe}>
            {(id) => (
              <Select
                value={formRecipe || undefined}
                onValueChange={(val) => {
                  setFormRecipe(val);
                  if (createErrors.recipe) setCreateErrors((p) => ({ ...p, recipe: undefined }));
                }}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Select recipe" />
                </SelectTrigger>
                <SelectContent>
                  {activeRecipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} — {r.variant_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          <ModalFormField label="Batch size" error={createErrors.batch} description="Output units for this run">
            {(id) => (
              <Input
                id={id}
                type="number"
                placeholder="500"
                value={formBatch}
                onChange={(e) => {
                  setFormBatch(e.target.value);
                  if (createErrors.batch) setCreateErrors((p) => ({ ...p, batch: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Scheduled date" description="Defaults to today if empty">
            {() => (
              <DatePicker
                value={formDate}
                onChange={setFormDate}
                placeholder="Pick date"
              />
            )}
          </ModalFormField>
          <ModalFormField label="Assign staff">
            {(id) => (
              <Select value={formStaff || undefined} onValueChange={setFormStaff}>
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Choose staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff_2">Kasim Kadiwala</SelectItem>
                  <SelectItem value="staff_3">Sehzad Khan</SelectItem>
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          <ModalFormField label="Notes" description="Optional">
            {(id) => (
              <Textarea
                id={id}
                placeholder="Shift notes…"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
              />
            )}
          </ModalFormField>
        </div>
        <div className="sticky bottom-0 bg-background  border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "Creating..." : "Create"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={completeModal}
        onOpenChange={(v) => {
          setCompleteModal(v);
          if (!v) setCompleteError(undefined);
        }}
        title="Complete Production"
      >
        {selected && (
          <div className="space-y-4 pb-20">
            <p className="text-sm text-muted-foreground">
              Planned: {selected.planned_quantity}
              {selected.unit}
            </p>
            <ModalFormField label="Actual quantity produced" error={completeError}>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  placeholder={String(selected.planned_quantity)}
                  value={completeQty}
                  onChange={(e) => {
                    setCompleteQty(e.target.value);
                    if (completeError) setCompleteError(undefined);
                  }}
                  max={selected.planned_quantity}
                />
              )}
            </ModalFormField>
            {Number(completeQty) < selected.planned_quantity && (
              <p className="text-xs text-warning">
                Partial completion — status will be set to Partially Completed
              </p>
            )}
          </div>
        )}
        <div className="sticky bottom-0 bg-background  border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCompleteModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={saving}>
            {saving ? "Completing..." : "Confirm"}
          </Button>
        </div>
      </ResponsiveModal>

      <Sheet open={detailDrawer} onOpenChange={setDetailDrawer}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selected?.order_number}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Recipe</p>
                  <p className="font-medium">
                    {selected.recipe_name} (v{selected.recipe_version})
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Variant</p>
                  <p className="font-medium">{selected.product_variant}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Planned</p>
                  <p className="font-medium">
                    {selected.planned_quantity}
                    {selected.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${statusColors[selected.status]}`}
                  >
                    {selected.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Scheduled</p>
                  <p>{selected.scheduled_date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Staff</p>
                  <p>{selected.assigned_staff_name}</p>
                </div>
              </div>
              {selected.materials.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Materials</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left p-2">Material</th>
                          <th className="text-right p-2">Reserved</th>
                          <th className="text-right p-2">Used</th>
                          <th className="text-right p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.materials.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-border last:border-0"
                          >
                            <td className="p-2">{m.raw_material_name}</td>
                            <td className="p-2 text-right">
                              {m.reserved_quantity} {m.unit}
                            </td>
                            <td className="p-2 text-right">
                              {m.actual_used || "—"}
                            </td>
                            <td className="p-2 text-right">
                              <Badge variant="outline" className="text-[10px]">
                                {m.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold mb-2">Activity Log</h4>
                <div className="space-y-3">
                  {selected.activity_log.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[13px] text-foreground">
                          {a.action}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(a.timestamp), "dd MMM yyyy, HH:mm")}{" "}
                          · {a.performed_by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {selected.status === "planned" && (
                  <Button
                    size="sm"
                    onClick={() => handleStart(selected.id)}
                    className="gap-1"
                  >
                    <Play className="h-3.5 w-3.5" /> Start
                  </Button>
                )}
                {selected.status === "in_progress" && (
                  <Button
                    size="sm"
                    onClick={() => openComplete(selected)}
                    className="gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Complete
                  </Button>
                )}
                {!["completed", "partially_completed", "cancelled"].includes(
                  selected.status,
                ) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancel(selected.id)}
                    className="gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProductionPage;
