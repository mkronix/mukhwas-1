import React, { useState, useMemo } from "react";
import { useRawMaterials } from "@/admin/hooks/useInventory";
import { InventoryService } from "@/admin/services/InventoryService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatINR } from "@/admin/lib/format";
import type { RawMaterialRecord } from "@/types";
import { Action, Module } from "@/constant/permissions";

const statusColors: Record<string, string> = {
  in_stock: "bg-success/10 text-success",
  low_stock: "bg-warning/10 text-warning",
  out_of_stock: "bg-destructive/10 text-destructive",
};

const RawMaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { rawMaterials: data, loading, refresh } = useRawMaterials();
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterGST, setFilterGST] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<RawMaterialRecord | null>(null);
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState<RawMaterialRecord | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formReorder, setFormReorder] = useState("");
  const [formHSN, setFormHSN] = useState("");
  const [formGST, setFormGST] = useState("5");
  const [adjType, setAdjType] = useState<"add" | "remove">("add");
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [rmErrors, setRmErrors] = useState<{ name?: string; reorder?: string }>({});
  const [rawAdjErrors, setRawAdjErrors] = useState<{ qty?: string; reason?: string }>({});

  const filtered = useMemo(() => {
    let list = data;
    if (filterSupplier !== "all")
      list = list.filter((r) => r.preferred_supplier_id === filterSupplier);
    if (filterGST !== "all")
      list = list.filter((r) => r.gst_slab === filterGST);
    if (filterStatus !== "all")
      list = list.filter((r) => r.status === filterStatus);
    return list;
  }, [data, filterSupplier, filterGST, filterStatus]);

  const suppliers = [
    ...new Map(
      data.map((r) => [r.preferred_supplier_id, r.preferred_supplier_name]),
    ).entries(),
  ];

  const openCreate = () => {
    setRmErrors({});
    setEditItem(null);
    setFormName("");
    setFormDesc("");
    setFormUnit("kg");
    setFormReorder("");
    setFormHSN("");
    setFormGST("5");
    setModal(true);
  };

  const openEdit = (r: RawMaterialRecord) => {
    setRmErrors({});
    setEditItem(r);
    setFormName(r.name);
    setFormDesc(r.description);
    setFormUnit(r.unit);
    setFormReorder(String(r.reorder_level));
    setFormHSN(r.hsn_code);
    setFormGST(r.gst_slab);
    setModal(true);
  };

  const save = async () => {
    const err: typeof rmErrors = {};
    if (!formName.trim()) err.name = "Name is required";
    const ro = Number(formReorder);
    if (formReorder.trim() !== "" && (Number.isNaN(ro) || ro < 0))
      err.reorder = "Enter a valid reorder level";
    if (Object.keys(err).length) {
      setRmErrors(err);
      return;
    }
    setRmErrors({});
    setSaving(true);
    try {
      if (editItem) {
        await InventoryService.updateRawMaterial(editItem.id, {
          name: formName,
          description: formDesc,
          unit: formUnit,
          reorder_level: Number(formReorder),
          hsn_code: formHSN,
          gst_slab: formGST,
        });
        toast.success("Updated");
      } else {
        await InventoryService.createRawMaterial({
          name: formName,
          description: formDesc,
          unit: formUnit,
          reorder_level: Number(formReorder),
          hsn_code: formHSN,
          gst_slab: formGST,
          current_stock: 0,
          cost_per_unit_paisa: 0,
          preferred_supplier_id: "",
          preferred_supplier_name: "",
          linked_suppliers: [],
        });
        toast.success("Created");
      }
      setModal(false);
      refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const openAdjust = (r: RawMaterialRecord) => {
    setRawAdjErrors({});
    setAdjustItem(r);
    setAdjType("add");
    setAdjQty("");
    setAdjReason("");
    setAdjustModal(true);
  };

  const confirmAdjust = async () => {
    const err: typeof rawAdjErrors = {};
    const q = Number(adjQty);
    if (!adjQty.trim() || Number.isNaN(q) || q <= 0) err.qty = "Enter a valid quantity";
    if (!adjReason.trim()) err.reason = "Reason is required";
    if (Object.keys(err).length) {
      setRawAdjErrors(err);
      return;
    }
    setRawAdjErrors({});
    setSaving(true);
    try {
      await InventoryService.adjustRawMaterialStock(
        adjustItem!.id,
        adjType,
        Number(adjQty),
        adjReason,
      );
      toast.success("Stock adjusted");
      setAdjustModal(false);
      refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableOneColumn<RawMaterialRecord>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <span className="text-[13px] font-medium text-foreground">
          {r.name}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      sortValue: (r) => r.current_stock,
      render: (r) => (
        <span className="text-[13px]">
          {r.current_stock} {r.unit}
        </span>
      ),
    },
    {
      key: "reorder",
      header: "Reorder",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {r.reorder_level}
        </span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {r.preferred_supplier_name || "—"}
        </span>
      ),
    },
    {
      key: "hsn",
      header: "HSN",
      render: (r) => (
        <span className="text-[11px] text-muted-foreground font-mono">
          {r.hsn_code}
        </span>
      ),
    },
    {
      key: "gst",
      header: "GST",
      render: (r) => (
        <Badge variant="outline" className="text-[10px]">
          {r.gst_slab}%
        </Badge>
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
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <PermissionGuard
            permission={{ module: Module.INVENTORY_RAW, action: Action.UPDATE }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => openEdit(r)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => openAdjust(r)}
            >
              Adjust
            </Button>
          </PermissionGuard>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => navigate("/admin/inventory/movements")}
          >
            Movements
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Raw Materials</h2>
        <PermissionGuard
          permission={{ module: Module.INVENTORY_RAW, action: Action.CREATE }}
        >
          {" "}
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="lg:inline hidden">Add Raw Material</span>
          </Button>
        </PermissionGuard>
      </div>

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyMessage="No raw materials"
        filters={[
          {
            key: "supplier",
            label: "Supplier",
            value: filterSupplier,
            options: suppliers.map(([id, name]) => ({
              label: name,
              value: id,
            })),
            onChange: setFilterSupplier,
          },
          {
            key: "gst",
            label: "GST Slab",
            value: filterGST,
            options: ["0", "5", "12", "18", "28"].map((v) => ({
              label: `${v}%`,
              value: v,
            })),
            onChange: setFilterGST,
          },
          {
            key: "status",
            label: "Status",
            value: filterStatus,
            options: [
              { label: "In Stock", value: "in_stock" },
              { label: "Low Stock", value: "low_stock" },
              { label: "Out of Stock", value: "out_of_stock" },
            ],
            onChange: setFilterStatus,
          },
        ]}
      />

      <ResponsiveModal
        open={modal}
        onOpenChange={(v) => {
          setModal(v);
          if (!v) setRmErrors({});
        }}
        title={editItem ? "Edit Raw Material" : "Add Raw Material"}
      >
        <div className="space-y-4 pb-20">
          <ModalFormField label="Name" error={rmErrors.name}>
            {(id) => (
              <Input
                id={id}
                placeholder="Fennel seeds"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (rmErrors.name) setRmErrors((p) => ({ ...p, name: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Description" description="Optional">
            {(id) => (
              <Textarea
                id={id}
                placeholder="Grade A, bagged"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
              />
            )}
          </ModalFormField>
          <div className="grid grid-cols-2 gap-3">
            <ModalFormField label="Unit">
              {(id) => (
                <Select value={formUnit} onValueChange={setFormUnit}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["kg", "g", "mg", "L", "mL", "pcs"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
            <ModalFormField label="Reorder level" error={rmErrors.reorder}>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  placeholder="100"
                  value={formReorder}
                  onChange={(e) => {
                    setFormReorder(e.target.value);
                    if (rmErrors.reorder) setRmErrors((p) => ({ ...p, reorder: undefined }));
                  }}
                />
              )}
            </ModalFormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModalFormField label="HSN code">
              {(id) => (
                <Input
                  id={id}
                  placeholder="0909"
                  value={formHSN}
                  onChange={(e) => setFormHSN(e.target.value)}
                />
              )}
            </ModalFormField>
            <ModalFormField label="GST slab">
              {(id) => (
                <Select value={formGST} onValueChange={setFormGST}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["0", "5", "12", "18", "28"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={adjustModal}
        onOpenChange={(v) => {
          setAdjustModal(v);
          if (!v) setRawAdjErrors({});
        }}
        title="Adjust Stock"
      >
        {adjustItem && (
          <div className="space-y-4 pb-20">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground">
                {adjustItem.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Current: {adjustItem.current_stock} {adjustItem.unit}
              </p>
            </div>
            <ModalFormField label="Adjustment type">
              {(id) => (
                <Select
                  value={adjType}
                  onValueChange={(v) => setAdjType(v as "add" | "remove")}
                >
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
            <ModalFormField label="Quantity" error={rawAdjErrors.qty}>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  placeholder="50"
                  value={adjQty}
                  onChange={(e) => {
                    setAdjQty(e.target.value);
                    if (rawAdjErrors.qty) setRawAdjErrors((p) => ({ ...p, qty: undefined }));
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Reason" error={rawAdjErrors.reason}>
              {(id) => (
                <Input
                  id={id}
                  placeholder="GRN received"
                  value={adjReason}
                  onChange={(e) => {
                    setAdjReason(e.target.value);
                    if (rawAdjErrors.reason) setRawAdjErrors((p) => ({ ...p, reason: undefined }));
                  }}
                />
              )}
            </ModalFormField>
          </div>
        )}
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAdjustModal(false)}>
            Cancel
          </Button>
          <Button onClick={confirmAdjust} disabled={saving}>
            {saving ? "Adjusting..." : "Confirm"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default RawMaterialsPage;
