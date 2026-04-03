import React, { useState, useMemo } from "react";
import { useSuppliers } from "@/admin/hooks/useSuppliers";
import { SupplierService } from "@/admin/services/SupplierService";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/admin/lib/format";
import type { SupplierRecord } from "@/types";
import { Action, Module } from "@/constant/permissions";

const SuppliersPage: React.FC = () => {
  const { suppliers, loading, refresh } = useSuppliers();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<SupplierRecord | null>(null);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    pan: "",
    payment_terms: "net_30" as SupplierRecord["payment_terms"],
    is_active: true,
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
  });
  const [saving, setSaving] = useState(false);
  const [supplierErrors, setSupplierErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  const filtered = useMemo(() => {
    let list = suppliers;
    if (filterStatus !== "all")
      list = list.filter((s) =>
        filterStatus === "active" ? s.is_active : !s.is_active,
      );
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.contact_person.toLowerCase().includes(q),
      );
    }
    return list;
  }, [suppliers, filterStatus, search]);

  const openCreate = () => {
    setSupplierErrors({});
    setEditItem(null);
    setForm({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      gstin: "",
      pan: "",
      payment_terms: "net_30",
      is_active: true,
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      account_holder: "",
    });
    setModal(true);
  };
  const openEdit = (s: SupplierRecord) => {
    setSupplierErrors({});
    setEditItem(s);
    setForm({
      name: s.name,
      contact_person: s.contact_person,
      phone: s.phone,
      email: s.email,
      address: s.address,
      gstin: s.gstin,
      pan: s.pan,
      payment_terms: s.payment_terms,
      is_active: s.is_active,
      bank_name: s.bank_name,
      account_number: s.account_number,
      ifsc_code: s.ifsc_code,
      account_holder: s.account_holder,
    });
    setModal(true);
  };

  const save = async () => {
    const err: typeof supplierErrors = {};
    if (!form.name.trim()) err.name = "Supplier name is required";
    if (!form.phone.trim()) err.phone = "Phone is required";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      err.email = "Enter a valid email";
    if (Object.keys(err).length) {
      setSupplierErrors(err);
      return;
    }
    setSupplierErrors({});
    setSaving(true);
    try {
      if (editItem) {
        await SupplierService.update(editItem.id, form);
        toast.success("Updated");
      } else {
        await SupplierService.create(form);
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

  const columns: DataTableOneColumn<SupplierRecord>[] = [
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="text-[13px] font-medium text-foreground">{r.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {r.contact_person}
          </p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">{r.phone}</span>
      ),
    },
    {
      key: "gstin",
      header: "GSTIN",
      render: (r) => (
        <span className="text-[11px] font-mono text-muted-foreground">
          {r.gstin}
        </span>
      ),
    },
    {
      key: "outstanding",
      header: "Outstanding",
      sortable: true,
      sortValue: (r) => r.outstanding_paisa,
      render: (r) => (
        <span className="text-[13px] font-medium text-foreground">
          {formatINR(r.outstanding_paisa)}
        </span>
      ),
    },
    {
      key: "materials",
      header: "Materials",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {r.linked_materials_count}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant="secondary"
          className={`text-[10px] ${r.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
        >
          {r.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <PermissionGuard
          permission={{ module: Module.SUPPLIERS, action: Action.UPDATE }}
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
      ),
    },
  ];

  const updateField = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Suppliers</h2>
        <PermissionGuard
          permission={{ module: Module.SUPPLIERS, action: Action.CREATE }}
        >
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />{" "}
            <span className="lg:inline hidden">Add Supplier</span>
          </Button>
        </PermissionGuard>
      </div>
      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyMessage="No suppliers"
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
          if (!v) setSupplierErrors({});
        }}
        title={editItem ? "Edit Supplier" : "Add Supplier"}
      >
        <Tabs defaultValue="basic" className="pb-20">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex-1">
              Bank Details
            </TabsTrigger>
            {editItem && (
              <TabsTrigger value="ledger" className="flex-1">
                Ledger
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="basic" className="space-y-3 mt-4">
            <ModalFormField label="Supplier name" error={supplierErrors.name}>
              {(id) => (
                <Input
                  id={id}
                  placeholder="Acme Spices Pvt Ltd"
                  value={form.name}
                  onChange={(e) => {
                    updateField("name", e.target.value);
                    if (supplierErrors.name) setSupplierErrors((p) => ({ ...p, name: undefined }));
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Contact person" description="Optional">
              {(id) => (
                <Input
                  id={id}
                  placeholder="Procurement manager"
                  value={form.contact_person}
                  onChange={(e) => updateField("contact_person", e.target.value)}
                />
              )}
            </ModalFormField>
            <div className="grid grid-cols-2 gap-3">
              <ModalFormField label="Phone" error={supplierErrors.phone}>
                {(id) => (
                  <Input
                    id={id}
                    placeholder="+91 …"
                    value={form.phone}
                    onChange={(e) => {
                      updateField("phone", e.target.value);
                      if (supplierErrors.phone) setSupplierErrors((p) => ({ ...p, phone: undefined }));
                    }}
                  />
                )}
              </ModalFormField>
              <ModalFormField label="Email" error={supplierErrors.email} description="Optional">
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    placeholder="accounts@vendor.com"
                    value={form.email}
                    onChange={(e) => {
                      updateField("email", e.target.value);
                      if (supplierErrors.email) setSupplierErrors((p) => ({ ...p, email: undefined }));
                    }}
                  />
                )}
              </ModalFormField>
            </div>
            <ModalFormField label="Address">
              {(id) => (
                <Textarea
                  id={id}
                  placeholder="Street, city, PIN"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  rows={2}
                />
              )}
            </ModalFormField>
            <div className="grid grid-cols-2 gap-3">
              <ModalFormField label="GSTIN">
                {(id) => (
                  <Input
                    id={id}
                    placeholder="22AAAAA0000A1Z5"
                    value={form.gstin}
                    onChange={(e) => updateField("gstin", e.target.value)}
                  />
                )}
              </ModalFormField>
              <ModalFormField label="PAN">
                {(id) => (
                  <Input
                    id={id}
                    placeholder="AAAAA0000A"
                    value={form.pan}
                    onChange={(e) => updateField("pan", e.target.value)}
                  />
                )}
              </ModalFormField>
            </div>
            <ModalFormField label="Payment terms">
              {(id) => (
                <Select
                  value={form.payment_terms}
                  onValueChange={(v) => updateField("payment_terms", v)}
                >
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["immediate", "net_15", "net_30", "net_45", "net_60"].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t
                            .replace("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
            <div className="flex items-center gap-3">
              <Switch
                id="supplier-active"
                checked={form.is_active}
                onCheckedChange={(v) => updateField("is_active", v)}
              />
              <label htmlFor="supplier-active" className="text-sm font-medium">
                Active
              </label>
            </div>
          </TabsContent>
          <TabsContent value="bank" className="space-y-3 mt-4">
            <ModalFormField label="Bank name">
              {(id) => (
                <Input
                  id={id}
                  placeholder="HDFC Bank"
                  value={form.bank_name}
                  onChange={(e) => updateField("bank_name", e.target.value)}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Account number">
              {(id) => (
                <Input
                  id={id}
                  placeholder="50100…"
                  value={form.account_number}
                  onChange={(e) => updateField("account_number", e.target.value)}
                />
              )}
            </ModalFormField>
            <ModalFormField label="IFSC code">
              {(id) => (
                <Input
                  id={id}
                  placeholder="HDFC0001234"
                  value={form.ifsc_code}
                  onChange={(e) => updateField("ifsc_code", e.target.value)}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Account holder">
              {(id) => (
                <Input
                  id={id}
                  placeholder="As per bank records"
                  value={form.account_holder}
                  onChange={(e) => updateField("account_holder", e.target.value)}
                />
              )}
            </ModalFormField>
          </TabsContent>
          {editItem && (
            <TabsContent value="ledger" className="mt-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Outstanding
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatINR(editItem.outstanding_paisa)}
                  </span>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default SuppliersPage;
