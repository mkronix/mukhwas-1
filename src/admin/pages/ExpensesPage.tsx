import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DatePicker } from "@/admin/components/DatePicker";
import { LedgerService } from "@/admin/services/LedgerService";
import { DataTableOne } from "@/components/ui/data-table";
import type {
  DataTableOneColumn,
  DataTableOneFilter,
} from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Expense } from "@/types";
import { Action, Module } from "@/constant/permissions";

const fmt = (p: number) =>
  `₹${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Packaging",
  "Transport",
  "Miscellaneous",
];
const PAID_VIA = [
  { value: "cash", label: "Cash" },
  { value: "net_banking", label: "Bank" },
  { value: "upi", label: "UPI" },
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold mt-1 text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");
  const [filterVia, setFilterVia] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editExp, setEditExp] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  const [fDate, setFDate] = useState("");
  const [fCat, setFCat] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fAmount, setFAmount] = useState("");
  const [fGst, setFGst] = useState("");
  const [fVia, setFVia] = useState("cash");
  const [fRef, setFRef] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [expErrors, setExpErrors] = useState<{
    date?: string;
    category?: string;
    description?: string;
    amount?: string;
  }>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setExpenses(await LedgerService.getExpenses());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModal = (e?: Expense) => {
    setExpErrors({});
    setEditExp(e || null);
    setFDate(e?.date || new Date().toISOString().split("T")[0]);
    setFCat(e?.category || "");
    setFDesc(e?.description || "");
    setFAmount(e ? String(e.amount_paisa / 100) : "");
    setFGst("");
    setFVia(e?.payment_mode || "cash");
    setFRef("");
    setFNotes("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const err: typeof expErrors = {};
    if (!fDate) err.date = "Date is required";
    if (!fCat) err.category = "Select a category";
    if (!fDesc.trim()) err.description = "Description is required";
    const amt = parseFloat(fAmount);
    if (!fAmount.trim() || Number.isNaN(amt) || amt <= 0)
      err.amount = "Enter a valid amount in ₹";
    if (Object.keys(err).length) {
      setExpErrors(err);
      return;
    }
    setExpErrors({});
    setSaving(true);
    try {
      const data = {
        category: fCat,
        description: fDesc,
        amount_paisa: Math.round(parseFloat(fAmount) * 100),
        payment_mode: fVia as Expense["payment_mode"],
        date: fDate,
        created_by: "staff_1",
      };
      if (editExp) {
        await LedgerService.updateExpense(editExp.id, data);
        toast.success("Expense updated");
      } else {
        await LedgerService.createExpense(data);
        toast.success("Expense recorded");
      }
      setModalOpen(false);
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await LedgerService.deleteExpense(id);
    toast.success("Expense deleted");
    loadData();
  };

  const filtered = useMemo(() => {
    let list = expenses;
    if (filterCat !== "all")
      list = list.filter((e) => e.category === filterCat);
    if (filterVia !== "all")
      list = list.filter((e) => e.payment_mode === filterVia);
    if (search)
      list = list.filter((e) =>
        e.description.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [expenses, filterCat, filterVia, search]);

  const total = filtered.reduce((s, e) => s + e.amount_paisa, 0);
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filtered) {
      map[e.category] = (map[e.category] || 0) + e.amount_paisa;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const columns: DataTableOneColumn<Expense>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (e) => e.date,
      render: (e) => (
        <span className="text-[13px]">
          {format(new Date(e.date), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "cat",
      header: "Category",
      render: (e) => (
        <Badge variant="outline" className="text-[10px]">
          {e.category}
        </Badge>
      ),
    },
    {
      key: "desc",
      header: "Description",
      render: (e) => (
        <span className="text-[13px] text-muted-foreground line-clamp-1">
          {e.description}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (e) => (
        <span className="text-[13px] font-medium">{fmt(e.amount_paisa)}</span>
      ),
    },
    {
      key: "via",
      header: "Paid Via",
      render: (e) => (
        <Badge variant="secondary" className="text-[10px]">
          {e.payment_mode === "net_banking"
            ? "Bank"
            : e.payment_mode.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "by",
      header: "By",
      render: (e) => (
        <span className="text-[13px] text-muted-foreground">
          {e.created_by}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (e) => (
        <div className="flex gap-1">
          <PermissionGuard
            permission={{
              module: Module.LEDGER_EXPENSES,
              action: Action.UPDATE,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openModal(e)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={{
              module: Module.LEDGER_EXPENSES,
              action: Action.DELETE,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleDelete(e.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const filters: DataTableOneFilter[] = [
    {
      key: "cat",
      label: "Category",
      value: filterCat,
      options: [...CATEGORIES.map((c) => ({ label: c, value: c }))],
      onChange: setFilterCat,
    },
    {
      key: "via",
      label: "Paid Via",
      value: filterVia,
      options: [...PAID_VIA],
      onChange: setFilterVia,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Expenses</h2>
        <PermissionGuard
          permission={{ module: Module.LEDGER_EXPENSES, action: Action.CREATE }}
        >
          <Button size="sm" onClick={() => openModal()} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Add Expense</span>
          </Button>
        </PermissionGuard>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Total Expenses" value={fmt(total)} />
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                By Category
              </p>
              <div className="space-y-1.5">
                {byCategory.map(([cat, val]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-medium">{fmt(val)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(e) => e.id}
        loading={loading}
        emptyMessage="No expenses recorded"
        filters={filters}
        toolbarFilters={
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48 text-[13px]"
          />
        }
      />

      <ResponsiveModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setExpErrors({});
        }}
        title={editExp ? "Edit Expense" : "Add Expense"}
      >
        <div className="space-y-4 pb-20">
          <div className="grid grid-cols-2 gap-3">
            <ModalFormField label="Date" error={expErrors.date}>
              {() => (
                <DatePicker
                  value={fDate}
                  onChange={(d) => {
                    setFDate(d);
                    if (expErrors.date) setExpErrors((p) => ({ ...p, date: undefined }));
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Category" error={expErrors.category}>
              {(id) => (
                <Select
                  value={fCat || undefined}
                  onValueChange={(v) => {
                    setFCat(v);
                    if (expErrors.category) setExpErrors((p) => ({ ...p, category: undefined }));
                  }}
                >
                  <SelectTrigger id={id}>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
          </div>
          <ModalFormField label="Description" error={expErrors.description}>
            {(id) => (
              <Input
                id={id}
                value={fDesc}
                onChange={(e) => {
                  setFDesc(e.target.value);
                  if (expErrors.description) setExpErrors((p) => ({ ...p, description: undefined }));
                }}
                placeholder="Packaging supplies — April"
              />
            )}
          </ModalFormField>
          <div className="grid grid-cols-2 gap-3">
            <ModalFormField label="Amount" error={expErrors.amount} description="In rupees (₹)">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  step="0.01"
                  value={fAmount}
                  onChange={(e) => {
                    setFAmount(e.target.value);
                    if (expErrors.amount) setExpErrors((p) => ({ ...p, amount: undefined }));
                  }}
                  placeholder="2500.00"
                />
              )}
            </ModalFormField>
            <ModalFormField label="Paid via">
              {(id) => (
                <Select value={fVia} onValueChange={setFVia}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAID_VIA.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 pb-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editExp ? "Update" : "Record Expense"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default ExpensesPage;
