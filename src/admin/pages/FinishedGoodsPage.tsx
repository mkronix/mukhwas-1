import React, { useState, useMemo } from "react";
import { useFinishedGoods } from "@/admin/hooks/useInventory";
import { InventoryService } from "@/admin/services/InventoryService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, XCircle, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatINR } from "@/admin/lib/format";
import type { FinishedGoodRecord } from "@/types";
import { useEffect } from "react";
import { Action, Module } from "@/constant/permissions";

const statusColors: Record<string, string> = {
  in_stock: "bg-success/10 text-success",
  low_stock: "bg-warning/10 text-warning",
  out_of_stock: "bg-destructive/10 text-destructive",
};

const FinishedGoodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { finishedGoods: data, loading, refresh } = useFinishedGoods();
  const [stats, setStats] = useState({
    totalSkus: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState<FinishedGoodRecord | null>(null);
  const [adjType, setAdjType] = useState<"add" | "remove">("add");
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjRef, setAdjRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [adjErrors, setAdjErrors] = useState<{ qty?: string; reason?: string }>({});

  useEffect(() => {
    InventoryService.getFinishedGoodStats().then(setStats);
  }, [data]);

  const filtered = useMemo(() => {
    let list = data;
    if (filterCat !== "all")
      list = list.filter((r) => r.category_id === filterCat);
    if (filterStatus !== "all")
      list = list.filter((r) => r.status === filterStatus);
    if (filterMode !== "all")
      list = list.filter((r) => r.inventory_mode === filterMode);
    return list;
  }, [data, filterCat, filterStatus, filterMode]);

  const openAdjust = (item: FinishedGoodRecord) => {
    setAdjErrors({});
    setAdjustItem(item);
    setAdjType("add");
    setAdjQty("");
    setAdjReason("");
    setAdjRef("");
    setAdjustModal(true);
  };

  const confirmAdjust = async () => {
    const err: typeof adjErrors = {};
    const q = Number(adjQty);
    if (!adjQty.trim() || Number.isNaN(q) || q <= 0)
      err.qty = "Enter a valid quantity";
    if (!adjReason.trim()) err.reason = "Reason is required";
    if (Object.keys(err).length) {
      setAdjErrors(err);
      return;
    }
    setAdjErrors({});
    setSaving(true);
    try {
      await InventoryService.adjustFinishedGoodStock(
        adjustItem!.variant_id,
        adjType,
        Number(adjQty),
        adjReason,
        adjRef,
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

  const previewStock = adjustItem
    ? adjType === "add"
      ? adjustItem.current_stock + Number(adjQty || 0)
      : Math.max(0, adjustItem.current_stock - Number(adjQty || 0))
    : 0;

  const columns: DataTableOneColumn<FinishedGoodRecord>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      sortValue: (r) => r.product_name,
      render: (r) => (
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground truncate">
            {r.product_name}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {r.variant_name} · {r.sku}
          </p>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      sortValue: (r) => r.current_stock,
      render: (r) => (
        <span className="text-[13px] font-medium text-foreground">
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
      key: "value",
      header: "Value",
      sortable: true,
      sortValue: (r) => r.stock_value_paisa,
      render: (r) => (
        <span className="text-[13px] font-medium text-foreground">
          {formatINR(r.stock_value_paisa)}
        </span>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (r) => (
        <Badge variant="outline" className="text-[10px]">
          {r.inventory_mode === "finished_goods" ? "FG" : "Recipe RT"}
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
            permission={{
              module: Module.INVENTORY_FINISHED,
              action: Action.UPDATE,
            }}
          >
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
      <h2 className="text-lg font-semibold text-foreground">
        Finished Goods Inventory
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total SKUs",
            value: stats.totalSkus,
            icon: Package,
            color: "text-primary",
          },
          {
            label: "Stock Value",
            value: formatINR(stats.totalValue),
            icon: IndianRupee,
            color: "text-success",
          },
          {
            label: "Low Stock",
            value: stats.lowStock,
            icon: AlertTriangle,
            color: "text-warning",
          },
          {
            label: "Out of Stock",
            value: stats.outOfStock,
            icon: XCircle,
            color: "text-destructive",
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
        emptyMessage="No inventory records"
        filters={[
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
          {
            key: "mode",
            label: "Mode",
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
        open={adjustModal}
        onOpenChange={(v) => {
          setAdjustModal(v);
          if (!v) setAdjErrors({});
        }}
        title="Adjust Stock"
      >
        {adjustItem && (
          <div className="space-y-4 pb-20">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground">
                {adjustItem.product_name} — {adjustItem.variant_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Current stock: {adjustItem.current_stock} {adjustItem.unit}
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
            <ModalFormField label="Quantity" error={adjErrors.qty}>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  placeholder="10"
                  value={adjQty}
                  onChange={(e) => {
                    setAdjQty(e.target.value);
                    if (adjErrors.qty) setAdjErrors((p) => ({ ...p, qty: undefined }));
                  }}
                  min={1}
                />
              )}
            </ModalFormField>
            {adjQty && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  Resulting stock:{" "}
                  <span className="font-semibold text-foreground">
                    {previewStock} {adjustItem.unit}
                  </span>
                </p>
              </div>
            )}
            <ModalFormField label="Reason" error={adjErrors.reason}>
              {(id) => (
                <Input
                  id={id}
                  placeholder="Stock count correction"
                  value={adjReason}
                  onChange={(e) => {
                    setAdjReason(e.target.value);
                    if (adjErrors.reason) setAdjErrors((p) => ({ ...p, reason: undefined }));
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Reference" description="Optional document or GRN id">
              {(id) => (
                <Input
                  id={id}
                  placeholder="GRN-1042"
                  value={adjRef}
                  onChange={(e) => setAdjRef(e.target.value)}
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

export default FinishedGoodsPage;
